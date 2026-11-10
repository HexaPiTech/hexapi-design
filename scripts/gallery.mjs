// Component gallery: every component in light and dark, RTL and LTR, rendered
// from the compiled React layer. Open dist/gallery.html in a browser.
import { readFileSync } from 'node:fs';
import { createElement as h, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

export async function renderGallery({ version, root }) {
  const ui = await import(new URL('dist/react/index.js', root));
  const read = (f) => readFileSync(new URL(`dist/${f}`, root), 'utf8');
  const Dot = (p) =>
    h(
      'svg',
      { ...p, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2 },
      h('path', { d: 'M12 5v14M5 12h14', strokeLinecap: 'round' }),
    );
  const tones = ['brand', 'neutral', 'success', 'warning', 'danger', 'info'];
  const row = (title, ...kids) =>
    h(
      'div',
      { className: 'g-row' },
      h('h3', null, title),
      h('div', { className: 'g-items' }, ...kids),
    );
  const t = (ar, en, rtl) => (rtl ? ar : en);

  const people = (rtl) => [
    {
      id: 1,
      name: t('سارة علي', 'Sara Ali', rtl),
      group: t('روبوتات', 'Robotics', rtl),
      age: 12,
      status: 'ok',
    },
    {
      id: 2,
      name: t('عمر حسن', 'Omar Hassan', rtl),
      group: t('بايثون', 'Python', rtl),
      age: 14,
      status: 'late',
    },
    {
      id: 3,
      name: t('لينا خالد', 'Lina Khaled', rtl),
      group: t('روبوتات', 'Robotics', rtl),
      age: 10,
      status: 'ok',
    },
  ];
  const GalleryTable = ({ rtl, theme, cards, compact, loading, empty, narrow }) => {
    const sort = { key: 'name', direction: 'asc' };
    const columns = [
      { key: 'name', header: t('الطالب', 'Student', rtl), sortable: true },
      { key: 'group', header: t('المجموعة', 'Group', rtl), sortable: true, hideOnMobile: true },
      { key: 'age', header: t('العمر', 'Age', rtl), align: 'end', sortable: true, width: '6rem' },
      {
        key: 'status',
        header: t('الحالة', 'Status', rtl),
        cell: (r) =>
          h(
            ui.Badge,
            { tone: r.status === 'ok' ? 'success' : 'warning', size: 'sm' },
            r.status === 'ok' ? t('منتظم', 'On track', rtl) : t('متأخر', 'Late', rtl),
          ),
      },
    ];
    return h(ui.DataTable, {
      className: 'g-table',
      columns,
      rows: empty ? [] : people(rtl),
      rowKey: 'id',
      sort,
      onSortChange() {},
      selected: narrow || cards ? [2] : undefined,
      onSelectedChange: narrow || cards ? () => {} : undefined,
      onRowClick: compact ? () => {} : undefined,
      density: compact ? 'compact' : 'comfortable',
      loading,
      label: t('الطلاب', 'Students', rtl),
      mobileCard: cards
        ? (r) =>
            h(
              'div',
              null,
              h('strong', null, r.name),
              h('div', { style: { color: 'var(--hx-ink-muted)' } }, `${r.group} · ${r.age}`),
            )
        : undefined,
    });
  };

  const panel = (theme, rtl) =>
    h(
      'section',
      {
        className: `g-panel${theme === 'dark' ? ' dark' : ''}`,
        dir: rtl ? 'rtl' : 'ltr',
        lang: rtl ? 'ar' : 'en',
      },
      h('h2', null, `${theme} · ${rtl ? 'RTL' : 'LTR'}`),
      row(
        'Button — variant',
        ...['solid', 'soft', 'outline', 'ghost', 'link'].map((v) =>
          h(ui.Button, { key: v, variant: v }, t('حفظ', 'Save', rtl)),
        ),
      ),
      row(
        'Button — tone',
        ...tones.map((tone) => h(ui.Button, { key: tone, tone }, tone)),
        ...tones.map((tone) => h(ui.Button, { key: `s${tone}`, tone, variant: 'soft' }, tone)),
      ),
      row(
        'Button — size, icon, state',
        h(ui.Button, { size: 'sm', icon: Dot }, t('إضافة', 'Add', rtl)),
        h(ui.Button, { icon: Dot }, t('إضافة', 'Add', rtl)),
        h(ui.Button, { size: 'lg', iconEnd: Dot }, t('إضافة', 'Add', rtl)),
        h(ui.Button, { loading: true }, t('جارٍ الحفظ', 'Saving', rtl)),
        h(ui.Button, { disabled: true }, t('معطّل', 'Disabled', rtl)),
      ),
      row(
        'IconButton',
        ...tones.map((tone) =>
          h(ui.IconButton, { key: tone, icon: Dot, label: tone, tone, tinted: true }),
        ),
        h(ui.IconButton, { icon: Dot, label: 'sm', size: 'sm' }),
        h(ui.IconButton, { icon: Dot, label: 'lg', size: 'lg' }),
      ),
      row(
        'Badge',
        ...tones.map((tone) => h(ui.Badge, { key: tone, tone }, tone)),
        ...tones.map((tone) =>
          h(ui.Badge, { key: `s${tone}`, tone, variant: 'solid', size: 'sm' }, tone),
        ),
      ),
      row(
        'Alert',
        ...['info', 'success', 'warning', 'danger'].map((tone) =>
          h(
            ui.Alert,
            { key: tone, tone, style: { flex: '1 1 14rem' } },
            t('تم حفظ التغييرات على المجموعة.', 'Changes to the group were saved.', rtl),
          ),
        ),
      ),
      row(
        'Field',
        h(
          ui.Field,
          {
            label: t('الاسم', 'Name', rtl),
            hint: t('كما في الهوية', 'As on the ID', rtl),
            required: true,
            className: 'g-w',
          },
          h(ui.Input, { placeholder: t('اكتب هنا', 'Type here', rtl) }),
        ),
        h(
          ui.Field,
          {
            label: t('الفرع', 'Branch', rtl),
            error: t('هذا الحقل مطلوب', 'This field is required', rtl),
            className: 'g-w',
          },
          h(ui.Select, null, h('option', null, t('اختر', 'Choose', rtl))),
        ),
        h(
          ui.Field,
          { label: t('ملاحظات', 'Notes', rtl), className: 'g-w' },
          h(ui.Textarea, { defaultValue: t('نص', 'Text', rtl) }),
        ),
        h(
          ui.Field,
          { label: t('معطّل', 'Disabled', rtl), className: 'g-w' },
          h(ui.Input, { disabled: true, defaultValue: '—' }),
        ),
      ),
      row(
        'Choice',
        h(ui.Checkbox, { label: t('أوافق', 'I agree', rtl), defaultChecked: true }),
        h(ui.Checkbox, { label: t('غير محدد', 'Unchecked', rtl) }),
        h(ui.Radio, {
          label: t('خيار', 'Option', rtl),
          name: `r-${theme}-${rtl}`,
          defaultChecked: true,
        }),
        h(ui.Radio, { label: t('خيار آخر', 'Other', rtl), name: `r-${theme}-${rtl}` }),
        h(ui.Switch, { label: t('مفعّل', 'On', rtl), defaultChecked: true }),
        h(ui.Switch, { label: t('متوقف', 'Off', rtl) }),
      ),
      row(
        'Card, Spinner, Skeleton',
        h(ui.Card, { className: 'g-w' }, t('بطاقة عادية', 'Plain card', rtl)),
        h(
          ui.Card,
          { className: 'g-w', onClick() {} },
          t('بطاقة قابلة للنقر', 'Clickable card', rtl),
        ),
        h(ui.Spinner, { size: 'sm' }),
        h(ui.Spinner, null),
        h(ui.Spinner, { size: 'lg' }),
        h(ui.Skeleton, { style: { inlineSize: '10rem', blockSize: '2.5rem' } }),
      ),
      row(
        'Tabs — pills, underline, segmented',
        ...['pills', 'underline', 'segmented'].map((variant) =>
          h(ui.Tabs, {
            key: variant,
            variant,
            value: 'a',
            onChange() {},
            label: variant,
            tabs: [
              { id: 'a', label: t('الطلاب', 'Students', rtl), icon: Dot, count: 12 },
              { id: 'b', label: t('الحضور', 'Attendance', rtl) },
              { id: 'c', label: t('التقارير', 'Reports', rtl) },
            ],
          }),
        ),
      ),
      row(
        'SegmentedControl, Pagination',
        h(ui.SegmentedControl, {
          label: t('المدة', 'Period', rtl),
          value: 'm',
          onChange() {},
          name: `seg-${theme}-${rtl}`,
          options: [
            { value: 'w', label: t('أسبوع', 'Week', rtl) },
            { value: 'm', label: t('شهر', 'Month', rtl) },
            { value: 'y', label: t('سنة', 'Year', rtl) },
          ],
        }),
        h(ui.Pagination, { page: 6, pageCount: 20, onChange() {} }),
      ),
      row(
        'Avatar, Tooltip (hover), EmptyState',
        h(ui.Avatar, { name: t('سارة علي', 'Sara Ali', rtl), size: 'sm' }),
        h(ui.Avatar, { name: t('سارة علي', 'Sara Ali', rtl), tone: 'student' }),
        h(ui.Avatar, { name: t('سارة علي', 'Sara Ali', rtl), tone: 'instructor', size: 'lg' }),
        h(ui.Avatar, { name: t('سارة علي', 'Sara Ali', rtl), tone: 'course', size: 'xl' }),
        h(
          ui.Tooltip,
          { text: t('نسخ الرابط', 'Copy link', rtl) },
          h(ui.Button, { variant: 'outline', tone: 'neutral' }, t('مرّر هنا', 'Hover me', rtl)),
        ),
        h(ui.EmptyState, {
          className: 'g-w',
          icon: Dot,
          title: t('لا توجد نتائج', 'No results', rtl),
          description: t('جرّب كلمة بحث أخرى', 'Try another search', rtl),
          action: h(ui.Button, { size: 'sm', variant: 'soft' }, t('مسح البحث', 'Clear', rtl)),
        }),
      ),
      row(
        'Menu (open), FileInput, Range',
        h(
          'div',
          { className: 'hx-pop', role: 'menu', style: { position: 'static', animation: 'none' } },
          h(
            'button',
            { className: 'hx-menu-item', role: 'menuitem' },
            h(Dot, null),
            t('تعديل', 'Edit', rtl),
          ),
          h('button', { className: 'hx-menu-item', role: 'menuitem' }, t('نسخ', 'Duplicate', rtl)),
          h(
            'button',
            { className: 'hx-menu-item', role: 'menuitem', disabled: true },
            t('أرشفة', 'Archive', rtl),
          ),
          h(
            'button',
            { className: 'hx-menu-item', role: 'menuitem', 'data-tone': 'danger' },
            t('حذف', 'Delete', rtl),
          ),
        ),
        h(ui.FileInput, { className: 'g-w', 'aria-label': t('ملف', 'File', rtl) }),
        h(ui.Range, { className: 'g-w', defaultValue: 40, 'aria-label': t('قيمة', 'Value', rtl) }),
      ),
      row(
        'DataTable — selection, sort, row click; mobile cards below 40rem of its own width',
        h(GalleryTable, { rtl, theme, cards: true }),
        h(GalleryTable, { rtl, theme, cards: false, compact: true }),
        h(GalleryTable, { rtl, theme, loading: true }),
        h(GalleryTable, { rtl, theme, empty: true }),
        h(
          'div',
          { style: { inlineSize: '20rem' } },
          h(GalleryTable, { rtl, theme, cards: true, narrow: true }),
        ),
      ),
      row(
        'Dialog',
        h(
          'dialog',
          {
            open: true,
            className: 'hx-dialog',
            'data-size': 'sm',
            'data-placement': 'static',
            style: { position: 'static', margin: 0, animation: 'none' },
          },
          h(
            'header',
            { className: 'hx-dialog-header' },
            h('h2', { className: 'hx-dialog-title' }, t('إيقاف الاشتراك', 'Stop enrollment', rtl)),
            h(ui.IconButton, { icon: Dot, label: t('إغلاق', 'Close', rtl) }),
          ),
          h(
            'div',
            { className: 'hx-dialog-body' },
            t(
              'سيتوقف الاشتراك من التاريخ المحدد.',
              'The enrollment stops on the chosen date.',
              rtl,
            ),
          ),
          h(
            'footer',
            { className: 'hx-dialog-footer' },
            h(ui.Button, { variant: 'ghost', tone: 'neutral' }, t('إلغاء', 'Cancel', rtl)),
            h(ui.Button, { tone: 'danger' }, t('إيقاف', 'Stop', rtl)),
          ),
        ),
      ),
    );

  const body = renderToStaticMarkup(
    h(
      Fragment,
      null,
      panel('light', true),
      panel('dark', true),
      panel('light', false),
      panel('dark', false),
    ),
  );
  return `<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>@hexapi/design ${version} — components</title>
<style>${read('tokens.css')}</style><style>${read('components.css')}</style>
<style>
  body { margin: 0; font-family: var(--hx-font); display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 34rem), 1fr)); }
  .g-panel { padding: 1.5rem; background: var(--hx-canvas); color: var(--hx-ink); }
  .g-panel > h2 { margin: 0 0 1rem; font-size: 1rem; text-transform: uppercase; letter-spacing: .04em; color: var(--hx-ink-muted); }
  .g-row { margin-block-end: 1.25rem; }
  .g-row h3 { margin: 0 0 .5rem; font-size: .75rem; font-weight: 600; color: var(--hx-ink-muted); }
  .g-items { display: flex; flex-wrap: wrap; gap: .625rem; align-items: center; }
  .g-w { inline-size: 14rem; }
  .g-table { inline-size: 100%; }
</style></head><body>${body}</body></html>
`;
}
