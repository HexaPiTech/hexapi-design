import { jsx as _jsx } from "react/jsx-runtime";
const base = (props, d, className) => (_jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", ...props, className: [className, props.className].filter(Boolean).join(' ') || undefined, children: _jsx("path", { d: d }) }));
export const CloseIcon = (props) => base(props, 'M18 6 6 18M6 6l12 12');
/** Points to the inline-start edge: left in English, right in Arabic. */
export const ChevronStartIcon = (props) => base(props, 'm15 18-6-6 6-6', 'hx-flip-rtl');
/** Points to the inline-end edge. */
export const ChevronEndIcon = (props) => base(props, 'm9 18 6-6-6-6', 'hx-flip-rtl');
