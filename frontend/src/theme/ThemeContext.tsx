import {type ReactNode, useEffect, useMemo, useState} from "react";
import {ThemeContext, type ThemeContextValue} from "./theme.context";
import type {Theme} from "./theme.types";

const THEME_STORAGE_KEY = "blog.theme";

interface ThemeProviderProps {
    readonly children: ReactNode;
}

class ThemeResolver {
    public static resolve(savedTheme: string | null, prefersDark: boolean): Theme {
        if (savedTheme === "light" || savedTheme === "dark") {
            return savedTheme;
        }

        return prefersDark ? "dark" : "light";
    }
}

export function ThemeProvider({children}: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window === "undefined") {
            return "dark";
        }

        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        return ThemeResolver.resolve(window.localStorage.getItem(THEME_STORAGE_KEY), prefersDark);
    });

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }, [theme]);

    const value = useMemo<ThemeContextValue>(
        () => ({
            theme,
            toggleTheme() {
                setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
            },
        }),
        [theme],
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
