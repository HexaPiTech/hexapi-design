import type { ReactNode } from 'react';
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
export declare function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps): import("react").JSX.Element;
