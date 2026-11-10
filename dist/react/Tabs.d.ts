import { type ReactNode } from 'react';
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
export declare function Tabs({ tabs, value, onChange, variant, fullWidth, label, id, className, }: TabsProps): import("react").JSX.Element;
/** The panel of one tab; `tabs` is the `id` given to `<Tabs>`. */
export declare function TabPanel({ tabs, tab, active, className, children, }: {
    tabs: string;
    tab: string;
    active: boolean;
    className?: string;
    children?: ReactNode;
}): import("react").JSX.Element;
