"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Layers,
    Layout,
    Folder,
    Activity,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    BookOpen
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@clerk/nextjs";
import ApiKeysPanel from "@/components/settings/ApiKeysPanel";

export function Sidebar() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);

    // Close sidebar when navigating on mobile
    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    const routes = [
        {
            label: "Dashboard",
            icon: Layout,
            href: "/workspace/dashboard",
            active: pathname === "/workspace/dashboard",
        },
        {
            label: "Projects",
            icon: Folder,
            href: "/workspace/projects",
            active: pathname.startsWith("/workspace/projects"),
        },
        {
            label: "Activity",
            icon: Activity,
            href: "/workspace/activity",
            active: pathname === "/workspace/activity",
        },
    ];

    const developerRoutes = [
        {
            label: "API Keys",
            icon: Layers,
            href: "/workspace/api-keys",
            active: pathname === "/workspace/api-keys",
        },
        {
            label: "Docs",
            icon: BookOpen,
            href: "/workspace/docs",
            active: pathname === "/workspace/docs",
        },
    ];

    const settingsRoutes = [
        {
            label: "Teams",
            icon: Users,
            href: "/workspace/teams",
            active: pathname === "/workspace/teams",
        },
        {
            label: "Settings",
            icon: Settings,
            href: "/workspace/settings",
            active: pathname === "/workspace/settings",
        },
    ];

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-[60] p-2.5 bg-white/80 dark:bg-[#1F1F1F]/80 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-md lg:hidden text-zinc-700 dark:text-white shadow-lg active:scale-95 transition-all"
            >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[45] lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={cn(
                "fixed left-0 top-0 h-full w-64 bg-zinc-50 dark:bg-[#121212] border-r border-zinc-200 dark:border-white/5 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6">
                    <Link
                        href="/"
                        className="flex items-center gap-3 mb-10 group cursor-pointer"
                    >
                        <div className="w-14 h-14 rounded-md flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                            <Image
                                src="/stacklyn-logo1.png"
                                alt="Stacklyn Logo"
                                width={56}
                                height={56}
                                className="object-contain"
                            />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">Stacklyn.</span>
                    </Link>

                    <div className="space-y-8">
                        <div>
                            <h3 className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 mb-4 px-3 tracking-widest">
                                Platform
                            </h3>
                            <nav className="space-y-1">
                                {routes.map((route) => (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        className={cn(
                                            "w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-300 border border-transparent",
                                            route.active
                                                ? "bg-zinc-200 dark:bg-white/10 text-zinc-900 dark:text-white shadow-inner shadow-zinc-300/50 dark:shadow-white/5 border-zinc-300 dark:border-white/10"
                                                : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5"
                                        )}
                                    >
                                        <route.icon className={cn("h-4 w-4", route.active ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-600")} />
                                        <span className="text-xs font-medium">{route.label}</span>
                                        {route.active && (
                                            <div className="ml-auto w-1 h-1 rounded-full bg-zinc-900 dark:bg-white shadow-[0_0_5px_rgba(0,0,0,0.3)] dark:shadow-[0_0_5px_rgba(255,255,255,0.5)]"></div>
                                        )}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        <div>
                            <h3 className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 mb-4 px-3 tracking-widest">
                                Developer
                            </h3>
                            <nav className="space-y-1">
                                {developerRoutes.map((route) => (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        className={cn(
                                            "w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-300 border border-transparent",
                                            route.active
                                                ? "bg-zinc-200 dark:bg-white/10 text-zinc-900 dark:text-white shadow-inner shadow-zinc-300/50 dark:shadow-white/5 border-zinc-300 dark:border-white/10"
                                                : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5"
                                        )}
                                    >
                                        <route.icon className={cn("h-4 w-4", route.active ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-600")} />
                                        <span className="text-xs font-medium">{route.label}</span>
                                        {route.active && (
                                            <div className="ml-auto w-1 h-1 rounded-full bg-zinc-900 dark:bg-white shadow-[0_0_5px_rgba(0,0,0,0.3)] dark:shadow-[0_0_5px_rgba(255,255,255,0.5)]"></div>
                                        )}
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        <div>
                            <h3 className="text-[10px] uppercase font-bold text-zinc-400 dark:text-zinc-500 mb-4 px-3 tracking-widest">
                                Configuration
                            </h3>
                            <nav className="space-y-1">
                                {settingsRoutes.map((route) => (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        className={cn(
                                            "w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-300 border border-transparent",
                                            route.active
                                                ? "bg-zinc-200 dark:bg-white/10 text-zinc-900 dark:text-white shadow-inner shadow-zinc-300/50 dark:shadow-white/5 border-zinc-300 dark:border-white/10"
                                                : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/5"
                                        )}
                                    >
                                        <route.icon className={cn("h-4 w-4", route.active ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-600")} />
                                        <span className="text-xs font-medium">{route.label}</span>
                                        {route.active && (
                                            <div className="ml-auto w-1 h-1 rounded-full bg-zinc-900 dark:bg-white shadow-[0_0_5px_rgba(0,0,0,0.3)] dark:shadow-[0_0_5px_rgba(255,255,255,0.5)]"></div>
                                        )}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>

                <div className="mt-auto p-4 border-t border-zinc-200 dark:border-white/5 space-y-2">
                    <SignOutButton>
                        <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/5 transition-all group">
                            <LogOut className="h-4 w-4 text-zinc-400 dark:text-zinc-600 group-hover:text-zinc-900 dark:group-hover:text-white" />
                            <span className="text-xs font-medium">Log out</span>
                        </button>
                    </SignOutButton>
                </div>
            </aside>
        </>
    );
}
