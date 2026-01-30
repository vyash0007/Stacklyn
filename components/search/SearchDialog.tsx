"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
    Search,
    Loader2,
    X,
    Folder,
    Layout,
    Zap,
    FileText,
    Command,
    ArrowRight,
    SearchX,
    ChevronRight,
    GitCommit,
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useApi } from "@/hooks/useApi";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

// --- Types ---
type ResultType = 'project' | 'prompt' | 'commit';

interface SearchResultItem {
    id: string;
    type: ResultType;
    title: string;
    subtitle?: string;
    meta?: string;
    href: string;
}

// --- Helper Components ---

function Highlight({ text, query }: { text: string; query: string }) {
    if (!query.trim()) return <span className="opacity-95">{text}</span>;
    // Escape regex special chars in query
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escapedQuery})`, "gi"));

    return (
        <span>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <mark key={i} className="bg-zinc-300 dark:bg-white/20 text-zinc-900 dark:text-white rounded-sm px-0.5 font-bold">
                        {part}
                    </mark>
                ) : (
                    <span key={i} className="opacity-95">{part}</span>
                )
            )}
        </span>
    );
}

// --- Main Component ---

export function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const api = useApi();
    const router = useRouter();
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    // State
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<SearchResultItem[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (!open) {
            setQuery("");
            setResults([]);
            setActiveIndex(-1);
            setIsLoading(false);
        } else {
            // Slight delay to ensure focus works after animation
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    // Search Logic
    const performSearch = useCallback(async (q: string) => {
        if (!q.trim()) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const data = await api.searchWorkspace(q);

            // Transform and flatten results for easier rendering/nav
            const flattened: SearchResultItem[] = [
                ...(data.projects || []).map((p: any) => ({
                    id: p.id,
                    type: 'project' as ResultType,
                    title: p.name,
                    subtitle: p.description,
                    href: `/workspace/projects/${p.id}`
                })),
                ...(data.prompts || []).map((p: any) => ({
                    id: p.id,
                    type: 'prompt' as ResultType,
                    title: p.name,
                    subtitle: `in ${p.projects?.name || 'Unknown Project'}`,
                    href: `/prompts/${p.id}`,
                    meta: 'Prompt'
                })),
                ...(data.commits || []).map((c: any) => ({
                    id: c.id,
                    type: 'commit' as ResultType,
                    title: c.commit_message || 'Untitled Commit',
                    subtitle: `in ${c.prompts?.name || 'Unknown Prompt'}`,
                    href: `/prompts/${c.prompt_id}`,
                    meta: 'Commit'
                }))
            ];

            setResults(flattened);
            setActiveIndex(-1); // Reset selection on new results
        } catch (error) {
            console.error("Search failed:", error);
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, [api]);

    // Debounce
    // Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query) performSearch(query);
            else {
                setResults([]);
                setIsLoading(false);
            }
        }, 20);
        return () => clearTimeout(timer);
    }, [query, performSearch]);

    // Navigation Logic
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!results.length) return;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex(prev => {
                const next = prev + 1;
                if (next >= results.length) return 0; // Wrap to top
                return next;
            });
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex(prev => {
                const next = prev - 1;
                if (next < 0) return results.length - 1; // Wrap to bottom
                return next;
            });
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0 && results[activeIndex]) {
                const item = results[activeIndex];
                router.push(item.href);
                onOpenChange(false);
            } else if (results.length > 0) {
                // Optional: Enter on first result if nothing selected?
                // For now, let's strictly require selection or explicit first item hint
                // Actually, standard UX: if nothing selected, Enter does nothing or submits form.
                // Let's perform action on first item if user hasn't moved selection?
                // No, strict selection is safer as we agreed in plan.
            }
        }
    };

    // Auto-scroll to active item
    useEffect(() => {
        if (activeIndex >= 0 && listRef.current) {
            const activeElement = listRef.current.children[activeIndex] as HTMLElement;
            if (activeElement) {
                activeElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [activeIndex]);


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl w-[90vw] p-0 gap-0 overflow-hidden border border-zinc-200 dark:border-white/10 shadow-3xl bg-white dark:bg-[#0c0c0e] rounded-md sm:top-[12%] translate-y-0 sm:translate-y-0 ring-1 ring-zinc-200 dark:ring-white/5 backdrop-blur-3xl">

                {/* Header / Input Area - Fixed Height */}
                <DialogHeader className="p-4 border-b border-zinc-200 dark:border-white/5 bg-transparent sticky top-0 z-20">
                    <DialogTitle className="sr-only">Search</DialogTitle>
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-md transition-all focus-within:bg-zinc-200 dark:focus-within:bg-white/10 focus-within:border-zinc-300 dark:focus-within:border-white/20 focus-within:shadow-2xl">
                        <div className="flex items-center justify-center w-5 h-5 shrink-0">
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 text-zinc-900 dark:text-white animate-spin" />
                            ) : (
                                <Search className={cn("h-4 w-4 transition-colors", query ? "text-zinc-900 dark:text-white" : "text-zinc-400 dark:text-zinc-600")} />
                            )}
                        </div>

                        <Input
                            ref={inputRef}
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                if (e.target.value.trim()) setIsLoading(true);
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Type to search..."
                            className="flex-1 h-auto border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-0 text-base bg-transparent placeholder:text-zinc-400 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-white font-medium"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                        />

                        {query && (
                            <button
                                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                                className="p-0.5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-full text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            >
                                <span className="sr-only">Clear</span>
                                <X className="h-4 w-4" />
                            </button>
                        )}

                        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-zinc-200 dark:border-white/10 ml-1">
                            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded bg-zinc-200 dark:bg-white/5 px-1.5 font-mono text-[10px] font-bold text-zinc-500 opacity-100 border border-zinc-300 dark:border-white/5 shadow-inner">
                                <span className="text-xs">ESC</span>
                            </kbd>
                        </div>
                    </div>
                </DialogHeader>

                {/* Results Area - Fixed Height Container to prevent layout shift */}
                {/* 500px fixed height ensures stable UI */}
                <div
                    ref={listRef}
                    className="h-[500px] overflow-y-auto overflow-x-hidden bg-zinc-100/50 dark:bg-black/20 scroll-smooth"
                >
                    {!query && (
                        /* Empty State / Initial View */
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-500">
                            <div className="w-16 h-16 bg-zinc-200 dark:bg-white/5 rounded-md shadow-2xl border border-zinc-300 dark:border-white/10 flex items-center justify-center mb-8 bg-gradient-to-br from-zinc-100 dark:from-white/5 to-transparent">
                                <Command className="h-8 w-8 text-zinc-900 dark:text-white" />
                            </div>
                            <h3 className="text-zinc-900 dark:text-white font-bold uppercase tracking-[0.2em] mb-3 text-xs">Search Stacklyn</h3>
                            <p className="max-w-xs mx-auto text-xs text-zinc-500 dark:text-zinc-600 font-bold uppercase tracking-widest leading-relaxed">
                                Search for projects, prompts, and more.
                                <br /> Use <kbd className="font-sans font-bold text-zinc-700 dark:text-zinc-400">↑↓</kbd> to navigate, <kbd className="font-sans font-bold text-zinc-700 dark:text-zinc-400">Enter</kbd> to select.
                            </p>
                        </div>
                    )}

                    {query && !isLoading && results.length === 0 && (
                        /* No Results State */
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="w-16 h-16 bg-zinc-200 dark:bg-white/5 rounded-md flex items-center justify-center mb-4 border border-zinc-300 dark:border-white/10">
                                <SearchX className="h-8 w-8 text-zinc-400 dark:text-zinc-800" />
                            </div>
                            <p className="text-zinc-900 dark:text-white font-bold uppercase tracking-widest text-xs">No result protocols found</p>
                            <p className="text-[10px] text-zinc-500 dark:text-zinc-600 mt-2 font-bold uppercase tracking-[0.15em]">No matches detected for &quot;{query}&quot;</p>
                        </div>
                    )}

                    {query && results.length > 0 && (
                        /* Results List */
                        <div className="p-2 space-y-1">
                            {results.map((item, index) => {
                                const isActive = index === activeIndex;
                                return (
                                    <div
                                        key={`${item.type}-${item.id}`}
                                        onClick={() => {
                                            router.push(item.href);
                                            onOpenChange(false);
                                        }}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        className={cn(
                                            "group cursor-pointer rounded-md px-5 py-4 flex items-center gap-5 transition-all duration-200 border border-transparent",
                                            isActive
                                                ? "bg-zinc-200 dark:bg-white/5 shadow-3xl border-zinc-300 dark:border-white/10 scale-[0.99]"
                                                : "hover:bg-zinc-100 dark:hover:bg-white/[0.02] hover:scale-[0.995]"
                                        )}
                                    >
                                        {/* Icon Box */}
                                        <div className={cn(
                                            "w-12 h-12 rounded-md flex items-center justify-center shrink-0 border transition-all",
                                            isActive
                                                ? "bg-zinc-900 dark:bg-white text-white dark:text-black border-zinc-900 dark:border-white shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                                : "bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-zinc-600"
                                        )}>
                                            {item.type === 'project' ? <Folder className="h-5 w-5" /> :
                                                item.type === 'prompt' ? <Zap className="h-5 w-5" /> :
                                                    <GitCommit className="h-5 w-5" />}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className={cn("font-bold tracking-tight truncate uppercase text-sm", isActive ? "text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400")}>
                                                    <Highlight text={item.title} query={query} />
                                                </span>
                                                {item.type === 'prompt' && (
                                                    <span className="text-[9px] font-bold uppercase tracking-widest bg-zinc-900 dark:bg-white text-white dark:text-black px-2 py-0.5 rounded-sm">
                                                        Prompt
                                                    </span>
                                                )}
                                                {item.type === 'project' && (
                                                    <span className="text-[9px] font-bold uppercase tracking-widest bg-zinc-900 dark:bg-white text-white dark:text-black px-2 py-0.5 rounded-sm">
                                                        Project
                                                    </span>
                                                )}
                                                {item.type === 'commit' && (
                                                    <span className="text-[9px] font-bold uppercase tracking-widest bg-zinc-900 dark:bg-white text-white dark:text-black px-2 py-0.5 rounded-sm">
                                                        Commit
                                                    </span>
                                                )}
                                            </div>

                                            {item.subtitle && (
                                                <p className={cn("text-[11px] truncate font-medium", isActive ? "text-zinc-500" : "text-zinc-400 dark:text-zinc-700")}>
                                                    <Highlight text={item.subtitle} query={query} />
                                                </p>
                                            )}
                                        </div>

                                        {/* Arrow Hint */}
                                        <div className={cn(
                                            "text-zinc-500 transition-all duration-300",
                                            isActive ? "translate-x-0 opacity-100 text-zinc-900 dark:text-white" : "-translate-x-2 opacity-0"
                                        )}>
                                            <ChevronRight className="h-5 w-5" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {/* Footer */}
                <div className="bg-white dark:bg-[#0c0c0e] border-t border-zinc-200 dark:border-white/5 p-4 px-6 flex items-center justify-between text-[10px] text-zinc-500 dark:text-zinc-600 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-6">
                        <span className="flex items-center gap-3">
                            <span className="bg-zinc-200 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-zinc-900 dark:text-white rounded px-2 py-0.5 shadow-inner">↵</span> SELECT
                        </span>
                        <span className="flex items-center gap-3">
                            <span className="bg-zinc-200 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-zinc-900 dark:text-white rounded px-2 py-0.5 shadow-inner">↑↓</span> NAVIGATE
                        </span>
                    </span>
                    <span className="opacity-40">System Search</span>
                </div>
            </DialogContent>
        </Dialog>
    );
}
