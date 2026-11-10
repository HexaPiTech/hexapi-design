import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';
import { cx, flag } from './cx.js';

interface CardOwnProps {
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** No shadow: for a card nested inside another surface. */
  flat?: boolean;
}

export type CardProps = CardOwnProps &
  (
    | ({ onClick?: undefined } & HTMLAttributes<HTMLDivElement>)
    | ({ onClick: NonNullable<ButtonHTMLAttributes<HTMLButtonElement>['onClick']> } & Omit<
        ButtonHTMLAttributes<HTMLButtonElement>,
        'onClick'
      >)
  );

/** A surface. With `onClick` it renders a real <button>, so it is focusable
 *  and works from the keyboard. */
export function Card({ padding = 'md', flat = false, className, ...rest }: CardProps) {
  const shared = {
    className: cx('hx-card', className),
    'data-padding': padding,
    'data-flat': flag(flat),
  };
  if (rest.onClick) {
    const { type = 'button', ...button } = rest;
    return <button type={type} {...button} {...shared} data-interactive="" />;
  }
  return <div {...(rest as HTMLAttributes<HTMLDivElement>)} {...shared} />;
}
