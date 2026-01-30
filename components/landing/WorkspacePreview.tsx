"use client";

import React, { useState, useEffect } from 'react';
import {
    Terminal,
    Layout,
    Activity,
    CheckCircle2,
    Database,
    FileCode,
    GitBranch,
    Menu,
    X,
    ChevronRight
} from 'lucide-react';

type TabId = 'dashboard' | 'prompts' | 'requests' | 'evaluations' | 'datasets';

const WorkspacePreview = () => {
    const [activeTab, setActiveTab] = useState<TabId>('prompts');
    const [displayedTab, setDisplayedTab] = useState<TabId>('prompts');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const tabs = [
        { id: 'dashboard' as const, label: 'Dashboard', icon: Layout },
        { id: 'prompts' as const, label: 'Prompts', icon: Terminal },
        { id: 'requests' as const, label: 'Requests', icon: Activity },
        { id: 'evaluations' as const, label: 'Evaluations', icon: CheckCircle2 },
        { id: 'datasets' as const, label: 'Datasets', icon: Database },
    ];

    const contentMap = {
        dashboard: {
            file: 'analytics_overview.py',
            lang: 'python',
            lines: [
                { num: 1, text: 'import stacklyn', color: 'text-purple-400' },
                { num: 2, text: '', color: '' },
                { num: 3, text: '# Fetch production metrics', color: 'text-slate-500' },
                { num: 4, text: 'stats = stacklyn.get_stats(', color: 'text-blue-400' },
                { num: 5, text: '    time_range="30d",', color: 'text-orange-300' },
                { num: 6, text: '    tags=["production", "gpt-4"]', color: 'text-orange-300' },
                { num: 7, text: ')', color: 'text-slate-300' },
                { num: 8, text: '', color: '' },
                { num: 9, text: 'print(f"Total Cost: ${stats.cost}")', color: 'text-emerald-400' },
                { num: 10, text: 'print(f"Avg Latency: {stats.latency}ms")', color: 'text-emerald-400' },
            ]
        },
        prompts: {
            file: 'payment_flow.py',
            lang: 'python',
            lines: [
                { num: 1, text: 'import openai', color: 'text-purple-400' },
                { num: 2, text: 'import stacklyn', color: 'text-purple-400' },
                { num: 3, text: '', color: '' },
                { num: 4, text: '# Get versioned template', color: 'text-slate-500' },
                { num: 5, text: 'tpl = stacklyn.prompts.get("payment_issue")', color: 'text-blue-400' },
                { num: 6, text: '', color: '' },
                { num: 7, text: 'response = openai.ChatCompletion.create(', color: 'text-blue-400' },
                { num: 8, text: '    **tpl.kwargs,', color: 'text-slate-300' },
                { num: 9, text: '    messages=tpl.format(user="Alice")', color: 'text-orange-300' },
                { num: 10, text: ')', color: 'text-slate-300' },
                { num: 11, text: '', color: '' },
                { num: 12, text: '# Template is now decoupled from code!', color: 'text-slate-500' },
            ]
        },
        requests: {
            file: 'middleware.py',
            lang: 'python',
            lines: [
                { num: 1, text: '@stacklyn.track', color: 'text-yellow-300' },
                { num: 2, text: 'def chat_endpoint(request):', color: 'text-purple-400' },
                { num: 3, text: '    user_id = request.user.id', color: 'text-blue-300' },
                { num: 4, text: '    ', color: '' },
                { num: 5, text: '    # Metadata is automatically logged', color: 'text-slate-500' },
                { num: 6, text: '    stacklyn.track.metadata(', color: 'text-blue-400' },
                { num: 7, text: '        user_id=user_id,', color: 'text-orange-300' },
                { num: 8, text: '        plan="enterprise"', color: 'text-orange-300' },
                { num: 9, text: '    )', color: 'text-slate-300' },
                { num: 10, text: '    ', color: '' },
                { num: 11, text: '    return openai.ChatCompletion.create(...)', color: 'text-slate-400' },
            ]
        },
        evaluations: {
            file: 'unit_tests.py',
            lang: 'python',
            lines: [
                { num: 1, text: 'from stacklyn import evaluation', color: 'text-purple-400' },
                { num: 2, text: '', color: '' },
                { num: 3, text: 'def score_helpfulness(output):', color: 'text-blue-400' },
                { num: 4, text: '    return 100 if "solved" in output else 0', color: 'text-yellow-300' },
                { num: 5, text: '', color: '' },
                { num: 6, text: '# Score a historical request', color: 'text-slate-500' },
                { num: 7, text: 'evaluation.create_score(', color: 'text-blue-400' },
                { num: 8, text: '    request_id="req_xyz123",', color: 'text-orange-300' },
                { num: 9, text: '    score=score_helpfulness(ans),', color: 'text-slate-300' },
                { num: 10, text: '    name="helpfulness_v1"', color: 'text-orange-300' },
                { num: 11, text: ')', color: 'text-slate-300' },
            ]
        },
        datasets: {
            file: 'fine_tune.py',
            lang: 'python',
            lines: [
                { num: 1, text: '# Create dataset from production tags', color: 'text-slate-500' },
                { num: 2, text: 'ds = stacklyn.datasets.create(', color: 'text-blue-400' },
                { num: 3, text: '    name="gold_standard_support",', color: 'text-orange-300' },
                { num: 4, text: '    from_tags=["5_star_rating"]', color: 'text-orange-300' },
                { num: 5, text: ')', color: 'text-slate-300' },
                { num: 6, text: '', color: '' },
                { num: 7, text: 'for row in ds.iterate():', color: 'text-purple-400' },
                { num: 8, text: '    print(row["input"], row["output"])', color: 'text-yellow-300' },
            ]
        }
    };

    const handleTabChange = (tabId: TabId) => {
        if (tabId === activeTab) return;
        setActiveTab(tabId);
        setIsTransitioning(true);
        setTimeout(() => {
            setDisplayedTab(tabId);
            setIsTransitioning(false);
        }, 300);
    };

    useEffect(() => {
        if (isPaused) return;
        const interval = setInterval(() => {
            const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
            const nextIndex = (currentIndex + 1) % tabs.length;
            handleTabChange(tabs[nextIndex].id);
        }, 4000);
        return () => clearInterval(interval);
    }, [activeTab, isPaused]);

    const activeContent = contentMap[displayedTab];

    return (
        <div
            className="flex flex-col md:flex-row h-auto md:h-[400px] w-full bg-[#09090b] overflow-hidden relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Desktop Sidebar */}
            <div className="hidden md:flex w-56 border-r border-white/[0.08] bg-[#0c0c0e] flex-col p-3">
                <div className="space-y-1 mt-2">
                    <div className="text-[10px] uppercase font-bold text-zinc-500 mb-2 px-3 tracking-widest">Platform</div>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-white/10 text-white shadow-inner shadow-white/5 border border-white/10'
                                : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? 'text-white' : 'text-zinc-600'}`} />
                            <span className="text-xs font-medium">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Code Area - Deep Black for pop */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#050505] relative">
                <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/[0.08] bg-[#0a0a0a]">
                    <div className="flex items-center space-x-3">
                        {/* Mobile Hamburger */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden p-1.5 hover:bg-white/5 rounded text-zinc-400 transition-colors"
                        >
                            {isMobileMenuOpen ? <X size={16} /> : <Menu size={16} />}
                        </button>
                        <FileCode className="h-3 w-3 text-zinc-400" />
                        <span className="text-xs text-zinc-400 font-mono transition-all duration-300">{activeContent.file}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <GitBranch className="h-3 w-3 text-zinc-600" />
                        <span className="text-[10px] text-zinc-600">main</span>
                    </div>
                </div>

                {/* Mobile Navigation Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="absolute inset-x-1.5 bottom-1.5 top-[48px] z-50 bg-[#09090b]/98 backdrop-blur-2xl md:hidden animate-in fade-in slide-in-from-top-2 duration-300 p-2 rounded-xl border border-white/5 shadow-2xl overflow-y-auto">
                        <div className="text-[9px] uppercase font-bold text-zinc-600 mb-2 px-2 tracking-widest mt-1">Platform</div>
                        <div className="space-y-0.5">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        handleTabChange(tab.id);
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-white/10 text-white border border-white/10 shadow-sm'
                                        : 'text-zinc-500 hover:text-zinc-200'
                                        }`}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <tab.icon className={`h-3.5 w-3.5 ${activeTab === tab.id ? 'text-white' : 'text-zinc-600'}`} />
                                        <span className="text-xs font-medium">{tab.label}</span>
                                    </div>
                                    <ChevronRight size={12} className="text-zinc-700" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className={`flex-1 p-4 md:p-6 overflow-hidden font-mono text-[10px] xs:text-xs md:text-sm leading-relaxed transition-opacity duration-300 min-h-[250px] md:min-h-0 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                    {activeContent.lines.map((line, idx) => (
                        <div key={idx} className="flex">
                            <span className="w-6 text-zinc-700 select-none text-right pr-4 text-xs font-light">{line.num}</span>
                            <span className={`${line.color || 'text-zinc-400'} whitespace-pre`}>{line.text}</span>
                        </div>
                    ))}
                    <div className="flex mt-1">
                        <span className="w-6 text-zinc-700 select-none text-right pr-4 text-xs"></span>
                        <span className="w-1.5 h-4 bg-white animate-pulse"></span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkspacePreview;