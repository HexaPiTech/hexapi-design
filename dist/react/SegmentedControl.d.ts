import { type ReactNode } from 'react';
export interface SegmentedOption<T extends string> {
    value: T;
    label: ReactNode;
    disabled?: boolean;
}
export interface SegmentedControlProps<T extends string> {
    options: SegmentedOption<T>[];
    value: T;
    onChange: (value: T) => void;
    /** Accessible name of the group. */
    label: string;
    name?: string;
    fullWidth?: boolean;
    className?: string;
}
/** Pick exactly one of a few options. Real radios, so arrows and forms work. */
export declare function SegmentedControl<T extends string>({ options, value, onChange, label, name, fullWidth, className, }: SegmentedControlProps<T>): import("react").JSX.Element;
