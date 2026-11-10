import { type ReactNode, type RefObject } from 'react';
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
export declare function Menu({ trigger, items, align, side, className }: MenuProps): import("react").JSX.Element;
export interface PopoverProps extends PopPlacement {
    trigger: (props: TriggerProps) => ReactNode;
    /** Accessible name of the panel. */
    label: string;
    /** Content, or a function that receives `close`. */
    children: ReactNode | ((close: () => void) => ReactNode);
    padded?: boolean;
}
/** A small non-modal panel anchored to its trigger: filters, quick forms. */
export declare function Popover({ trigger, label, children, align, side, padded, className, }: PopoverProps): import("react").JSX.Element;
export {};
