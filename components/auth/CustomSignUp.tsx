"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Github, Loader2, Mail, Lock, User, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function CustomSignUp() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [verifying, setVerifying] = useState(false);
    const [code, setCode] = useState("");
    const router = useRouter();

    if (!isLoaded) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            await signUp.create({
                firstName,
                lastName,
                emailAddress: email,
                password,
            });

            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            setVerifying(true);
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (completeSignUp.status === "complete") {
                await setActive({ session: completeSignUp.createdSessionId });
                router.push("/workspace/dashboard");
            }
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "Invalid verification code.");
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = async (strategy: "oauth_google" | "oauth_github") => {
        try {
            await signUp.authenticateWithRedirect({
                strategy,
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/workspace/dashboard",
            });
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "Social signup failed.");
        }
    };

    if (verifying) {
        return (
            <div className="w-full max-w-sm mx-auto">
                <div className="mb-10 text-center lg:text-left font-sans">
                    <h1 className="text-4xl font-lg tracking-tight text-slate-900 mb-3">Verify email</h1>
                    <p className="text-slate-500 font-light text-lg">We sent a code to {email}.</p>
                </div>

                <form onSubmit={handleVerify} className="space-y-8">
                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-fade-in">
                            {error}
                        </div>
                    )}
                    <div className="space-y-4">
                        <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Verification Code</label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="000000"
                            className="flex h-16 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-center text-3xl font-bold tracking-[0.5em] placeholder:text-slate-200 placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-lg tracking-tight py-4 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center group disabled:opacity-70"
                    >
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Verify Account</span>}
                    </button>

                    <button
                        type="button"
                        onClick={() => setVerifying(false)}
                        className="w-full text-slate-500 text-sm font-bold hover:text-slate-700 transition-colors"
                    >
                        Change email address
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="w-full max-w-sm mx-auto">
            <div className="mb-10 text-center lg:text-left animate-fade-in">
                <h1 className="text-4xl font-lg tracking-tight text-slate-900 mb-3">Nice to meet you</h1>
                <p className="text-slate-500 font-light text-[17px]">Let's get your Stacklyn account set up in seconds.</p>
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
                    <span className="bg-white px-4 text-slate-400 font-bold tracking-[0.2em]">OR SIGN UP WITH EMAIL</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in [animation-delay:200ms]">
                {error && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium animate-fade-in">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 group">
                        <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider group-focus-within:text-indigo-600 transition-colors">First Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Jhon"
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2 group">
                        <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider group-focus-within:text-indigo-600 transition-colors">Last Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <input
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Doe"
                                className="flex h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                required
                            />
                        </div>
                    </div>
                </div>

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

                <div className="space-y-2 group">
                    <label className="text-sm font-bold text-slate-700 ml-1 uppercase tracking-wider">Password</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="8+ characters"
                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                            required
                        />
                    </div>
                </div>

                <div id="clerk-captcha" className="mt-4" />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#4F46E5] hover:bg-[#4338CA] text-white font-lg tracking-tight py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center group disabled:opacity-70"
                >
                    {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <>
                            <span>Create account</span>
                            <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <p className="mt-10 text-center text-slate-500 font-medium tracking-tight">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-indigo-600 hover:text-indigo-700 font-bold">
                    Log in
                </Link>
            </p>
        </div>
    );
}
