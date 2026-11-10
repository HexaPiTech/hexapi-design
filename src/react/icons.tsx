// The few glyphs the components themselves need, so the package has no icon
// dependency. Consumers pass their own icons (lucide-react) everywhere else.
import type { SVGProps } from 'react';

const base = (props: SVGProps<SVGSVGElement>, d: string, className?: string) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
    className={[className, props.className].filter(Boolean).join(' ') || undefined}
  >
    <path d={d} />
  </svg>
);

export const CloseIcon = (props: SVGProps<SVGSVGElement>) => base(props, 'M18 6 6 18M6 6l12 12');
/** Points to the inline-start edge: left in English, right in Arabic. */
export const ChevronStartIcon = (props: SVGProps<SVGSVGElement>) =>
  base(props, 'm15 18-6-6 6-6', 'hx-flip-rtl');
/** Points to the inline-end edge. */
export const ChevronEndIcon = (props: SVGProps<SVGSVGElement>) =>
  base(props, 'm9 18 6-6-6-6', 'hx-flip-rtl');
