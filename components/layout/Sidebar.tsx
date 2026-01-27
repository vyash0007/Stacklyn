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
            label: "Team",
            icon: Users,
            href: "/workspace/team",
            active: pathname === "/workspace/team",
        },
        {
            label: "Settings",
            icon: Settings,
            href: "/workspace/settings",
            active: pathname === "/workspace/settings",
        },
    ];

    return (
        <aside className="w-64 bg-[#0B0E14] border-r border-white/5 flex flex-col h-full fixed left-0 top-0 z-50">
            <div className="p-6">
                <Link
                    href="/"
                    className="flex items-center space-x-3 text-white mb-10 cursor-pointer"
                >
                    <div className="bg-[#4F46E5] p-2 rounded-lg">
                        <Layers className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">Stacklyn</span>
                </Link>

                <div className="space-y-10">
                    <div>
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">
                            Platform
                        </h3>
                        <nav className="space-y-1.5">
                            {routes.map((route) => (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    className={cn(
                                        "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all border border-transparent",
                                        route.active
                                            ? "bg-[#1A1D26] text-white border-white/5"
                                            : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                    )}
                                >
                                    <route.icon className={cn("h-4 w-4", route.active ? "text-[#6366F1]" : "text-slate-400")} />
                                    <span className="text-sm font-medium">{route.label}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div>
                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">
                            Settings
                        </h3>
                        <nav className="space-y-1.5">
                            {settingsRoutes.map((route) => (
                                <Link
                                    key={route.href}
                                    href={route.href}
                                    className={cn(
                                        "w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all border border-transparent",
                                        route.active
                                            ? "bg-[#1A1D26] text-white border-white/5"
                                            : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                                    )}
                                >
                                    <route.icon className={cn("h-4 w-4", route.active ? "text-[#6366F1]" : "text-slate-400")} />
                                    <span className="text-sm font-medium">{route.label}</span>
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            <div className="mt-auto p-4 border-t border-white/5">
                <Link
                    href="/"
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all group"
                >
                    <div className="h-7 w-7 bg-white/10 rounded-full flex items-center justify-center text-xs font-bold text-slate-300 group-hover:text-white group-hover:bg-white/20">
                        N
                    </div>
                    <span className="text-sm font-medium">Sign Out</span>
                </Link>
            </div>
        </aside>
    );
}
