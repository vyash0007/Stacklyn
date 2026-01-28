import { useState, useEffect } from "react";
import Link from "next/link";
import { Layers, ChevronRight, Menu, X } from "lucide-react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function LandingNavbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled
                ? "bg-white/90 backdrop-blur-lg border-b border-slate-200 py-3"
                : "bg-transparent py-5"
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <Link href="/" className="flex items-center space-x-2 cursor-pointer">
                        <div className="bg-slate-900 p-1.5 rounded-lg">
                            <Layers className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-xl font-lg tracking-tight text-slate-900 tracking-tight">
                            Stacklyn
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center space-x-8">
                        <a
                            href="#features"
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            Features
                        </a>
                        <a
                            href="#platform"
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            Platform
                        </a>
                        <a
                            href="#docs"
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            Docs
                        </a>
                        <a
                            href="#pricing"
                            className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            Pricing
                        </a>
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        <SignedOut>
                            <Link
                                href="/sign-in"
                                className="text-sm font-medium text-slate-600 hover:text-slate-900"
                            >
                                Sign in
                            </Link>
                        </SignedOut>

                        <SignedIn>
                            <UserButton />
                        </SignedIn>

                        <Link
                            href="/workspace/dashboard"
                            className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                        >
                            Start Building
                        </Link>
                    </div>

                    <div className="md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2"
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6 text-slate-900" />
                            ) : (
                                <Menu className="h-6 w-6 text-slate-900" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden mt-4 pb-4 border-t border-slate-200 pt-4">
                        <div className="flex flex-col space-y-4">
                            <a
                                href="#features"
                                className="text-sm font-medium text-slate-600 hover:text-slate-900"
                            >
                                Features
                            </a>
                            <a
                                href="#platform"
                                className="text-sm font-medium text-slate-600 hover:text-slate-900"
                            >
                                Platform
                            </a>
                            <a
                                href="#docs"
                                className="text-sm font-medium text-slate-600 hover:text-slate-900"
                            >
                                Docs
                            </a>
                            <a
                                href="#pricing"
                                className="text-sm font-medium text-slate-600 hover:text-slate-900"
                            >
                                Pricing
                            </a>
                            <Link
                                href="/login"
                                className="text-sm font-medium text-slate-600 hover:text-slate-900"
                            >
                                Sign in
                            </Link>
                            <Link
                                href="/workspace/dashboard"
                                className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-all text-center"
                            >
                                Start Building
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
