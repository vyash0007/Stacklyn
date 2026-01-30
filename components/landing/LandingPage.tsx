"use client";

import { LandingNavbar } from "./LandingNavbar";
import { Hero } from "./Hero";

export function LandingPage() {
    return (
        <div className="min-h-screen bg-[#020202] text-white font-sans selection:bg-white/30 overflow-x-hidden relative">

            {/* --- Vertical Lines Background --- */}
            <div className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(to right, rgba(255, 255, 255, 0.15) 1px, transparent 1px)',
                    backgroundSize: '120px 100%'
                }}>
            </div>

            {/* --- Secondary Horizontal Grid for depth --- */}
            <div className="fixed inset-0 z-0 pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
                    backgroundSize: '100% 120px'
                }}>
            </div>

            {/* --- Ambient Lighting (Silver/White) --- */}
            {/* Top Spotlight */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-white/[0.08] to-transparent blur-[120px] pointer-events-none -z-10" />

            {/* Bottom Glows - Cool Grey */}
            <div className="fixed -bottom-40 -left-40 w-[800px] h-[800px] bg-zinc-800/20 blur-[150px] rounded-full pointer-events-none -z-10 mix-blend-screen" />
            <div className="fixed -bottom-40 -right-40 w-[800px] h-[800px] bg-slate-800/20 blur-[150px] rounded-full pointer-events-none -z-10 mix-blend-screen" />

            <LandingNavbar />
            <Hero />

            <footer className="relative z-20 pb-12 text-center text-zinc-500 text-sm">
                <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-12">
                    © {new Date().getFullYear()} Stacklyn. Built for performance and security.
                </div>
            </footer>
        </div>
    );
}
