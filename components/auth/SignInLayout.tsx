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
    badge = "Welcome Back"
}: SignInLayoutProps) {
    return (
        <div className="flex min-h-screen font-sans bg-white selection:bg-indigo-100 relative flex-row overflow-hidden">

            {/* REFINED ANCHORED WAVE SEAM: Left of 45% Split */}
            {/* Reduced Width: 160px (was 300px) for elegance. */}
            <div className="hidden lg:block absolute top-0 bottom-0 z-50 w-[160px] pointer-events-none left-[45%] -translate-x-full">
                <svg className="h-full w-full" viewBox="0 0 100 1000" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="wave-gradient" x1="100%" y1="0%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="#4F46E5" />
                            <stop offset="100%" stopColor="#6366F1" />
                        </linearGradient>
                    </defs>

                    {/* Layer 1: Subtle Pulse Background */}
                    <path
                        d="M100,0 L100,1000 C 0,800 0,200 100,0 Z"
                        fill="#6366F1"
                        opacity="0.3"
                        className="animate-pulse"
                        style={{ animationDuration: '4s' }}
                    />

                    {/* Layer 2: Main Liquid Wave (Simple Arc) */}
                    {/* Starts Top-Right (100,0). Ends Bottom-Right (100,1000).
                        Curve: Smooth bulge to left (x=0).
                    */}
                    <path
                        d="M100,0 L100,1000 C 0,800 0,200 100,0 Z"
                        fill="#4F46E5"
                        className="animate-liquid-pulse"
                    />
                </svg>
            </div>

            {/* Auth Pane (Form Side - LEFT) */}
            <div className="flex flex-col w-full lg:w-[45%] bg-white px-8 md:px-16 py-10 relative z-10 lg:pr-32">
                <div className="flex items-center mb-16 animate-fade-in text-left justify-start px-2 lg:px-0">
                    <Link href="/" className="flex items-center space-x-3 group min-w-max">
                        <div className="bg-slate-900 p-2.5 rounded-xl group-hover:bg-[#4F46E5] transition-all duration-300 shadow-md transform group-hover:rotate-6">
                            <Layers className="h-5.5 w-5.5 text-white" />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-[#4F46E5] transition-colors uppercase whitespace-nowrap">
                            Stacklyn
                        </span>
                    </Link>
                </div>

                <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full animate-fade-in-up">
                    {children}
                </div>

                <div className="mt-12 text-center pt-8 animate-fade-in [animation-delay:400ms]">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.25em]">
                        Frictionless Agent Infrastructure
                    </p>
                </div>
            </div>

            {/* Branding Pane (Illustration Side - RIGHT) */}
            <div className="hidden lg:flex lg:w-[55%] bg-[#4F46E5] relative overflow-hidden flex-col items-center justify-center p-12 transition-all duration-1000 z-10">
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-[#4338CA] rounded-full blur-[120px] opacity-60 animate-pulse" />
                    <div className="absolute bottom-[-15%] left-[-5%] w-[70%] h-[70%] bg-[#6366F1] rounded-full blur-[100px] opacity-40 animate-pulse [animation-delay:3s]" />
                </div>

                <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
                    <div className="relative w-full h-[540px] flex items-center justify-center">
                        {/* Evaluation Card */}
                        <div className="absolute top-0 right-[5%] w-[320px] bg-white rounded-[40px] shadow-[0_48px_96px_-24px_rgba(0,0,0,0.2)] p-10 animate-float z-30 border border-slate-50">
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
                        <div className="absolute bottom-12 left-[4%] w-[300px] bg-slate-900 rounded-[36px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] p-8 animate-float [animation-delay:2s] z-20">
                            <div className="flex items-center justify-between mb-6">
                                <div className="h-10 w-10 bg-white/10 rounded-2xl flex items-center justify-center">
                                    <LineChart className="h-5 w-5 text-indigo-300" />
                                </div>
                                <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                                    <span className="text-[9px] font-black text-emerald-400">STABLE</span>
                                </div>
                            </div>
                            <div className="space-y-2 mb-6 text-left">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Load</div>
                                <div className="text-2xl font-black text-white tabular-nums">1.4k req/s</div>
                            </div>
                            <div className="h-12 w-full flex items-end justify-between space-x-1">
                                {[40, 60, 45, 80, 55, 70, 40].map((h, i) => (
                                    <div key={i} className="flex-1 bg-indigo-500/20 rounded-t-sm relative overflow-hidden">
                                        <div style={{ height: `${h}%` }} className="absolute bottom-0 w-full bg-indigo-500 animate-pulse" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl text-white text-[12px] font-black uppercase tracking-[0.35em] mt-8 animate-fade-in-up order-first self-center mb-10 shadow-glow-indigo">
                        <Sparkles className="h-4 w-4 animate-pulse text-indigo-100" />
                        <span>{badge}</span>
                    </div>

                    <div className="text-center order-first self-center max-w-xl mb-4 px-6">
                        <h2 className="text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[0.95] animate-fade-in-up [animation-delay:150ms] drop-shadow-2xl">
                            {title}
                        </h2>
                    </div>
                </div>
            </div>
        </div>
    );
}
