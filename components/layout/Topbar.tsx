"use client";

import { Search, Sparkles } from "lucide-react";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { useState, useEffect } from "react";
import { SearchDialog } from "@/components/search/SearchDialog";
import { NotificationBell } from "@/components/notifications/NotificationBell";

import { ThemeToggle } from "@/components/ui/ThemeToggle";

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
        <header className="h-14 bg-white/80 dark:bg-[#181818]/80 backdrop-blur-md border-b border-zinc-200 dark:border-white/5 flex items-center justify-between pl-16 lg:px-6 sticky top-0 z-40 transition-all duration-300">
            <div className="flex items-center space-x-2">
                {breadcrumb && (
                    <>
                        <span className="text-zinc-400 dark:text-zinc-500 text-[11px] font-medium uppercase tracking-wider">
                            {breadcrumb}
                        </span>
                        <span className="text-zinc-300 dark:text-zinc-700 text-xs">/</span>
                    </>
                )}
                <h1 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-widest">{title}</h1>
            </div>

            <div className="flex items-center space-x-5">
                <div
                    className="relative hidden md:block group cursor-pointer"
                    onClick={() => setIsSearchOpen(true)}
                >
                    <div className="flex items-center bg-zinc-100 dark:bg-white/[0.02] border border-zinc-200 dark:border-white/5 rounded-md transition-all duration-300 h-8 px-4 group-hover:border-zinc-300 dark:group-hover:border-white/10 group-hover:bg-zinc-50 dark:group-hover:bg-white/[0.04] shadow-inner">
                        <Search className="h-3 w-3 text-zinc-400 dark:text-zinc-500 mr-3 transition-colors group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                        <div className="text-[11px] text-zinc-400 dark:text-zinc-500 w-40 font-medium tracking-wide">
                            Search everything...
                        </div>
                        <div className="flex items-center gap-1.5 ml-2">
                            <span className="text-[9px] text-zinc-500 dark:text-zinc-600 border border-zinc-200 dark:border-white/10 rounded-md px-1.5 py-0.5 bg-zinc-50 dark:bg-white/5 font-mono">
                                ⌘K
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-1">
                    <NotificationBell />
                </div>

                <div className="h-6 w-[1px] bg-zinc-200 dark:bg-white/10 mx-1"></div>

                <ThemeToggle />

                <SignedIn>
                    <div className="flex items-center gap-3">
                        <UserButton
                            appearance={{
                                elements: {
                                    userButtonAvatarBox: "h-7 w-7 border border-zinc-200 dark:border-white/10"
                                }
                            }}
                        />
                    </div>
                </SignedIn>

                <SignedOut>
                    <Link href="/sign-in">
                        <button className="px-4 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black text-[11px] font-bold uppercase tracking-wider rounded-md hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all">
                            Sign In
                        </button>
                    </Link>
                </SignedOut>
            </div>

            <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} />
        </header>
    );
}
