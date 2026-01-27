"use client";

import { LandingNavbar } from "./LandingNavbar";
import { Hero } from "./Hero";

export function LandingPage() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            <LandingNavbar />
            <Hero />
            <footer className="bg-slate-50 border-t border-slate-200 py-12 text-center text-slate-400 text-sm">
                © {new Date().getFullYear()} Stacklyn, Inc.
            </footer>
        </div>
    );
}
