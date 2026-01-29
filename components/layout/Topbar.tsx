"use client";

import { Search, Bell } from "lucide-react";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect } from "react";
import { SearchDialog } from "@/components/search/SearchDialog";

interface TopbarProps {
    title: string;
    breadcrumb?: string;
}

export function Topbar({ title, breadcrumb }: TopbarProps) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsSearchOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    return (
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-40 transition-professional">
            <div className="flex items-center space-x-2">
                {breadcrumb && (
                    <>
                        <span className="text-slate-400 text-[13px] font-lg tracking-tight">
                            {breadcrumb}
                        </span>
                        <span className="text-slate-300 text-sm">/</span>
                    </>
                )}
                <h1 className="text-[13px] font-lg tracking-tight text-slate-900">{title}</h1>
            </div>
            <div className="flex items-center space-x-4">
                <div
                    className="relative hidden md:block group cursor-pointer"
                    onClick={() => setIsSearchOpen(true)}
                >
                    <div className="flex items-center bg-white border border-slate-200 rounded-md transition-professional h-9 px-3 group-hover:border-slate-300 group-hover:bg-slate-50 shadow-sm">
                        <Search className="h-3.5 w-3.5 text-slate-400 mr-2.5 transition-colors group-hover:text-slate-600" />
                        <div className="text-[13px] text-slate-400 w-48 font-lg tracking-tight">
                            Search projects or prompts...
                        </div>
                        <div className="flex items-center gap-1.5 ml-2">
                            <span className="text-[10px] text-slate-400 border border-slate-200 rounded-md px-1.5 py-0.5 bg-slate-50 font-lg tracking-tight">
                                ⌘K
                            </span>
                        </div>
                    </div>
                </div>

                <button className="text-slate-400 hover:text-slate-600 transition-professional p-1.5 rounded-md hover:bg-slate-50 relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-slate-400 rounded-full ring-2 ring-white"></span>
                </button>

                <SignedIn>
                    <UserButton />
                </SignedIn>

                <SignedOut>
                    <Link href="/sign-in">
                        <button className="px-4 py-1.5 bg-slate-900 text-white text-sm font-lg tracking-tight rounded-md hover:bg-slate-800 transition-colors">
                            Sign In
                        </button>
                    </Link>
                </SignedOut>
            </div>

            <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
        </header>
    );
}
