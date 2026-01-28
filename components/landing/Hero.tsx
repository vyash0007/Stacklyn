"use client";

import Link from "next/link";
import {
    Layers,
    ChevronRight,
    Zap,
    Terminal,
} from "lucide-react";
import WorkspacePreview from "./WorkspacePreview";

export function Hero() {
    const companies = [
        "TOPLINE PRO", "ABRIDGE", "POSTMAN", "SERHANT.", "GORGIAS", "ZILLOW", "CLICKUP", "SEGMENT"
    ];

    return (
        <section className="relative pt-32 pb-20 overflow-hidden bg-white">
            {/* Split Hero Content */}
            <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16 lg:pt-12">
                {/* Left Side: Content */}
                <div className="lg:w-1/2 text-left z-10">
                    <h1 className="text-[52px] lg:text-[72px] font-lg  text-slate-900 tracking-tight leading-[1.05] mb-8">
                        Your <br />workbench for <br />
                        AI engineering
                    </h1>
                    <p className="text-[19px] text-slate-500 mb-10 max-w-xl leading-relaxed font-light">
                        Version, test, and monitor every prompt and agent with robust evals, tracing, and regression sets. Empower domain experts to collaborate in the visual editor.
                    </p>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/workspace/dashboard"
                            className="px-8 py-3.5 bg-[#4F46E5] text-white rounded-lg text-lg font-bold hover:bg-[#4338CA] transition-all flex items-center group"
                        >
                            Start For Free
                            <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Right Side: Preview */}
                <div className="lg:w-1/2 relative group">
                    <div className="relative z-10 transform scale-100 lg:scale-110 transition-transform duration-500">
                        <WorkspacePreview />
                    </div>

                    {/* Background Glow */}
                    <div className="absolute -right-20 top-0 w-[500px] h-[500px] bg-indigo-300/10 rounded-full blur-[100px] -z-10"></div>
                </div>
            </div>

            {/* Trusted By Banner */}
            <div className="mt-32 pt-20 border-t border-slate-50">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-12 text-center lg:text-left">
                        Trusted by companies like you
                    </p>

                    <div className="relative overflow-hidden group">
                        <div className="flex animate-scroll whitespace-nowrap gap-24 items-center">
                            {[...companies, ...companies].map((company, i) => (
                                <span
                                    key={i}
                                    className="text-2xl lg:text-3xl font-bold text-slate-300 transition-colors hover:text-slate-400 cursor-default"
                                >
                                    {company}
                                </span>
                            ))}
                        </div>
                        {/* Gradient Fades */}
                        <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-white to-transparent z-10"></div>
                        <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-white to-transparent z-10"></div>
                    </div>
                </div>
            </div>

            {/* Feature Cards Section */}
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12 pt-32 pb-20">
                {[
                    {
                        title: "Prompt management",
                        desc: "Visually edit, A/B test, and deploy prompts. Compare usage and latency. Avoid waiting for eng redeploys.",
                        icon: <Layers className="text-indigo-500 h-6 w-6" />
                    },
                    {
                        title: "Collaboration with experts",
                        desc: "Open up prompt iteration to non-technical stakeholders. Our LLM observability allows you to read logs, find edge-cases, and improve prompts.",
                        icon: <Zap className="text-blue-500 h-6 w-6" />
                    },
                    {
                        title: "Evaluation",
                        desc: "Evaluate prompts against usage history. Compare models. Schedule regression tests. Build one-off batch runs.",
                        icon: <Terminal className="text-purple-500 h-6 w-6" />
                    }
                ].map((feature, i) => (
                    <div key={i} className="space-y-4">
                        <div className="bg-slate-50 h-10 w-10 rounded-lg flex items-center justify-center">
                            {feature.icon}
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium">{feature.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
