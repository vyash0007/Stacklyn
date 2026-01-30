"use client";

import { useSignIn, useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Github, Loader2, Mail, Lock, ChevronRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";


export default function CustomSignIn() {
    const { isLoaded: isSignInLoaded, signIn, setActive } = useSignIn();
    const { isLoaded: isUserLoaded, isSignedIn } = useUser();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const searchParams = useSearchParams();
    const isSsoCallback = searchParams.get("sso_callback") === "true";


    useEffect(() => {
        if (isUserLoaded && isSignedIn) {
            router.push("/workspace/dashboard");
        }
    }, [isUserLoaded, isSignedIn, router]);



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isSignInLoaded || !signIn) return;

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
        if (!isSignInLoaded || !signIn) return;

        try {
            await signIn.authenticateWithRedirect({
                strategy,
                redirectUrl: "/sign-in?sso_callback=true",
                redirectUrlComplete: "/workspace/dashboard",
            });
        } catch (err: any) {
            setError(err.errors?.[0]?.message || "Social login failed.");
        }
    };




    if (isSsoCallback) {
        return <AuthenticateWithRedirectCallback />;
    }

    return (
        <div className="w-full max-w-sm mx-auto">
            <div className="mb-6 2xl:mb-10 text-center lg:text-left">
                <h1 className="text-3xl 2xl:text-4xl font-lg tracking-tight text-zinc-900 dark:text-white mb-2 2xl:mb-3">Welcome back</h1>
                <p className="text-zinc-500 dark:text-zinc-500 font-light text-[15px] 2xl:text-[17px]">Please enter your details to sign in to your account.</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6 2xl:mb-8">
                <button
                    onClick={() => handleSocialLogin("oauth_google")}
                    className="flex items-center justify-center space-x-3 bg-white dark:bg-[#1F1F1F] border border-zinc-200 dark:border-white/5 py-2.5 2xl:py-3 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all font-lg tracking-tight text-zinc-900 dark:text-white shadow-sm"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
                    <span>Google</span>
                </button>
                <button
                    onClick={() => handleSocialLogin("oauth_github")}
                    className="flex items-center justify-center space-x-3 bg-white dark:bg-[#1F1F1F] border border-zinc-200 dark:border-white/5 py-2.5 2xl:py-3 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all font-lg tracking-tight text-zinc-900 dark:text-white shadow-sm"
                >
                    <Github className="h-5 w-5 text-zinc-900 dark:text-white" />
                    <span>GitHub</span>
                </button>
            </div>

            <div className="relative mb-6 2xl:mb-8 w-full">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-zinc-200 dark:border-white/5"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-zinc-50 dark:bg-[#181818] px-4 text-zinc-500 dark:text-zinc-500 font-lg tracking-tight">OR CONTINUE WITH EMAIL</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 2xl:space-y-4 w-full">
                {error && (
                    <div className="p-3 2xl:p-4 rounded-md bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-[13px] 2xl:text-sm font-lg tracking-tight">
                        {error}
                    </div>
                )}

                <div className="space-y-1 group text-left">
                    <label className="text-[11px] 2xl:text-xs font-lg text-zinc-500 dark:text-zinc-500 ml-1 uppercase tracking-wider group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors">Email address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@company.com"
                            className="flex h-11 2xl:h-12 w-full rounded-md border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 pl-12 pr-4 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-white/10 focus:border-zinc-300 dark:focus:border-white/20 transition-all shadow-sm"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-1 group text-left">
                    <div className="flex justify-between items-center px-1">
                        <label className="text-[11px] 2xl:text-xs font-lg text-zinc-500 dark:text-zinc-500 uppercase tracking-wider group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors">Password</label>
                        <Link href="/sign-up" className="text-[11px] 2xl:text-xs font-lg text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-wider">
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 dark:text-zinc-500" />
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="flex h-11 2xl:h-12 w-full rounded-md border border-zinc-200 dark:border-white/5 bg-white dark:bg-black/40 pl-12 pr-12 py-2 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-300 dark:focus:ring-white/10 focus:border-zinc-300 dark:focus:border-white/20 transition-all shadow-sm"
                            required
                        />
                        {password.length > 0 && (
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <div id="clerk-captcha" className="mt-2" />

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-zinc-900 dark:bg-white hover:bg-zinc-700 dark:hover:bg-zinc-200 text-white dark:text-black font-lg tracking-tight py-3 2xl:py-3.5 rounded-md shadow-lg transition-all flex items-center justify-center group disabled:opacity-70 mt-4"
                >
                    {loading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        <>
                            <span>Log in to Account</span>
                            <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </>
                    )}
                </button>
            </form>

            <p className="mt-6 2xl:mt-10 text-center text-zinc-500 dark:text-zinc-500 font-lg tracking-tight">
                Don't have an account?{" "}
                <Link href="/sign-up" className="text-zinc-900 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 font-lg tracking-tight decoration-dotted underline underline-offset-4 decoration-zinc-300 dark:decoration-white/30">
                    Sign up
                </Link>
            </p>
        </div>
    );
}

