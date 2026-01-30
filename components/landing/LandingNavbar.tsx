"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Layers, Sparkles, Menu, X } from "lucide-react";
import Image from "next/image";
import { SignInButton, SignedIn, SignedOut, UserButton, useAuth } from "@clerk/nextjs";

export function LandingNavbar() {
    const { isSignedIn } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className="relative z-50 max-w-7xl mx-auto px-6 pt-8 pb-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 cursor-pointer group">
                <div className="w-16 h-16 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <Image
                        src="/stacklyn-logo1.png"
                        alt="Stacklyn Logo"
                        width={64}
                        height={64}
                        className="object-contain"
                    />
                </div>
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-zinc-300 transition-colors">Stacklyn.</span>
            </Link>

            {/* Center Nav Container */}
            <div className="hidden md:flex items-center px-1.5 py-1.5 bg-zinc-900/50 border border-white/10 rounded-full backdrop-blur-md shadow-2xl">
                {['Home', 'About us', 'Features', 'Pricing', 'Resources'].map((item) => (
                    <a key={item} href="#" className="px-5 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-all rounded-full hover:bg-white/10">{item}</a>
                ))}
            </div>

            <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-4">
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
                            {isSignedIn ? "Dashboard" : "Sign Up"}
                        </button>
                    </Link>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
                >
                    {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <div className="fixed inset-x-4 top-24 z-[60] bg-[#121212]/95 backdrop-blur-2xl md:hidden animate-in fade-in zoom-in-95 duration-300 px-6 py-8 rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    <div className="flex flex-col gap-5">
                        <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest mb-1 px-1">Navigation</div>
                        {['Home', 'About us', 'Features', 'Pricing', 'Resources'].map((item) => (
                            <a
                                key={item}
                                href="#"
                                onClick={() => setIsMenuOpen(false)}
                                className="text-lg font-semibold text-zinc-400 hover:text-white transition-colors px-1"
                            >
                                {item}
                            </a>
                        ))}

                        <div className="mt-4 pt-6 border-t border-white/5 flex flex-col gap-3">
                            <SignedOut>
                                <div className="grid grid-cols-2 gap-3">
                                    <Link href="/sign-in" className="w-full">
                                        <button className="w-full py-3 bg-zinc-900 border border-white/10 rounded-xl text-sm font-bold text-zinc-300 hover:text-white transition-all">
                                            Sign in
                                        </button>
                                    </Link>
                                    <Link href="/sign-up" className="w-full">
                                        <button className="w-full py-3 bg-white text-black rounded-xl text-sm font-bold shadow-lg shadow-white/5 hover:scale-[1.02] transition-all">
                                            Sign Up
                                        </button>
                                    </Link>
                                </div>
                            </SignedOut>
                            <SignedIn>
                                <Link href="/workspace/dashboard" className="w-full">
                                    <button className="w-full py-3 bg-white text-black rounded-xl text-sm font-bold shadow-lg shadow-white/5">
                                        Go to Dashboard
                                    </button>
                                </Link>
                            </SignedIn>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
