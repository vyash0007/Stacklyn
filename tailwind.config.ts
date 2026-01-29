import type { Config } from "tailwindcss";

export default {
    darkMode: "class",
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                brand: {
                    DEFAULT: "#4F46E5",
                    muted: "#6366F1",
                    dark: "#3730A3",
                    soft: "#EEF2FF",
                },
                accent: {
                    slate: "#475569",
                    indigo: "#4338CA",
                },
                surface: {
                    hover: "#F8FAFC",
                    active: "#F1F5F9",
                }
            },
            keyframes: {
                scroll: {
                    from: { transform: "translateX(0)" },
                    to: { transform: "translateX(-50%)" },
                },
            },
            animation: {
                scroll: "scroll 40s linear infinite",
            },
            fontWeight: {
                lg: "500",
            },
        },
    },
    plugins: [],
} satisfies Config;
