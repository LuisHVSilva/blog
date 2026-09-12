export const supportedLocales = Object.freeze(['pt-BR', 'en'] as const);
export type Locale = (typeof supportedLocales)[number];
export type Difficulty = 'foundational' | 'intermediate' | 'advanced';
export type TranslationStatus = 'draft' | 'published' | 'archived';
