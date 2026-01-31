"use client";

import { useState } from "react";
import { User, Shield, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsProfile } from "@/components/settings/SettingsProfile";
import { SettingsAccount } from "@/components/settings/SettingsAccount";

const tabs = [
    { id: "profile", label: "Profile", icon: User, description: "Personal details and photo" },
    { id: "account", label: "Account", icon: Shield, description: "Security and data" },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-[#181818]">
            {/* Header */}
            <div className="border-b border-zinc-200 dark:border-white/5 pb-6 pt-8 md:pb-8 md:pt-12">
                <div className="max-w-6xl px-6 md:px-8 lg:px-12">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 md:gap-8">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-light tracking-tight">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-white dark:to-zinc-500">
                                    Settings.
                                </span>
                            </h1>
                            <p className="text-sm md:text-base text-zinc-500 mt-2 md:mt-3">
                                Manage your account settings and preferences.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-6xl px-6 md:px-8 lg:px-12 py-8 md:py-12">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-64 shrink-0">
                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all group",
                                        activeTab === tab.id
                                            ? "bg-zinc-900 dark:bg-white text-white dark:text-black"
                                            : "hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-600 dark:text-zinc-400"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <tab.icon className={cn(
                                            "h-4 w-4 transition-colors",
                                            activeTab === tab.id ? "text-white dark:text-black" : "text-zinc-400 dark:text-zinc-500"
                                        )} />
                                        <div className="text-left">
                                            <div className={cn(
                                                "text-sm font-bold tracking-tight",
                                                activeTab === tab.id ? "" : "group-hover:text-zinc-900 dark:group-hover:text-white"
                                            )}>
                                                {tab.label}
                                            </div>
                                            <div className={cn(
                                                "text-[10px]",
                                                activeTab === tab.id ? "text-white/60 dark:text-black/60" : "text-zinc-400 dark:text-zinc-600"
                                            )}>
                                                {tab.description}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className={cn(
                                        "h-4 w-4 transition-all",
                                        activeTab === tab.id
                                            ? "opacity-100 text-white/60 dark:text-black/60"
                                            : "opacity-0 group-hover:opacity-50"
                                    )} />
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                        <main className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
                            <div key={activeTab}>
                                {activeTab === "profile" && <SettingsProfile />}
                                {activeTab === "account" && <SettingsAccount />}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </div>
    );
}
