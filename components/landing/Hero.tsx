"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import WorkspacePreview from './WorkspacePreview';

export function Hero() {
    const { isSignedIn } = useAuth();

    return (
        <section className="relative z-10 pt-24 pb-32 px-6">
            <div className="max-w-5xl mx-auto text-center">

                {/* Pill Label */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-zinc-900/50 backdrop-blur-md text-[10px] font-bold text-zinc-300 mb-8 uppercase tracking-[0.2em] shadow-lg">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    Smarter Workflow. Better Words
                </div>

                {/* Headline - High Contrast Gradient */}
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.05] animate-in fade-in slide-in-from-bottom-6 duration-700">
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600 drop-shadow-sm">
                        Stop managing prompts<br />
                        in spreadsheets.
                    </span>
                </h1>

                {/* Subtext - Brighter for readability */}
                <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light tracking-wide">
                    Treat your prompts like code. Track changes, rollback versions, and collaborate with your team in a purpose-built environment designed for the AI stack.
                </p>

                {/* CTA Buttons - Premium Monochrome */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-24">
                    <Link href={isSignedIn ? "/workspace/dashboard" : "/sign-up"} className="w-full sm:w-auto">
                        <button
                            className="w-full px-9 py-4 bg-white text-black rounded-full font-bold text-xs tracking-[0.15em] uppercase hover:bg-zinc-200 transition-all transform hover:-translate-y-1 shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                        >
                            Start For Free
                        </button>
                    </Link>
                    <button className="w-full sm:w-auto px-9 py-4 bg-black/50 border border-white/20 rounded-full text-white font-bold text-xs tracking-[0.15em] uppercase hover:bg-white/10 hover:border-white/40 transition-all backdrop-blur-sm">
                        Get A Plan
                    </button>
                </div>

                {/* --- Mac Window Frame --- */}
                <div className="relative mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-12 duration-1000 group">

                    {/* Window Container - Added Glow on Hover */}
                    <div className="rounded-xl bg-[#0B0D13] border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/5 transition-all duration-500 group-hover:ring-white/20 group-hover:shadow-[0_0_50px_rgba(255,255,255,0.05)]">

                        {/* Window Title Bar */}
                        <div className="h-10 bg-[#0c0c0e] border-b border-white/[0.08] flex items-center px-4 justify-between">
                            {/* Window Controls (Apple Colors) */}
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-[#FF5757]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                            </div>

                            {/* Address Bar Simulation */}
                            <div className="flex-1 max-w-lg mx-4">
                                <div className="bg-black/50 border border-white/5 rounded flex items-center justify-center h-6 text-[10px] text-zinc-500 font-mono gap-2 shadow-inner">
                                    <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
                                    stacklyn.com/admin
                                </div>
                            </div>

                            {/* Right Controls */}
                            <div className="flex gap-3 text-zinc-600 opacity-50">
                                <div className="w-4 h-4 border border-current rounded-full flex items-center justify-center text-[8px]">+</div>
                                <div className="w-4 h-4 border border-current rounded flex items-center justify-center text-[8px]">□</div>
                            </div>
                        </div>

                        {/* Window Content: Workspace Preview */}
                        <div className="relative bg-[#050505]">
                            {/* Gradient Overlay inside window */}
                            <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none"></div>

                            {/* The Preview Component */}
                            <div className="p-4 md:p-8">
                                <div className="rounded-xl border border-white/[0.08] overflow-hidden shadow-2xl">
                                    <WorkspacePreview />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Fade Gradient (Floor Reflection Effect) */}
                    <div className="absolute -bottom-20 left-0 right-0 h-40 bg-gradient-to-t from-[#020202] via-[#020202]/95 to-transparent z-10"></div>

                    {/* Left/Right Glows (Monochrome Silver) */}
                    <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-zinc-400/5 blur-[80px] rounded-full -z-10"></div>
                    <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-zinc-400/5 blur-[80px] rounded-full -z-10"></div>
                </div>
            </div>
        </section>
    );
}
