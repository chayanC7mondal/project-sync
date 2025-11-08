import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  effectiveTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("theme") as Theme;
    return stored || "system";
  });

  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let actualTheme: "light" | "dark";

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      actualTheme = systemTheme;
    } else {
      actualTheme = theme;
    }

    root.classList.add(actualTheme);
    setEffectiveTheme(actualTheme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Listen for system theme changes when in system mode
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      const newTheme = e.matches ? "dark" : "light";
      root.classList.add(newTheme);
      setEffectiveTheme(newTheme);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Fetch theme preference from backend (optional)
  useEffect(() => {
    const fetchThemePreference = async () => {
      try {
        const { themeAPI } = await import("@/services/api");
        const response = await themeAPI.getThemePreference();
        
        if (response.success && response.data?.theme) {
          setTheme(response.data.theme);
        }
      } catch (error) {
        console.error("Failed to fetch theme preference:", error);
      }
    };

    fetchThemePreference();
  }, []);

  const updateTheme = async (newTheme: Theme) => {
    setTheme(newTheme);
    
    // Save to backend
    try {
      const { themeAPI } = await import("@/services/api");
      await themeAPI.saveThemePreference(newTheme);
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme, effectiveTheme }}>
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
