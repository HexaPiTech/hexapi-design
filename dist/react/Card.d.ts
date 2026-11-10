import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';
interface CardOwnProps {
    padding?: 'none' | 'sm' | 'md' | 'lg';
    /** No shadow: for a card nested inside another surface. */
    flat?: boolean;
}
export type CardProps = CardOwnProps & (({
    onClick?: undefined;
} & HTMLAttributes<HTMLDivElement>) | ({
    onClick: NonNullable<ButtonHTMLAttributes<HTMLButtonElement>['onClick']>;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'>));
/** A surface. With `onClick` it renders a real <button>, so it is focusable
 *  and works from the keyboard. */
export declare function Card({ padding, flat, className, ...rest }: CardProps): import("react").JSX.Element;
export {};
