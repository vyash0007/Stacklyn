"use client";

import * as React from "react";
import { IoSunnyOutline, IoMoonOutline } from "react-icons/io5";
import { useTheme } from "next-themes";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Only show the toggle after mounting to avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return <div className="w-8 h-8" />; // Placeholder to avoid layout shift
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors flex items-center justify-center relative group rounded-md"
            aria-label="Toggle theme"
        >
            <div className="relative h-4 w-4">
                <IoSunnyOutline className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
                <IoMoonOutline className="absolute top-0 left-0 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-indigo-400" />
            </div>
            <span className="sr-only">Toggle theme</span>
        </button>
    );
}
