/** Joins class names, dropping empty values. Package classes have zero
 *  specificity, so a consumer class always wins without a merge library. */
export const cx = (...parts) => parts.filter(Boolean).join(' ');
/** `true` → present-but-empty data attribute, anything else → absent. */
export const flag = (on) => (on ? '' : undefined);
