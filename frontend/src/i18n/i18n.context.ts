import {createContext} from "react";
import type {Locale} from "./locale.types";

export interface I18nContextValue {
    readonly locale: Locale;
    readonly setLocale: (locale: Locale) => void;
}

export const I18nContext = createContext<I18nContextValue | null>(null);
