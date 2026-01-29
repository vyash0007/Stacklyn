import { Layers, Terminal, Users, Sparkles } from "lucide-react";
import Link from "next/link";
import React from "react";

interface SignUpLayoutProps {
    children: React.ReactNode;
    title?: React.ReactNode;
    subtitle?: string;
    badge?: string;
}

export function SignUpLayout({
    children,
    title = "Ship AI agents without friction",
    subtitle = "The unified platform for prompt engineering, evaluation, and production monitoring.",
    badge = "Get Started"
}: SignUpLayoutProps) {
    return (
        <div className="flex min-h-screen font-sans bg-white selection:bg-indigo-100 relative lg:flex-row-reverse flex-row overflow-hidden">

            {/* REFINED ANCHORED WAVE SEAM: Right of 55% Split */}
            {/* Reduced Width: 160px (was 300px). */}
            <div className="hidden lg:block absolute top-0 bottom-0 z-50 w-[160px] pointer-events-none left-[55%]">
                <svg className="h-full w-full" viewBox="0 0 100 1000" preserveAspectRatio="none">
                    {/* Layer 1: Subtle Pulse Background */}
                    <path
                        d="M0,0 L0,1000 C 100,800 100,200 0,0 Z"
                        fill="#6366F1"
                        opacity="0.3"
                        className="animate-pulse"
                        style={{ animationDuration: '4s' }}
                    />

                    {/* Layer 2: Main Liquid Wave (Simple Arc) */}
                    {/* Seam at 0. Bulge Right (100). */}
                    <path
                        d="M0,0 L0,1000 C 100,800 100,200 0,0 Z"
                        fill="#4F46E5"
                        className="animate-liquid-pulse"
                    />
                </svg>
            </div>

            {/* Auth Pane (Form Side - RIGHT) */}
            <div className="flex flex-col w-full lg:w-[45%] bg-white px-8 md:px-16 py-10 relative z-10 lg:pl-32">
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

            {/* Branding Pane (Illustration Side - LEFT) */}
            <div className="hidden lg:flex lg:w-[55%] bg-[#4F46E5] relative overflow-hidden flex-col items-center justify-center p-12 transition-all duration-1000 z-10">
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-[#4338CA] rounded-full blur-[120px] opacity-60 animate-pulse" />
                    <div className="absolute bottom-[-15%] left-[-5%] w-[70%] h-[70%] bg-[#6366F1] rounded-full blur-[100px] opacity-40 animate-pulse [animation-delay:3s]" />
                </div>

                <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
                    <div className="relative w-full h-[540px] flex items-center justify-center">
                        {/* Prompt Management Card */}
                        <div className="absolute top-4 right-[2%] w-[340px] bg-white rounded-[40px] shadow-[0_48px_96px_-24px_rgba(0,0,0,0.18)] p-10 animate-float z-30 transition-all border border-slate-50">
                            <div className="flex justify-between items-center mb-6">
                                <div className="space-y-1.5 text-left">
                                    <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Core Product</div>
                                    <div className="text-xl font-black text-slate-900 tracking-tight">Prompt Management</div>
                                </div>
                                <div className="h-14 w-14 bg-slate-900 rounded-[22px] flex items-center justify-center shadow-lg">
                                    <Terminal className="h-7 w-7 text-white" />
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 text-left">
                                Visually edit, A/B test, and deploy prompts. Compare usage and latency. Avoid waiting for eng redeploys.
                            </p>
                        </div>

                        {/* Collaboration Experts Card */}
                        <div className="absolute bottom-6 left-0 w-[400px] bg-white rounded-[44px] shadow-[0_56px_110px_-28px_rgba(0,0,0,0.2)] p-10 animate-float [animation-delay:1.5s] z-20 border border-white/50 backdrop-blur-sm group">
                            <div className="flex items-center space-x-5 mb-6 text-left">
                                <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                                    <Users className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 tracking-tight leading-tight">Collaboration with experts</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Non-technical Stakeholders</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6 text-left">
                                Open up prompt iteration to non-technical stakeholders. Our LLM observability allows you to find edge-cases and improve prompts.
                            </p>
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={`h-9 w-9 rounded-full border-2 border-white bg-slate-${i * 100 + 200} flex items-center justify-center shadow-md`}>
                                        <span className="text-[9px] font-black text-white">{String.fromCharCode(64 + i)}</span>
                                    </div>
                                ))}
                                <div className="h-9 w-9 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center shadow-md text-[9px] font-black text-white">
                                    +12
                                </div>
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
