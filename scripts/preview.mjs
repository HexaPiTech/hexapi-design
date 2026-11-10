// Renders dist/preview.html: today's colours next to the candidate, in both
// themes, both brands, Arabic (RTL) and English. Self-contained, no scripts
// from the network; the Cairo face falls back to the system font offline.
import { contrast } from './lib.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const vars = (map) =>
  Object.entries(map)
    .map(([k, v]) => `--hx-${k}:${v}`)
    .join(';');
const t = (ar, en, tag = 'span', cls = '') =>
  `<${tag}${cls ? ` class="${cls}"` : ''} data-ar="${esc(ar)}" data-en="${esc(en)}">${esc(ar)}</${tag}>`;

/** What the apps do today for tones: dark tints are -900 shades (the brown). */
function todayColors(candidate, neutralToday, theme, app) {
  const c = { ...candidate, ...neutralToday };
  if (app === 'club') {
    Object.assign(c, { brand: '#0891b2', 'brand-strong': '#0e7490', 'on-brand': '#ffffff' });
    if (theme === 'dark')
      Object.assign(c, {
        'brand-soft': 'rgba(22, 78, 99, 0.3)',
        'brand-ink': '#22d3ee',
        'brand-line': '#155e75',
        'on-solid': '#ffffff',
        'warning-solid': '#d97706',
        'warning-soft': 'rgba(120, 53, 15, 0.3)',
        'warning-ink': '#fcd34d',
        'warning-line': '#92400e',
        'success-solid': '#16a34a',
        'success-soft': 'rgba(20, 83, 45, 0.3)',
        'success-ink': '#86efac',
        'success-line': '#166534',
        'danger-solid': '#dc2626',
        'danger-soft': 'rgba(127, 29, 29, 0.3)',
        'danger-ink': '#fca5a5',
        'danger-line': '#991b1b',
        'info-solid': '#2563eb',
        'info-soft': 'rgba(30, 58, 138, 0.3)',
        'info-ink': '#93c5fd',
        'info-line': '#1e40af',
        'course-soft': 'rgba(124, 45, 18, 0.3)',
        'course-line': '#9a3412',
        'student-soft': 'rgba(88, 28, 135, 0.3)',
        'student-line': '#6b21a8',
        'instructor-soft': 'rgba(30, 58, 138, 0.3)',
        'instructor-line': '#1e40af',
        'group-soft': 'rgba(19, 78, 74, 0.3)',
        'group-line': '#115e59',
      });
  } else if (theme === 'dark') {
    Object.assign(c, {
      'warning-soft': 'rgba(245, 158, 11, 0.14)',
      'warning-ink': '#b45309',
      'warning-line': '#fde68a',
    });
  }
  return c;
}

const sample = () => `
  <div class="pg">
    <div class="hd">
      <div>${t('إشتراكات الطلاب', 'Student subscriptions', 'h3')}${t('متابعة الدفعات والدورات لكل طالب', 'Payments and cycles for every student', 'p', 'sub')}</div>
      <div class="row"><button class="btn ghost">${t('تصدير', 'Export')}</button><button class="btn solid">${t('إضافة دفعة', 'Add payment')}</button></div>
    </div>
    <div class="card">
      <div class="row wrap">
        <button class="btn solid">${t('حفظ', 'Save')}</button>
        <button class="btn soft">${t('معاينة', 'Preview')}</button>
        <button class="btn outline">${t('إلغاء', 'Cancel')}</button>
        <button class="btn danger">${t('حذف', 'Delete')}</button>
        <button class="btn solid" disabled>${t('معطّل', 'Disabled')}</button>
      </div>
      <label class="fld">${t('اسم الطالب', 'Student name', 'span', 'lbl')}
        <input placeholder="…" data-ar-ph="مثال: رامي عون" data-en-ph="e.g. Rami Aoun" />
        ${t('يظهر الاسم كما في السجل', 'Shown as written in the register', 'span', 'hint')}
      </label>
      <div class="row wrap">
        ${[
          'success|مدفوع|Paid',
          'warning|متأخر|Overdue',
          'danger|ملغى|Void',
          'info|تجريبي|Trial',
          'student|طالب|Student',
          'instructor|مدرّب|Trainer',
          'course|دورة|Course',
          'group|مجموعة|Group',
        ]
          .map((x) => x.split('|'))
          .map(
            ([k, ar, en]) =>
              `<span class="bdg" style="--t-soft:var(--hx-${k}-soft);--t-ink:var(--hx-${k}-ink);--t-line:var(--hx-${k}-line)">${t(ar, en)}</span>`,
          )
          .join('')}
      </div>
      ${[
        'warning|ثلاثة طلاب تجاوزوا موعد الدفع هذا الأسبوع.|Three students are past their due date this week.',
        'success|تم حفظ التقرير الشهري.|The monthly report was saved.',
        'danger|تعذّر الاتصال بالخادم. حاول مجدداً.|Could not reach the server. Try again.',
        'info|تبدأ الدورة التالية يوم الأحد.|The next cycle starts on Sunday.',
      ]
        .map((x) => x.split('|'))
        .map(
          ([k, ar, en]) =>
            `<div class="call" style="--t-soft:var(--hx-${k}-soft);--t-ink:var(--hx-${k}-ink);--t-line:var(--hx-${k}-line)">${t(ar, en)}</div>`,
        )
        .join('')}
    </div>
    <div class="card flush">
      <table>
        <thead><tr><th>${t('الطالب', 'Student')}</th><th>${t('المجموعة', 'Group')}</th><th>${t('الحالة', 'Status')}</th></tr></thead>
        <tbody>
          <tr><td>${t('رامي جورج عون', 'Rami George Aoun')}</td><td class="soft">${t('روبوتيك — المستوى الأول', 'Robotics — level 1')}</td><td><span class="bdg" style="--t-soft:var(--hx-success-soft);--t-ink:var(--hx-success-ink);--t-line:var(--hx-success-line)">${t('حاضر', 'Present')}</span></td></tr>
          <tr class="sel"><td>${t('سارة حداد', 'Sara Haddad')}</td><td class="soft">${t('بايثون أحد 14:00', 'Python Sun 14:00')}</td><td><span class="bdg" style="--t-soft:var(--hx-warning-soft);--t-ink:var(--hx-warning-ink);--t-line:var(--hx-warning-line)">${t('متأخر', 'Late')}</span></td></tr>
          <tr><td>${t('يوسف حداد', 'Youssef Haddad')}</td><td class="muted">${t('بلا مجموعة', 'No group')}</td><td><span class="bdg" style="--t-soft:var(--hx-danger-soft);--t-ink:var(--hx-danger-ink);--t-line:var(--hx-danger-line)">${t('غائب', 'Absent')}</span></td></tr>
        </tbody>
      </table>
    </div>
    <div class="menu">${t('قائمة مرتفعة', 'Raised menu', 'b')}${t('فتح الملف', 'Open profile', 'span', 'mi on')}${t('نقل إلى مجموعة', 'Move to a group', 'span', 'mi')}</div>
  </div>`;

