import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { cx, flag } from './cx.js';
import type { IconType } from './types.js';

/** Props to spread on the element that opens a menu or popover. */
export interface TriggerProps {
  ref: RefObject<HTMLButtonElement | null>;
  id: string;
  'aria-haspopup': 'menu' | 'dialog';
  'aria-expanded': boolean;
  'aria-controls': string | undefined;
  onClick: () => void;
}

/** Open state shared by Menu and Popover: closes on an outside press and on
 *  Escape, and Escape hands focus back to the trigger. */
function usePop(kind: 'menu' | 'dialog') {
  const [open, setOpen] = useState(false);
  const hostRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    const onPress = (e: PointerEvent) => {
      if (!hostRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPress);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPress);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const trigger: TriggerProps = {
    ref: triggerRef,
    id: `${id}-trigger`,
    'aria-haspopup': kind,
    'aria-expanded': open,
    'aria-controls': open ? `${id}-pop` : undefined,
    onClick: () => setOpen((o) => !o),
  };
  return { open, setOpen, hostRef, triggerRef, popId: `${id}-pop`, trigger };
}

interface PopPlacement {
  /** Which inline edge of the trigger the panel lines up with. */
  align?: 'start' | 'end';
  side?: 'bottom' | 'top';
  className?: string;
}

export interface MenuItem {
  id: string;
  label: ReactNode;
  icon?: IconType;
  tone?: 'danger';
  disabled?: boolean;
  onSelect: () => void;
}

export interface MenuProps extends PopPlacement {
  /** Render the opener and spread the given props on a button. */
  trigger: (props: TriggerProps) => ReactNode;
  items: MenuItem[];
}

/** Action menu: arrows move, Enter/Space choose, Escape closes. The panel is
 *  positioned inside its host, so an `overflow: hidden` ancestor clips it. */
export function Menu({ trigger, items, align = 'start', side = 'bottom', className }: MenuProps) {
  const pop = usePop('menu');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pop.open) menuRef.current?.querySelector<HTMLElement>('button:not(:disabled)')?.focus();
  }, [pop.open]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const els = [...e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled)')];
    const at = els.indexOf(document.activeElement as HTMLElement);
    const next =
      e.key === 'ArrowDown'
        ? els[(at + 1) % els.length]
        : e.key === 'ArrowUp'
          ? els[(at - 1 + els.length) % els.length]
          : e.key === 'Home'
            ? els[0]
            : e.key === 'End'
              ? els[els.length - 1]
              : undefined;
    if (e.key === 'Tab') pop.setOpen(false);
    if (!next) return;
    e.preventDefault();
    next.focus();
  };

  return (
    <span ref={pop.hostRef} className="hx-pop-host">
      {trigger(pop.trigger)}
      {pop.open ? (
        <div
          ref={menuRef}
          id={pop.popId}
          role="menu"
          aria-labelledby={pop.trigger.id}
          className={cx('hx-pop', className)}
          data-align={align}
          data-side={side}
          onKeyDown={onKeyDown}
        >
          {items.map(({ id, label, icon: Icon, tone, disabled, onSelect }) => (
            <button
              key={id}
              type="button"
              role="menuitem"
              tabIndex={-1}
              disabled={disabled}
              className="hx-menu-item"
              data-tone={tone}
              onClick={() => {
                pop.setOpen(false);
                pop.triggerRef.current?.focus();
                onSelect();
              }}
            >
              {Icon ? <Icon aria-hidden="true" /> : null}
              {label}
            </button>
          ))}
        </div>
      ) : null}
    </span>
  );
}

export interface PopoverProps extends PopPlacement {
  trigger: (props: TriggerProps) => ReactNode;
  /** Accessible name of the panel. */
  label: string;
  /** Content, or a function that receives `close`. */
  children: ReactNode | ((close: () => void) => ReactNode);
  padded?: boolean;
}

/** A small non-modal panel anchored to its trigger: filters, quick forms. */
export function Popover({
  trigger,
  label,
  children,
  align = 'start',
  side = 'bottom',
  padded = true,
  className,
}: PopoverProps) {
  const pop = usePop('dialog');
  return (
    <span ref={pop.hostRef} className="hx-pop-host">
      {trigger(pop.trigger)}
      {pop.open ? (
        <div
          id={pop.popId}
          role="dialog"
          aria-label={label}
          className={cx('hx-pop', className)}
          data-align={align}
          data-side={side}
          data-padded={flag(padded)}
        >
          {typeof children === 'function' ? children(() => pop.setOpen(false)) : children}
        </div>
      ) : null}
    </span>
  );
}
