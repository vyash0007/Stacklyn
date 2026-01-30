"use client";

import { LandingNavbar } from "./LandingNavbar";
import { Hero } from "./Hero";

export function LandingPage() {
    return (
        <div className="min-h-screen bg-white dark:bg-[#020202] text-zinc-900 dark:text-white font-sans selection:bg-zinc-300 dark:selection:bg-white/30 overflow-x-hidden relative">

            {/* --- Vertical Lines Background --- */}
            <div className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(to right, rgba(0, 0, 0, 0.05) 1px, transparent 1px)',
                    backgroundSize: '120px 100%'
                }}>
            </div>
            <div className="dark:block hidden fixed inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
                    backgroundSize: '120px 100%'
                }}>
            </div>

            {/* --- Secondary Horizontal Grid for depth --- */}
            <div className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.03) 1px, transparent 1px)',
                    backgroundSize: '100% 120px'
                }}>
            </div>
            <div className="dark:block hidden fixed inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
                    backgroundSize: '100% 120px'
                }}>
            </div>

            {/* --- Ambient Lighting --- */}
            {/* Top Spotlight - Light mode */}
            <div className="dark:hidden fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-zinc-200/50 to-transparent blur-[120px] pointer-events-none -z-10" />
            {/* Top Spotlight - Dark mode */}
            <div className="hidden dark:block fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-white/[0.08] to-transparent blur-[120px] pointer-events-none -z-10" />

            {/* Bottom Glows - Light mode */}
            <div className="dark:hidden fixed -bottom-40 -left-40 w-[800px] h-[800px] bg-zinc-300/30 blur-[150px] rounded-full pointer-events-none -z-10" />
            <div className="dark:hidden fixed -bottom-40 -right-40 w-[800px] h-[800px] bg-slate-300/30 blur-[150px] rounded-full pointer-events-none -z-10" />
            {/* Bottom Glows - Dark mode */}
            <div className="hidden dark:block fixed -bottom-40 -left-40 w-[800px] h-[800px] bg-zinc-800/20 blur-[150px] rounded-full pointer-events-none -z-10 mix-blend-screen" />
            <div className="hidden dark:block fixed -bottom-40 -right-40 w-[800px] h-[800px] bg-slate-800/20 blur-[150px] rounded-full pointer-events-none -z-10 mix-blend-screen" />

            <LandingNavbar />
            <Hero />

            <footer className="relative z-20 pb-12 text-center text-zinc-500 dark:text-zinc-500 text-sm">
                <div className="max-w-7xl mx-auto px-6 border-t border-zinc-200 dark:border-white/5 pt-12">
                    © {new Date().getFullYear()} Stacklyn. Built for performance and security.
                </div>
            </footer>
        </div>
    );
}
