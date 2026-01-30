"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Layers, Sparkles, Menu, X } from "lucide-react";
import { SignInButton, SignedIn, SignedOut, UserButton, useAuth } from "@clerk/nextjs";

export function LandingNavbar() {
    const { isSignedIn } = useAuth();
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className="relative z-50 max-w-7xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 cursor-pointer group">
                <div className="w-9 h-9 bg-gradient-to-tr from-zinc-100 to-zinc-400 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform duration-300">
                    <Layers className="h-5 w-5 text-black" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-zinc-300 transition-colors">Stacklyn.</span>
            </Link>

            {/* Center Nav Container */}
            <div className="hidden md:flex items-center px-1.5 py-1.5 bg-zinc-900/50 border border-white/10 rounded-full backdrop-blur-md shadow-2xl">
                {['Home', 'About us', 'Features', 'Pricing', 'Resources'].map((item) => (
                    <a key={item} href="#" className="px-5 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-all rounded-full hover:bg-white/10">{item}</a>
                ))}
            </div>

            <div className="flex items-center gap-4">
                <SignedOut>
                    <Link href="/sign-in">
                        <button className="text-xs font-medium text-zinc-400 hover:text-white transition-all">
                            Sign in
                        </button>
                    </Link>
                </SignedOut>

                <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                </SignedIn>

                <Link href={isSignedIn ? "/workspace/dashboard" : "/sign-up"}>
                    <button
                        className="bg-zinc-100 hover:bg-white text-black px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                    >
                        {isSignedIn ? "Go to Dashboard" : "Sign Up"}
                    </button>
                </Link>
            </div>
        </nav>
    );
}
