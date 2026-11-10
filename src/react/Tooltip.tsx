import { cloneElement, useId, useState, type ReactElement } from 'react';
import { flag } from './cx.js';

export interface TooltipProps {
  text: string;
  side?: 'top' | 'bottom';
  /** One focusable element; it is described by the tooltip. */
  children: ReactElement<{ 'aria-describedby'?: string }>;
}

/** Extra description on hover and keyboard focus; Escape hides it. Not for
 *  essential information — touch users never see it. */
export function Tooltip({ text, side = 'top', children }: TooltipProps) {
  const id = useId();
  const [dismissed, setDismissed] = useState(false);
  const describedBy = [children.props['aria-describedby'], id].filter(Boolean).join(' ');
  return (
    <span
      className="hx-tip-host"
      data-dismissed={flag(dismissed)}
      onKeyDown={(e) => e.key === 'Escape' && setDismissed(true)}
      onMouseLeave={() => setDismissed(false)}
      onBlur={() => setDismissed(false)}
    >
      {cloneElement(children, { 'aria-describedby': describedBy })}
      <span role="tooltip" id={id} className="hx-tip" data-side={side}>
        {text}
      </span>
    </span>
  );
}
