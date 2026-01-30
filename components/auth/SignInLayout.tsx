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
    title = "Treat your prompts like code",
    subtitle = "The unified platform for prompt engineering, evaluation, and production monitoring.",
}: SignInLayoutProps) {
    return (
        <div className="flex h-screen font-sans bg-[#181818] selection:bg-white/30 relative flex-row overflow-hidden">

            {/* REFINED ANCHORED WAVE SEAM: Left of 45% Split */}
            <div className="hidden lg:block absolute top-0 bottom-0 z-50 w-[160px] pointer-events-none left-[45%] -translate-x-full">
                <svg className="h-full w-full" viewBox="0 0 100 1000" preserveAspectRatio="none">
                    <path
                        d="M100,0 L100,1000 C 0,800 0,200 100,0 Z"
                        fill="#121212"
                        opacity="0.5"
                    />
                    <path
                        d="M100,0 L100,1000 C 0,800 0,200 100,0 Z"
                        fill="#121212"
                    />
                </svg>
            </div>

            {/* Auth Pane (Form Side - LEFT) */}
            <div className="flex flex-col w-full lg:w-[45%] h-full bg-[#181818] px-8 md:px-16 py-6 lg:py-8 relative z-10 lg:pr-32 overflow-hidden justify-center shadow-[20px_0_50px_-10px_rgba(0,0,0,0.5)] border-r border-white/5">
                <div className="flex items-center mb-6 lg:mb-10 2xl:mb-16 text-left justify-start px-2 lg:px-0">
                    <Link href="/" className="flex items-center space-x-3 group min-w-max">
                        <div className="bg-zinc-100 p-2.5 rounded-md group-hover:bg-white transition-all duration-300 shadow-md transform group-hover:rotate-6">
                            <Layers className="h-5.5 w-5.5 text-black" />
                        </div>
                        <span className="text-xl font-lg tracking-tight text-white group-hover:text-zinc-300 transition-colors whitespace-nowrap">
                            Stacklyn.
                        </span>
                    </Link>
                </div>

                <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
                    {children}
                </div>

                <div className="mt-8 2xl:mt-12 text-center">
                    <p className="text-[10px] text-zinc-600 font-lg uppercase tracking-tight opacity-50">
                        Frictionless Agent Infrastructure
                    </p>
                </div>
            </div>

            {/* Branding Pane (Illustration Side - RIGHT) */}
            <div className="hidden lg:flex lg:w-[55%] h-full bg-[#121212] relative flex-col items-center justify-center p-8 z-10 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0,transparent_70%)] pointer-events-none" />

                <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
                    <div className="text-center self-center max-w-xl mb-4 lg:mb-6 2xl:mb-12 px-6">
                        <h2 className="text-4xl lg:text-5xl xl:text-6xl font-lg tracking-tight text-white mb-2 lg:mb-4 leading-[0.95]">
                            {title}
                        </h2>
                    </div>

                    <div className="relative w-full h-[450px] lg:h-[480px] xl:h-[540px] flex items-center justify-center">
                        {/* Evaluation Card */}
                        <div className="absolute top-0 right-[5%] w-[320px] bg-[#1F1F1F]/60 backdrop-blur-xl rounded-2xl shadow-[0_48px_96px_-24px_rgba(0,0,0,0.4)] p-10 z-30 border border-white/10 text-left">
                            <div className="flex justify-between items-center mb-8">
                                <div className="space-y-1.5">
                                    <div className="text-[10px] font-lg text-zinc-500 uppercase tracking-tight">Core Product</div>
                                    <div className="text-xl font-lg text-white tracking-tight">Version Control</div>
                                </div>
                                <div className="h-14 w-14 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center">
                                    <Terminal className="h-7 w-7 text-white" />
                                </div>
                            </div>
                            <p className="text-sm text-zinc-400 font-lg tracking-tight leading-relaxed">
                                Track every change. Roll back instantly. See exactly what changed between iterations with native diffing.
                            </p>
                        </div>

                        {/* Analytics Snapshot */}
                        <div className="absolute bottom-12 left-[4%] w-[300px] bg-[#1F1F1F]/60 backdrop-blur-xl rounded-2xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] p-8 z-20 border border-white/10 text-left">
                            <div className="flex items-center justify-between mb-6">
                                <div className="h-10 w-10 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                                    <LineChart className="h-5 w-5 text-white" />
                                </div>
                                <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                    <span className="text-[9px] font-lg tracking-tight text-emerald-400">REAL-TIME</span>
                                </div>
                            </div>
                            <div className="space-y-2 mb-6">
                                <div className="text-[10px] font-lg text-zinc-500 uppercase tracking-tight">Observability</div>
                                <div className="text-2xl font-lg text-white tracking-tight tabular-nums">Production Logs</div>
                            </div>
                            <div className="h-12 w-full flex items-end justify-between space-x-1">
                                {[40, 60, 45, 80, 55, 70, 40].map((h, i) => (
                                    <div key={i} className="flex-1 bg-white/5 rounded-t-sm relative overflow-hidden">
                                        <div style={{ height: `${h}%` }} className="absolute bottom-0 w-full bg-white/40" />
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
