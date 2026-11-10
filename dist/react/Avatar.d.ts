/** First letter of the first and last word; one letter for a single word. */
export declare function initialsOf(name: string): string;
export interface AvatarProps {
    /** The person's name: alt text, and the source of the initials. */
    name: string;
    src?: string | null;
    initials?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    tone?: 'brand' | 'student' | 'instructor' | 'course' | 'group';
    className?: string;
}
/** Photo, or initials when there is no photo or it fails to load. */
export declare function Avatar({ name, src, initials, size, tone, className, }: AvatarProps): import("react").JSX.Element;
