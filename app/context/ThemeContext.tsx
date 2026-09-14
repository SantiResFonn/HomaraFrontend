"use client";

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("homara_theme") as Theme;
      if (savedTheme === "light" || savedTheme === "dark") {
        setTimeout(() => {
          setTheme(savedTheme);
          document.documentElement.classList.toggle("dark", savedTheme === "dark");
        }, 0);
      } else {
        // System preference default
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initialTheme = systemPrefersDark ? "dark" : "light";
        setTimeout(() => {
          setTheme(initialTheme);
          document.documentElement.classList.toggle("dark", systemPrefersDark);
        }, 0);
      }
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const nextTheme = prevTheme === "light" ? "dark" : "light";
      if (typeof window !== "undefined") {
        localStorage.setItem("homara_theme", nextTheme);
        document.documentElement.classList.toggle("dark", nextTheme === "dark");
      }
      return nextTheme;
    });
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme debe usarse dentro de un ThemeProvider");
  }
  return context;
}
