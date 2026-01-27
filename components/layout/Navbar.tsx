"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, FolderKanban } from "lucide-react";

export function Navbar() {
    const pathname = usePathname();

    const routes = [
        {
            href: "/",
            label: "Dashboard",
            icon: LayoutDashboard,
            active: pathname === "/",
        },
        {
            href: "/projects",
            label: "Projects",
            icon: FolderKanban,
            active: pathname.startsWith("/projects"),
        },
    ];

    return (
        <nav className="flex flex-col space-y-2 border-r border-zinc-200 bg-white p-4 w-64 min-h-screen dark:border-zinc-800 dark:bg-zinc-950">
            <div className="mb-8 px-4 py-2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Stacklyn
                </h1>
            </div>
            <div className="flex-1 space-y-1">
                {routes.map((route) => (
                    <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all",
                            route.active
                                ? "bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-50"
                                : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
                        )}
                    >
                        <route.icon className="h-4 w-4" />
                        {route.label}
                    </Link>
                ))}
            </div>
        </nav>
    );
}
