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
        <div className="min-h-screen bg-white">
            <div className="bg-white border-b border-slate-100 pb-8 pt-12">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                                Settings
                            </h2>
                        </div>

                        {/* Top Navigation - Clean Pills */}
                        <div className="flex p-1 bg-slate-50 rounded-xl border border-slate-100">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex items-center gap-2 px-6 py-2 rounded-lg transition-all duration-200",
                                        activeTab === tab.id
                                            ? "bg-white text-indigo-600 shadow-sm border border-slate-200/50"
                                            : "text-slate-500 hover:text-slate-900"
                                    )}
                                >
                                    <tab.icon className={cn(
                                        "h-4 w-4 transition-colors",
                                        activeTab === tab.id ? "text-indigo-600" : "text-slate-400"
                                    )} />
                                    <span className="text-sm font-bold tracking-tight">{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-4xl mx-auto px-6 py-12">
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
