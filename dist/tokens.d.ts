// @hexapi/design 1.2.0 — GENERATED. Do not edit.
export type HxTheme = 'light' | 'dark';
export type HxBrand = 'club' | 'lms';
export type HxColor = 'sunken' | 'canvas' | 'surface' | 'raised' | 'line' | 'line-strong' | 'ink' | 'ink-soft' | 'ink-muted' | 'brand' | 'brand-strong' | 'brand-soft' | 'brand-ink' | 'brand-line' | 'on-brand' | 'success-solid' | 'success-soft' | 'success-ink' | 'success-line' | 'warning-solid' | 'warning-soft' | 'warning-ink' | 'warning-line' | 'danger-solid' | 'danger-soft' | 'danger-ink' | 'danger-line' | 'info-solid' | 'info-soft' | 'info-ink' | 'info-line' | 'student-solid' | 'student-soft' | 'student-ink' | 'student-line' | 'instructor-solid' | 'instructor-soft' | 'instructor-ink' | 'instructor-line' | 'course-solid' | 'course-soft' | 'course-ink' | 'course-line' | 'group-solid' | 'group-soft' | 'group-ink' | 'group-line' | 'on-solid';
export type HxTone = 'success' | 'warning' | 'danger' | 'info';
export type HxEntity = 'student' | 'instructor' | 'course' | 'group';
export interface HxTokens {
  version: string;
  light: Record<HxBrand, Record<HxColor, string>>;
  dark: Record<HxBrand, Record<HxColor, string>>;
  scale: Record<string, string> & { light: Record<string, string>; dark: Record<string, string> };
}
export declare const tokens: HxTokens;
export default tokens;
