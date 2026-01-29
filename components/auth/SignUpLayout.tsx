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
}: SignUpLayoutProps) {
    return (
        <div className="flex h-screen font-sans bg-white selection:bg-indigo-100 relative flex-row overflow-hidden">

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

                <div className="mt-6 2xl:mt-12 text-center">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.25em]">
                        Frictionless Agent Infrastructure
                    </p>
                </div>
            </div>

            {/* Branding Pane (Illustration Side - RIGHT) */}
            <div className="hidden lg:flex lg:w-[55%] h-full bg-[#0F172A] relative flex-col items-center justify-center p-8 transition-all duration-1000 z-10 overflow-hidden">
                <div className="absolute inset-0 z-0 overflow-hidden">
                </div>

                <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
                    <div className="text-center self-center max-w-xl mb-4 lg:mb-6 2xl:mb-12 px-6">
                        <h2 className="text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-black tracking-tight text-white mb-2 lg:mb-4 leading-[0.95] drop-shadow-2xl">
                            {title}
                        </h2>
                    </div>

                    <div className="relative w-full h-[450px] lg:h-[480px] xl:h-[540px] flex items-center justify-center scale-100 transition-all duration-500 origin-center">
                        {/* Prompt Management Card */}
                        <div className="absolute top-4 right-[2%] w-[340px] bg-white rounded-[40px] shadow-[0_48px_96px_-24px_rgba(0,0,0,0.18)] p-10 z-30 transition-all border border-slate-50">
                            {/* ... (rest of prompt card) */}
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
                        <div className="absolute bottom-6 left-0 w-[400px] bg-white rounded-[44px] shadow-[0_56px_110px_-28px_rgba(0,0,0,0.2)] p-10 z-20 border border-white/50 backdrop-blur-sm group">
                            {/* ... (rest of collaboration card) */}
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