export function renderPreview({ version, neutral, brands, today, resolveColors }) {
  const panel = (title, colors, theme, note) =>
    `<section class="panel" data-theme-of="${theme}" style="${esc(vars(colors))}"><header>${title}${note ? `<small>${note}</small>` : ''}</header>${sample()}</section>`;
  const rows = (theme) =>
    Object.keys(brands)
      .map((brand) => {
        const cand = resolveColors(theme, brand);
        const todayN = today[brand][theme];
        return `<div class="cmp" data-brand="${brand}">
          ${panel(t('اليوم', 'Today'), todayColors(cand, todayN, theme, brand), theme, brand === 'club' ? 'club' : 'LMS')}
          ${panel(t('المقترح', 'Candidate'), cand, theme, `@hexapi/design ${version}`)}
        </div>`;
      })
      .join('');
  const swatches = (theme) => {
    const c = resolveColors(theme, 'club');
    return `<div class="sw" style="${esc(vars(c))};background:var(--hx-canvas);color:var(--hx-ink)">${Object.keys(
      neutral,
    )
      .map((k) => {
        const isInk = k.startsWith('ink');
        const r = isInk ? contrast(c[k], c.surface, c.surface).toFixed(1) : '';
        return `<div><i style="background:${c[k]}"></i><b>${k}</b><code>${c[k]}</code>${r ? `<em>${r}:1</em>` : ''}</div>`;
      })
      .join('')}</div>`;
  };
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>HexaPi design — preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap" rel="stylesheet" />
<style>
*{box-sizing:border-box}
body{margin:0;font-family:'Cairo','Segoe UI',Tahoma,system-ui,sans-serif;background:#0b0f17;color:#e6ebf2;line-height:1.5}
.top{position:sticky;top:0;z-index:5;display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;padding:12px 20px;background:#0b0f17ee;border-bottom:1px solid #1f2937;backdrop-filter:blur(8px)}
.top h1{font-size:16px;margin:0}.top small{color:#8b96a8;font-weight:400}
.seg{display:inline-flex;border:1px solid #2a3443;border-radius:999px;overflow:hidden}
.seg button{all:unset;cursor:pointer;padding:4px 14px;font-size:13px;color:#aab4c3}
.seg button[aria-pressed=true]{background:#e6ebf2;color:#0b0f17;font-weight:700}
main{padding:20px;max-width:1500px;margin:auto}
h2{font-size:15px;margin:28px 0 10px;color:#aab4c3;font-weight:600}
.cmp{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:16px;margin-bottom:16px}
body[data-brand=club] .cmp[data-brand=lms],body[data-brand=lms] .cmp[data-brand=club]{display:none}
.panel{border-radius:14px;overflow:hidden;border:1px solid #2a3443;background:var(--hx-canvas);color:var(--hx-ink)}
.panel>header{display:flex;justify-content:space-between;align-items:center;padding:8px 14px;font-size:13px;font-weight:700;background:#131a26;color:#e6ebf2;border-bottom:1px solid #2a3443}
.panel>header small{font-weight:400;color:#8b96a8;direction:ltr}
.pg{padding:16px;display:grid;gap:12px}
.hd{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.hd h3{margin:0;font-size:18px;font-weight:700;display:block}.sub{margin:0;font-size:13px;color:var(--hx-ink-soft)}
.row{display:flex;gap:8px;align-items:center}.wrap{flex-wrap:wrap}
.card{background:var(--hx-surface);border:1px solid var(--hx-line);border-radius:12px;padding:14px;display:grid;gap:12px}
.card.flush{padding:0;overflow:hidden}
.btn{font:inherit;font-size:13px;font-weight:600;height:36px;padding:0 14px;border-radius:10px;border:1px solid transparent;cursor:pointer;background:none;color:var(--hx-ink)}
.btn.solid{background:var(--hx-brand);color:var(--hx-on-brand)}
.btn.soft{background:var(--hx-brand-soft);color:var(--hx-brand-ink)}
.btn.outline{border-color:var(--hx-line-strong)}
.btn.ghost{color:var(--hx-ink-soft)}
.btn.danger{background:var(--hx-danger-solid);color:var(--hx-on-solid)}
.btn:disabled{opacity:.55;cursor:not-allowed}
.fld{display:grid;gap:4px;font-size:13px}.lbl{font-weight:600}
.fld input{font:inherit;height:40px;border-radius:10px;border:1px solid var(--hx-line-strong);background:var(--hx-surface);color:var(--hx-ink);padding:0 12px}
.fld input::placeholder{color:var(--hx-ink-muted)}
.hint,.muted{color:var(--hx-ink-muted)}.hint{font-size:12px}.soft{color:var(--hx-ink-soft)}
.bdg{font-size:12px;font-weight:600;padding:2px 10px;border-radius:999px;background:var(--t-soft);color:var(--t-ink);border:1px solid var(--t-line)}
.call{font-size:13px;padding:10px 12px;border-radius:10px;background:var(--t-soft);color:var(--t-ink);border:1px solid var(--t-line)}
table{width:100%;border-collapse:collapse;font-size:13px}
th{text-align:start;font-weight:600;color:var(--hx-ink-soft);background:var(--hx-sunken);padding:8px 14px}
td{padding:10px 14px;border-top:1px solid var(--hx-line)}
tr.sel td{background:var(--hx-brand-soft)}
.menu{justify-self:start;display:grid;gap:2px;min-width:200px;padding:6px;border-radius:12px;background:var(--hx-raised);border:1px solid var(--hx-line);font-size:13px;box-shadow:0 8px 24px rgba(0,0,0,.18)}
.menu b{padding:4px 10px;font-size:12px;color:var(--hx-ink-muted);font-weight:600}
.mi{padding:6px 10px;border-radius:8px}.mi.on{background:var(--hx-brand-soft);color:var(--hx-brand-ink)}
.sw{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;padding:14px;border-radius:14px;border:1px solid #2a3443;margin-bottom:12px}
.sw div{display:grid;gap:2px;font-size:12px}.sw i{height:44px;border-radius:8px;border:1px solid var(--hx-line)}
.sw code{direction:ltr;text-align:start;opacity:.8}.sw em{font-style:normal;opacity:.7}
</style>
</head>
<body data-brand="club">
<div class="top">
  <h1>HexaPi design <small>${version} · ${t('معاينة الألوان', 'colour preview')}</small></h1>
  <div class="row wrap">
    <div class="seg" data-set="brand"><button data-v="club" aria-pressed="true">Club</button><button data-v="lms" aria-pressed="false">LMS</button></div>
    <div class="seg" data-set="lang"><button data-v="ar" aria-pressed="true">عربي</button><button data-v="en" aria-pressed="false">English</button></div>
  </div>
</div>
<main>
  ${t('الوضع الداكن — اليوم مقابل المقترح', 'Dark theme — today vs candidate', 'h2')}
  ${rows('dark')}
  ${t('الوضع الفاتح — اليوم مقابل المقترح', 'Light theme — today vs candidate', 'h2')}
  ${rows('light')}
  ${t('الألوان المحايدة المقترحة (التباين على السطح)', 'Candidate neutrals (contrast on surface)', 'h2')}
  ${swatches('dark')}${swatches('light')}
</main>
<script>
document.querySelectorAll('.seg').forEach(function (seg) {
  seg.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    seg.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
    if (seg.dataset.set === 'brand') document.body.dataset.brand = b.dataset.v;
    else {
      var l = b.dataset.v;
      document.documentElement.lang = l; document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
      document.querySelectorAll('[data-ar]').forEach(function (n) { n.textContent = n.dataset[l]; });
      document.querySelectorAll('[data-ar-ph]').forEach(function (n) { n.placeholder = n.dataset[l + 'Ph']; });
    }
  });
});
document.querySelectorAll('[data-ar-ph]').forEach(function (n) { n.placeholder = n.dataset.arPh; });
</script>
</body>
</html>
`;
}
