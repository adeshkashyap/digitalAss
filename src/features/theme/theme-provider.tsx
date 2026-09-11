import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type Theme = "light" | "dark";

const KEY = "devassets.theme";

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
  mounted: boolean;
} | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Dark is the product's first-class theme: only an explicit stored choice
    // moves the site to light mode.
    const stored = window.localStorage.getItem(KEY) as Theme | null;
    if (stored === "light" || stored === "dark") setTheme(stored);
    setMounted(true);

  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.style.colorScheme = theme;
    if (mounted) window.localStorage.setItem(KEY, theme);
  }, [theme, mounted]);

  const toggle = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);

  return (
    <ThemeContext.Provider value={{ theme, toggle, mounted }}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
