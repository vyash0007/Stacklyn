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
    title = "Stop managing prompts in spreadsheets",
    subtitle = "The unified platform for prompt engineering, evaluation, and production monitoring.",
}: SignUpLayoutProps) {
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

                <div className="mt-6 2xl:mt-12 text-center">
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
                        {/* Prompt Management Card */}
                        <div className="absolute top-4 right-[2%] w-[340px] bg-[#1F1F1F]/60 backdrop-blur-xl rounded-2xl shadow-[0_48px_96px_-24px_rgba(0,0,0,0.4)] p-10 z-30 transition-all border border-white/10 text-left">
                            <div className="flex justify-between items-center mb-6">
                                <div className="space-y-1.5">
                                    <div className="text-[10px] font-lg text-zinc-500 uppercase tracking-tight">Core Product</div>
                                    <div className="text-xl font-lg text-white tracking-tight">Prompt Manager</div>
                                </div>
                                <div className="h-14 w-14 bg-white p-2 text-black rounded-xl flex items-center justify-center shadow-lg">
                                    <Layers className="h-7 w-7" />
                                </div>
                            </div>
                            <p className="text-sm text-zinc-400 font-lg tracking-tight leading-relaxed mb-8">
                                Visually edit, A/B test, and deploy prompts. Compare performance. Avoid waiting for engineering redeploys.
                            </p>
                        </div>

                        {/* Collaboration Experts Card */}
                        <div className="absolute bottom-6 left-0 w-[400px] bg-[#1F1F1F]/60 backdrop-blur-xl rounded-2xl shadow-[0_56px_110px_-28px_rgba(0,0,0,0.3)] p-10 z-20 border border-white/10 group text-left">
                            <div className="flex items-center space-x-5 mb-6">
                                <div className="h-12 w-12 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center">
                                    <Users className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-lg text-white tracking-tight leading-tight">Stakeholder Access</h3>
                                    <p className="text-[10px] text-zinc-600 font-lg uppercase tracking-tight mt-0.5 opacity-50">Collaboration</p>
                                </div>
                            </div>
                            <p className="text-sm text-zinc-400 font-lg tracking-tight leading-relaxed mb-6">
                                Empower non-technical stakeholders to iterate on prompts safely. Use our LLM observability to find and fix edge-cases.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
