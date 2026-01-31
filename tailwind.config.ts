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
            boxShadow: {
                // Minimal shadows for light mode - almost flat
                'sm': '0 1px 2px 0 rgb(0 0 0 / 0.01)',
                'DEFAULT': '0 1px 2px 0 rgb(0 0 0 / 0.02)',
                'md': '0 2px 4px -1px rgb(0 0 0 / 0.02)',
                'lg': '0 4px 6px -2px rgb(0 0 0 / 0.02)',
                'xl': '0 6px 10px -3px rgb(0 0 0 / 0.03)',
                '2xl': '0 8px 15px -4px rgb(0 0 0 / 0.04)',
                '3xl': '0 10px 20px -5px rgb(0 0 0 / 0.04)',
            },
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
