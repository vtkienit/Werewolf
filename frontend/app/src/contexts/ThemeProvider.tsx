import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
export const THEME_STORAGE_KEY = "werewolf-theme";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const fallbackTheme = (): Theme => document.documentElement.dataset.theme === "light" ? "light" : "dark";
const ThemeContext = createContext<ThemeContextType>({
  theme: fallbackTheme(),
  setTheme: theme => { document.documentElement.dataset.theme = theme; localStorage.setItem(THEME_STORAGE_KEY, theme); },
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
