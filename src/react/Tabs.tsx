import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { cx, flag } from './cx.js';
import type { IconType } from './types.js';

export interface TabItem {
  id: string;
  label: ReactNode;
  icon?: IconType;
  /** Small count after the label. */
  count?: number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  value: string;
  onChange: (id: string) => void;
  variant?: 'pills' | 'underline' | 'segmented';
  fullWidth?: boolean;
  /** Accessible name of the tab list. */
  label?: string;
  /** Set it to link tabs to `<TabPanel tabs={id}>` panels. */
  id?: string;
  className?: string;
}

/** Tab list with roving focus; arrow keys follow the reading direction. */
export function Tabs({
  tabs,
  value,
  onChange,
  variant = 'pills',
  fullWidth = false,
  label,
  id,
  className,
}: TabsProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const enabled = tabs.filter((t) => !t.disabled);
    const at = enabled.findIndex((t) => t.id === value);
    if (at < 0) return;
    const rtl = getComputedStyle(e.currentTarget).direction === 'rtl';
    const step =
      e.key === 'ArrowRight' ? (rtl ? -1 : 1) : e.key === 'ArrowLeft' ? (rtl ? 1 : -1) : 0;
    const next =
      e.key === 'Home'
        ? enabled[0]
        : e.key === 'End'
          ? enabled[enabled.length - 1]
          : step
            ? enabled[(at + step + enabled.length) % enabled.length]
            : undefined;
    if (!next) return;
    e.preventDefault();
    onChange(next.id);
    listRef.current?.querySelector<HTMLElement>(`[data-tab="${CSS.escape(next.id)}"]`)?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={label}
      className={cx('hx-tabs', className)}
      data-variant={variant}
      data-full={flag(fullWidth)}
      onKeyDown={onKeyDown}
    >
      {tabs.map(({ id: tabId, label: text, icon: Icon, count, disabled }) => {
        const selected = tabId === value;
        return (
          <button
            key={tabId}
            type="button"
            role="tab"
            id={id ? `${id}-tab-${tabId}` : undefined}
            aria-controls={id ? `${id}-panel-${tabId}` : undefined}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            disabled={disabled}
            data-tab={tabId}
            className="hx-tab"
            onClick={() => onChange(tabId)}
          >
            {Icon ? <Icon aria-hidden="true" /> : null}
            {text}
            {count !== undefined ? <span className="hx-count">{count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

/** The panel of one tab; `tabs` is the `id` given to `<Tabs>`. */
export function TabPanel({
  tabs,
  tab,
  active,
  className,
  children,
}: {
  tabs: string;
  tab: string;
  active: boolean;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      role="tabpanel"
      id={`${tabs}-panel-${tab}`}
      aria-labelledby={`${tabs}-tab-${tab}`}
      hidden={!active}
      tabIndex={0}
      className={className}
    >
      {active ? children : null}
    </div>
  );
}
