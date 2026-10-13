"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

const base =
  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm transition-colors";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  return (
    <div
      role="group"
      aria-label="Theme"
      className="inline-flex rounded-full border border-ink/10 bg-white/40 p-1 backdrop-blur dark:bg-white/5"
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        className={`${base} bg-white text-ink shadow-sm dark:bg-transparent dark:text-ink/60 dark:shadow-none`}
      >
        <Sun size={14} aria-hidden="true" />
        Morning
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        className={`${base} text-ink/60 dark:bg-white/15 dark:text-ink`}
      >
        <Moon size={14} aria-hidden="true" />
        Night
      </button>
    </div>
  );
}