import {
  useEffect,
  useId,
  useRef,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import { cx } from './cx.js';
import { CloseIcon } from './icons.js';
import { IconButton } from './IconButton.js';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children?: ReactNode;
  /** Action row, pinned under the scrolling body. */
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  /** `center` becomes a bottom sheet on phones; the others dock to an edge. */
  placement?: 'center' | 'start' | 'end' | 'bottom';
  showClose?: boolean;
  closeLabel?: string;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  /** Accessible name when there is no visible `title`. */
  label?: string;
  className?: string;
}

/**
 * Modal dialog on the native `<dialog>` element: the browser traps focus,
 * makes the page behind inert, restores focus on close and handles Escape.
 * Children mount only while open, so form state resets between openings.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  placement = 'center',
  showClose = true,
  closeLabel = 'إغلاق',
  closeOnBackdrop = true,
  closeOnEscape = true,
  label,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const pressedBackdrop = useRef(false);
  const titleId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  const onCancel = (e: SyntheticEvent) => {
    e.preventDefault(); // the parent owns `open`
    if (closeOnEscape) onClose();
  };
  // A press that starts AND ends on the backdrop closes; a text selection
  // dragged out of the dialog does not.
  const onMouseDown = (e: MouseEvent) => {
    pressedBackdrop.current = e.target === ref.current;
  };
  const onClick = (e: MouseEvent) => {
    if (closeOnBackdrop && pressedBackdrop.current && e.target === ref.current) onClose();
    pressedBackdrop.current = false;
  };

  return (
    <dialog
      ref={ref}
      className={cx('hx-dialog', className)}
      data-size={size}
      data-placement={placement}
      aria-labelledby={title ? titleId : undefined}
      aria-label={title ? undefined : label}
      onCancel={onCancel}
      onClose={() => open && onClose()}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      {open ? (
        <>
          {title || showClose ? (
            <header className="hx-dialog-header">
              <h2 id={titleId} className="hx-dialog-title">
                {title}
              </h2>
              {showClose ? (
                <IconButton icon={CloseIcon} label={closeLabel} onClick={onClose} />
              ) : null}
            </header>
          ) : null}
          <div className="hx-dialog-body">{children}</div>
          {footer ? <footer className="hx-dialog-footer">{footer}</footer> : null}
        </>
      ) : null}
    </dialog>
  );
}

/** A dialog docked to the inline-end edge (or `start` / `bottom`). */
export function Drawer({
  placement = 'end',
  ...rest
}: Omit<DialogProps, 'placement' | 'size'> & { placement?: 'start' | 'end' | 'bottom' }) {
  return <Dialog {...rest} placement={placement} />;
}
