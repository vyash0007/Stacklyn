"use client";

import { useState } from "react";
import { User, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { SettingsProfile } from "@/components/settings/SettingsProfile";
import { SettingsAccount } from "@/components/settings/SettingsAccount";

const tabs = [
    { id: "profile", label: "Profile", icon: User, description: "Personal details" },
    { id: "account", label: "Account", icon: Shield, description: "Security & billing" },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("profile");

    return (
        <div className="bg-zinc-50 dark:bg-[#181818]">
            <div className="bg-zinc-50 dark:bg-[#181818] border-b border-zinc-200 dark:border-white/5 pb-6 pt-8 md:pb-8 md:pt-12">
                <div className="max-w-4xl mx-auto px-4 md:px-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8">
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                                Settings
                            </h2>
                        </div>

                        {/* Top Navigation - Clean Pills */}
                        <div className="flex p-1 bg-zinc-200 dark:bg-white/5 rounded-xl border border-zinc-300 dark:border-white/5 overflow-x-auto no-scrollbar max-w-full">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-4 md:px-6 py-2 rounded-lg transition-all duration-200 shrink-0",
                                        activeTab === tab.id
                                            ? "bg-white dark:bg-white text-black shadow-sm"
                                            : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                    )}
                                >
                                    <tab.icon className={cn(
                                        "h-3.5 w-3.5 md:h-4 md:w-4 transition-colors",
                                        activeTab === tab.id ? "text-black" : "text-zinc-500"
                                    )} />
                                    <span className="text-xs md:text-sm font-bold tracking-tight">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
                <main className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-both">
                    <div key={activeTab}>
                        {activeTab === "profile" && <SettingsProfile />}
                        {activeTab === "account" && <SettingsAccount />}
                    </div>
                </main>
            </div>
        </div>
    );
}
