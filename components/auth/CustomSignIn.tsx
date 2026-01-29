"use client";

import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Github, Loader2, Mail, Lock, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function CustomSignIn() {
    const { isLoaded, signIn, setActive } = useSignIn();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    if (!isLoaded) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn.create({
                identifier: email,
                password,
            });

            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                router.push("/workspace/dashboard");
            } else {
                console.error(JSON.stringify(result, null, 2));
            }
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (strategy: "oauth_google" | "oauth_github") => {
        try {
            await signIn.authenticateWithRedirect({
                strategy,
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/workspace/dashboard",
            });
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "Social login failed.");
        }
    };

    return (
        <div className="w-full max-w-sm mx-auto">
            <div className="mb-10 text-center lg:text-left animate-fade-in">
                <h1 className="text-4xl font-lg tracking-tight text-slate-900 mb-3">Hi! Welcome back</h1>
                <p className="text-slate-500 font-light text-[17px]">We're glad to see you again. Please log in to continue.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 animate-fade-in [animation-delay:100ms]">
                <button
                    onClick={() => handleSocialLogin("oauth_google")}
                    className="flex items-center justify-center space-x-3 border border-slate-200 py-3 rounded-xl hover:bg-slate-50 transition-all font-lg tracking-tight text-slate-700 shadow-sm"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
                    <span>Google</span>
                </button>
                <button
                    onClick={() => handleSocialLogin("oauth_github")}
                    className="flex items-center justify-center space-x-3 border border-slate-200 py-3 rounded-xl hover:bg-slate-50 transition-all font-lg tracking-tight text-slate-700 shadow-sm"
                >
                    <Github className="h-5 w-5 text-slate-900" />
                    <span>GitHub</span>
                </button>
            </div>

            <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-slate-100"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-slate-400 font-bold tracking-[0.2em]">OR LOGIN WITH EMAIL</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in [animation-delay:200ms]">
                {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-fade-in">
                        {error}
                    </div>
                )}
                <div className="space-y-2 group">
                    <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider group-focus-within:text-indigo-600 transition-colors">Email address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@company.com"
                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Password</label>
                        <Link href="/forgot-password" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">
                            Forgot?
                        </Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-lg tracking-tight py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center group disabled:opacity-70"
                >
                    {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <>
                            <span>Sign in to account</span>
                            <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <p className="mt-10 text-center text-slate-500 font-medium tracking-tight">
                New to Stacklyn?{" "}
                <Link href="/sign-up" className="text-indigo-600 hover:text-indigo-700 font-bold">
                    Create account
                </Link>
            </p>
        </div>
    );
}
