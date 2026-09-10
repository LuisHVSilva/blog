import {type ReactNode, useEffect, useMemo, useState} from "react";
import {I18nContext, type I18nContextValue} from "./i18n.context";
import {defaultLocale, LocaleResolver} from "./i18n.data";
import type {Locale} from "./locale.types";

const I18N_STORAGE_KEY = "blog.locale";

interface I18nProviderProps {
    readonly children: ReactNode;
}

export function I18nProvider({children}: I18nProviderProps) {
    const [locale, updateLocale] = useState<Locale>(() => {
        if (typeof window === "undefined") {
            return defaultLocale;
        }

        return LocaleResolver.resolve(window.localStorage.getItem(I18N_STORAGE_KEY), window.navigator.language);
    });

    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    const value = useMemo<I18nContextValue>(
        () => ({
            locale,
            setLocale(nextLocale) {
                updateLocale(nextLocale);
                window.localStorage.setItem(I18N_STORAGE_KEY, nextLocale);
                document.documentElement.lang = nextLocale;
            },
        }),
        [locale],
    );

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
