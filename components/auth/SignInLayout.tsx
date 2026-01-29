import { Layers, Terminal, LineChart, TestTube, Sparkles } from "lucide-react";
import Link from "next/link";
import React from "react";

interface SignInLayoutProps {
    children: React.ReactNode;
    title?: React.ReactNode;
    subtitle?: string;
    badge?: string;
}

export function SignInLayout({
    children,
    title = "Resume your AI engineering",
    subtitle = "The unified platform for prompt engineering, evaluation, and production monitoring.",
}: SignInLayoutProps) {
    return (
        <div className="flex h-screen font-sans bg-white selection:bg-indigo-100 relative flex-row overflow-hidden">

            {/* REFINED ANCHORED WAVE SEAM: Left of 45% Split */}
            {/* Reduced Width: 160px (was 300px) for elegance. */}
            {/* REFINED ANCHORED WAVE SEAM: Left of 45% Split */}
            {/* Reduced Width: 160px (was 300px) for elegance. */}
            <div className="hidden lg:block absolute top-0 bottom-0 z-50 w-[160px] pointer-events-none left-[45%] -translate-x-full">
                <svg className="h-full w-full" viewBox="0 0 100 1000" preserveAspectRatio="none">
                    {/* Layer 1: Subtle Pulse Background */}
                    <path
                        d="M100,0 L100,1000 C 0,800 0,200 100,0 Z"
                        fill="#1E293B"
                        opacity="0.3"
                        style={{ animationDuration: '4s' }}
                    />

                    {/* Layer 2: Main Liquid Wave (Simple Arc) */}
                    {/* Starts Top-Right (100,0). Ends Bottom-Right (100,1000).
                        Curve: Smooth bulge to left (x=0).
                    */}
                    <path
                        d="M100,0 L100,1000 C 0,800 0,200 100,0 Z"
                        fill="#0F172A"
                    />
                </svg>
            </div>

            {/* Auth Pane (Form Side - LEFT) */}
            <div className="flex flex-col w-full lg:w-[45%] h-full bg-white px-8 md:px-16 py-6 lg:py-8 relative z-10 lg:pr-32 overflow-hidden justify-center shadow-[10px_0_30px_-10px_rgba(0,0,0,0.05)]">
                <div className="flex items-center mb-6 lg:mb-10 2xl:mb-16 text-left justify-start px-2 lg:px-0">
                    <Link href="/" className="flex items-center space-x-3 group min-w-max">
                        <div className="bg-slate-900 p-2.5 rounded-xl group-hover:bg-[#0F172A] transition-all duration-300 shadow-md transform group-hover:rotate-6">
                            <Layers className="h-5.5 w-5.5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-[#0F172A] transition-colors whitespace-nowrap">
                            Stacklyn
                        </span>
                    </Link>
                </div>

                <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full animate-fade-in-up">
                    {children}
                </div>

                <div className="mt-8 2xl:mt-12 text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.25em]">
                        Frictionless Agent Infrastructure
                    </p>
                </div>
            </div>

            {/* Branding Pane (Illustration Side - RIGHT) */}
            <div className="hidden lg:flex lg:w-[55%] h-full bg-[#0F172A] relative flex-col items-center justify-center p-8 transition-all duration-1000 z-10 overflow-hidden">

                <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
                    <div className="text-center self-center max-w-xl mb-4 lg:mb-6 2xl:mb-12 px-6">
                        <h2 className="text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black tracking-tight text-white mb-2 lg:mb-4 leading-[0.95] drop-shadow-2xl">
                            {title}
                        </h2>
                    </div>

                    <div className="relative w-full h-[450px] lg:h-[480px] xl:h-[540px] flex items-center justify-center scale-100 transition-all duration-500 origin-center">
                        {/* Evaluation Card */}
                        <div className="absolute top-0 right-[5%] w-[320px] bg-white rounded-[40px] shadow-[0_48px_96px_-24px_rgba(0,0,0,0.2)] p-10 z-30 border border-slate-50">
                            {/* ... (rest of evaluation card) */}
                            <div className="flex justify-between items-center mb-8">
                                <div className="space-y-1.5 text-left">
                                    <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Platform</div>
                                    <div className="text-xl font-black text-slate-900 tracking-tight">Prompt Evaluation</div>
                                </div>
                                <div className="h-14 w-14 bg-emerald-50 rounded-[22px] flex items-center justify-center">
                                    <TestTube className="h-7 w-7 text-emerald-600" />
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 text-left">
                                Evaluate prompts against usage history. Compare models. Schedule regression tests. Build one-off batch runs.
                            </p>
                        </div>

                        {/* Analytics Snapshot */}
                        <div className="absolute bottom-12 left-[4%] w-[300px] bg-white rounded-[36px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] p-8 z-20">
                            {/* ... (rest of analytics card) */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
                                    <LineChart className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                    <span className="text-[9px] font-black text-emerald-400">STABLE</span>
                                </div>
                            </div>
                            <div className="space-y-2 mb-6 text-left">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Load</div>
                                <div className="text-2xl font-black text-slate-900 tabular-nums">1.4k req/s</div>
                            </div>
                            <div className="h-12 w-full flex items-end justify-between space-x-1">
                                {[40, 60, 45, 80, 55, 70, 40].map((h, i) => (
                                    <div key={i} className="flex-1 bg-indigo-100 rounded-t-sm relative overflow-hidden">
                                        <div style={{ height: `${h}%` }} className="absolute bottom-0 w-full bg-indigo-500" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
