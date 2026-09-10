import type {Locale, LocaleOption} from "./locale.types";

export const supportedLocales: readonly Locale[] = ["pt-BR", "en"];

export const localeOptions: readonly LocaleOption[] = [
    {locale: "pt-BR", label: "PT"},
    {locale: "en", label: "EN"},
];

export const defaultLocale: Locale = "pt-BR";

export class LocaleResolver {
    public static resolve(savedLocale: string | null, navigatorLanguage: string): Locale {
        const urlLocale = LocaleResolver.getUrlLocale(window.location.pathname);

        if (urlLocale) {
            return urlLocale;
        }

        if (LocaleResolver.isLocale(savedLocale)) {
            return savedLocale;
        }

        const normalizedNavigatorLanguage = navigatorLanguage.toLowerCase();

        if (normalizedNavigatorLanguage.startsWith("en")) {
            return "en";
        }

        if (normalizedNavigatorLanguage.startsWith("pt")) {
            return "pt-BR";
        }

        return defaultLocale;
    }

    public static isLocale(value: string | null): value is Locale {
        return supportedLocales.includes(value as Locale);
    }

    private static getUrlLocale(pathname: string): Locale | null {
        const firstSegment = pathname.split("/").filter(Boolean)[0] ?? null;
        return LocaleResolver.isLocale(firstSegment) ? firstSegment : null;
    }
}
