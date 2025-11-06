"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface ThemeColors {
  primary: string;
  secondary: string;
  thirdary: string;
  name: string;
}

export const themes: Record<string, ThemeColors> = {
  default: {
    name: "Default",
    primary: "#1f4172",
    secondary: "#febbbb",
    thirdary: "#fdf0f0",
  },
  purple: {
    name: "Purple",
    primary: "#821144",
    secondary: "#CCA1BC",
    thirdary: "#F6E6E9",
  },
  blue: {
    name: "Blue",
    primary: "#20405E",
    secondary: "#74A1AF",
    thirdary: "#C1D6DC",
  },
  green: {
    name: "Green",
    primary: "#3C603C",
    secondary: "#729146",
    thirdary: "#FFF7ED",
  },
  slate: {
    name: "Slate",
    primary: "#1B3C53",
    secondary: "#456882",
    thirdary: "#D2C1B6",
  },
};

interface ThemeContextType {
  currentTheme: string;
  setTheme: (theme: string) => void;
  themeColors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<string>("default");

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("theme") || "default";
    setCurrentTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (themeName: string) => {
    const theme = themes[themeName] || themes.default;
    const root = document.documentElement;
    root.style.setProperty("--color-1", theme.primary);
    root.style.setProperty("--color-2", theme.secondary);
    root.style.setProperty("--color-3", theme.thirdary);
  };

  const setTheme = (themeName: string) => {
    setCurrentTheme(themeName);
    localStorage.setItem("theme", themeName);
    applyTheme(themeName);
  };

  const themeColors = themes[currentTheme] || themes.default;

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themeColors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
