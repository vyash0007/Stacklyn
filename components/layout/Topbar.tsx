"use client";

import { Search, Bell } from "lucide-react";

interface TopbarProps {
    title: string;
    breadcrumb?: string;
}

export function Topbar({ title, breadcrumb }: TopbarProps) {
    return (
        <header className="h-14 bg-white border-b border-slate-100 flex items-center justify-between px-6 sticky top-0 z-40">
            <div className="flex items-center space-x-2">
                {breadcrumb && (
                    <>
                        <span className="text-slate-400 text-[13px] font-medium">
                            {breadcrumb}
                        </span>
                        <span className="text-slate-300 text-sm">/</span>
                    </>
                )}
                <h1 className="text-[13px] font-bold text-slate-900">{title}</h1>
            </div>
            <div className="flex items-center space-x-4">
                <div className="relative hidden md:block">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="pl-9 pr-12 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-[13px] text-slate-700 placeholder-slate-400 focus:ring-1 focus:ring-indigo-500 focus:bg-white transition-all w-60"
                    />
                    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                        <span className="text-[10px] text-slate-400 border border-slate-200 rounded px-1 py-0.5 bg-white">
                            ⌘K
                        </span>
                    </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-50 relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-red-500 rounded-full ring-2 ring-white"></span>
                </button>
                <div className="h-8 w-8 bg-indigo-50 rounded-full border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-[11px] cursor-pointer hover:bg-indigo-100 transition-colors">
                    JD
                </div>
            </div>
        </header>
    );
}
