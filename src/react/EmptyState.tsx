import type { ReactNode } from 'react';
import { cx } from './cx.js';
import type { IconType } from './types.js';

export interface EmptyStateProps {
  icon?: IconType;
  title: string;
  description?: ReactNode;
  /** Usually one `<Button>`. */
  action?: ReactNode;
  className?: string;
}

/** What a list, table or page shows when it has nothing to show. */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cx('hx-empty', className)}>
      {Icon ? <Icon aria-hidden="true" /> : null}
      <p className="hx-empty-title">{title}</p>
      {description ? <p className="hx-empty-text">{description}</p> : null}
      {action}
    </div>
  );
}
