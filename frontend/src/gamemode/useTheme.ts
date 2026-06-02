import { useState, useEffect, useCallback } from "react";

type Theme = "dark" | "light";

export interface ThemeControl {
  theme: Theme;
  toggle: () => void;
}

export function useTheme(): ThemeControl {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("eu_theme")
        : null;
    return stored === "light" ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme === "light" ? "light" : ""
    );
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "light" ? "dark" : "light";
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("eu_theme", next);
      }
      return next;
    });
  }, []);

  return { theme, toggle };
}
