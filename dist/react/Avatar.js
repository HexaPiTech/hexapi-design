import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from 'react';
import { cx } from './cx.js';
/** First letter of the first and last word; one letter for a single word. */
export function initialsOf(name) {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (!words.length)
        return '';
    const first = [...words[0]][0] ?? '';
    const last = words.length > 1 ? ([...words[words.length - 1]][0] ?? '') : '';
    return (first + last).toUpperCase();
}
/** Photo, or initials when there is no photo or it fails to load. */
export function Avatar({ name, src, initials, size = 'md', tone = 'brand', className, }) {
    const [failed, setFailed] = useState(null);
    const showImage = !!src && failed !== src;
    return (_jsx("span", { className: cx('hx-avatar', className), "data-size": size, "data-tone": tone, role: showImage ? undefined : 'img', "aria-label": showImage ? undefined : name, children: showImage ? (_jsx("img", { src: src, alt: name, loading: "lazy", decoding: "async", onError: () => setFailed(src) })) : ((initials ?? initialsOf(name))) }));
}
