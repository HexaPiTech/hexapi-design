import { type ReactElement } from 'react';
export interface TooltipProps {
    text: string;
    side?: 'top' | 'bottom';
    /** One focusable element; it is described by the tooltip. */
    children: ReactElement<{
        'aria-describedby'?: string;
    }>;
}
/** Extra description on hover and keyboard focus; Escape hides it. Not for
 *  essential information — touch users never see it. */
export declare function Tooltip({ text, side, children }: TooltipProps): import("react").JSX.Element;
