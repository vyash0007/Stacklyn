"use client";

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
    User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SignOutButton } from "@clerk/nextjs";

export function Sidebar() {
    const pathname = usePathname();

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
        <aside className="w-64 bg-[#0F172A] border-r border-white/5 flex flex-col h-full fixed left-0 top-0 z-50 transition-professional">
            <div className="p-6">
                <Link
                    href="/"
                    className="flex items-center space-x-3 text-white mb-10 cursor-pointer group"
                >
                    <div className="bg-slate-800 p-2 rounded-md border border-white/10 shadow-sm transition-professional group-hover:bg-slate-700">
                        <Layers className="h-5 w-5 text-white/90" />
                    </div>
                    <span className="text-xl font-lg text-white tracking-tight">Stacklyn</span>
                </Link>

                <div className="space-y-10">
                    <div>
                        <h3 className="text-[10px] font-lg tracking-tight text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">
                            Platform
                        </h3>
                        <nav className="space-y-1">
                            {routes.map((route) => (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    className={cn(
                                        "w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-professional border border-transparent",
                                        route.active
                                            ? "bg-white/10 text-white shadow-sm"
                                            : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                    )}
                                >
                                    <route.icon className={cn("h-4 w-4", route.active ? "text-[#818CF8]" : "text-slate-500")} />
                                    <span className="text-sm font-lg tracking-tight">{route.label}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-lg tracking-tight text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">
                            Settings
                        </h3>
                        <nav className="space-y-1">
                            {settingsRoutes.map((route) => (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    className={cn(
                                        "w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-professional border border-transparent",
                                        route.active
                                            ? "bg-white/10 text-white shadow-sm"
                                            : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                    )}
                                >
                                    <route.icon className={cn("h-4 w-4", route.active ? "text-[#818CF8]" : "text-slate-500")} />
                                    <span className="text-sm font-lg tracking-tight">{route.label}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            <div className="mt-auto p-4 border-t border-white/5">
                <SignOutButton>
                    <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-professional group">
                        <LogOut className="h-4 w-4 text-slate-500 group-hover:text-white" />
                        <span className="text-sm font-lg tracking-tight">Sign Out</span>
                    </button>
                </SignOutButton>
            </div>
        </aside>
    );
}
