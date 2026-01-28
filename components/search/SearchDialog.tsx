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
                    <mark key={i} className="bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 rounded-sm px-0 font-bold decoration-2 decoration-indigo-500/50 underline-offset-2">
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
            <DialogContent className="sm:max-w-2xl w-[90vw] p-0 gap-0 overflow-hidden border-0 shadow-2xl bg-white rounded-md sm:top-[12%] translate-y-0 sm:translate-y-0 ring-1 ring-slate-900/5">

                {/* Header / Input Area - Fixed Height */}
                <DialogHeader className="p-4 border-b border-slate-100 bg-white sticky top-0 z-20">
                    <DialogTitle className="sr-only">Search</DialogTitle>
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-md transition-all focus-within:bg-white focus-within:border-slate-300 focus-within:shadow-sm">
                        <div className="flex items-center justify-center w-5 h-5 shrink-0">
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 text-indigo-500 animate-spin" />
                            ) : (
                                <Search className={cn("h-4 w-4 transition-colors", query ? "text-indigo-500" : "text-slate-400")} />
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
                            className="flex-1 h-auto border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 py-0 text-base bg-transparent placeholder:text-slate-400 text-slate-800 font-medium"
                            autoComplete="off"
                            autoCorrect="off"
                            autoCapitalize="off"
                        />

                        {query && (
                            <button
                                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                                className="p-0.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <span className="sr-only">Clear</span>
                                <X className="h-4 w-4" />
                            </button>
                        )}

                        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 ml-1">
                            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400 opacity-100 border border-slate-200 shadow-sm">
                                <span className="text-xs">ESC</span>
                            </kbd>
                        </div>
                    </div>
                </DialogHeader>

                {/* Results Area - Fixed Height Container to prevent layout shift */}
                {/* 500px fixed height ensures stable UI */}
                <div
                    ref={listRef}
                    className="h-[500px] overflow-y-auto overflow-x-hidden bg-[#fafafa]/50 scroll-smooth"
                >
                    {!query && (
                        /* Empty State / Initial View */
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
                            <div className="w-16 h-16 bg-white rounded-md shadow-sm border border-slate-100 flex items-center justify-center mb-6">
                                <Command className="h-8 w-8 text-indigo-500/80" />
                            </div>
                            <h3 className="text-slate-900 font-semibold mb-2">Search Stacklyn</h3>
                            <p className="max-w-xs mx-auto text-sm text-slate-400 leading-relaxed">
                                Search for projects, prompts, and more.
                                <br /> Use <kbd className="font-sans font-semibold text-slate-600">↑↓</kbd> to navigate, <kbd className="font-sans font-semibold text-slate-600">Enter</kbd> to select.
                            </p>
                        </div>
                    )}

                    {query && !isLoading && results.length === 0 && (
                        /* No Results State */
                        <div className="h-full flex flex-col items-center justify-center text-center p-8">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <SearchX className="h-8 w-8 text-slate-300" />
                            </div>
                            <p className="text-slate-900 font-medium">No results found</p>
                            <p className="text-sm text-slate-400 mt-1">We couldn&apos;t find anything matching &quot;{query}&quot;</p>
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
                                            "group cursor-pointer rounded-md px-4 py-3 flex items-center gap-4 transition-all duration-200 border border-transparent",
                                            isActive
                                                ? "bg-white shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] border-slate-200/60 scale-[0.99]"
                                                : "hover:bg-slate-200/50 hover:scale-[0.995]"
                                        )}
                                    >
                                        {/* Icon Box */}
                                        <div className={cn(
                                            "w-10 h-10 rounded-md flex items-center justify-center shrink-0 border transition-colors",
                                            item.type === 'project'
                                                ? (isActive ? "bg-indigo-50 border-indigo-100 text-indigo-600" : "bg-white border-slate-200 text-slate-400")
                                                : item.type === 'prompt'
                                                    ? (isActive ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-white border-slate-200 text-slate-400")
                                                    : (isActive ? "bg-amber-50 border-amber-100 text-amber-600" : "bg-white border-slate-200 text-slate-400")
                                        )}>
                                            {item.type === 'project' ? <Folder className="h-5 w-5" /> :
                                                item.type === 'prompt' ? <Zap className="h-5 w-5" /> :
                                                    <GitCommit className="h-5 w-5" />}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className={cn("font-semibold truncate", isActive ? "text-slate-900" : "text-slate-700")}>
                                                    <Highlight text={item.title} query={query} />
                                                </span>
                                                {item.type === 'prompt' && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/70 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100/50">
                                                        Prompt
                                                    </span>
                                                )}
                                                {item.type === 'project' && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600/70 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100/50">
                                                        Project
                                                    </span>
                                                )}
                                                {item.type === 'commit' && (
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600/70 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100/50">
                                                        Commit
                                                    </span>
                                                )}
                                            </div>

                                            {item.subtitle && (
                                                <p className={cn("text-sm truncate h-5", isActive ? "text-slate-500" : "text-slate-400")}>
                                                    <Highlight text={item.subtitle} query={query} />
                                                </p>
                                            )}
                                        </div>

                                        {/* Arrow Hint */}
                                        <div className={cn(
                                            "text-slate-300 transition-transform duration-300",
                                            isActive ? "translate-x-0 opacity-100 text-indigo-400" : "-translate-x-2 opacity-0"
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
                <div className="bg-slate-50 border-t border-slate-100 p-2 px-4 flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span className="flex items-center gap-2">
                        <span className="flex items-center gap-1">
                            <span className="bg-white border border-slate-200 rounded px-1.5 shadow-sm">↵</span> to select
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="bg-white border border-slate-200 rounded px-1.5 shadow-sm">↑↓</span> to navigate
                        </span>
                    </span>
                    <span className="opacity-70">Stacklyn Search</span>
                </div>
            </DialogContent>
        </Dialog>
    );
}
