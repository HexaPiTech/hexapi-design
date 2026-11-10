/** Joins class names, dropping empty values. Package classes have zero
 *  specificity, so a consumer class always wins without a merge library. */
export declare const cx: (...parts: Array<string | false | null | undefined>) => string;
/** `true` → present-but-empty data attribute, anything else → absent. */
export declare const flag: (on: boolean | undefined) => "" | undefined;
