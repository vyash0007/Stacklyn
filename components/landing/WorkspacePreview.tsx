"use client";

import React, { useState } from 'react';
import {
    Terminal,
    Layout,
    Activity,
    CheckCircle2,
    Database,
    FileCode,
    GitBranch
} from 'lucide-react';

const WorkspacePreview = () => {
    // State for the sidebar selection (updates instantly)
    const [activeTab, setActiveTab] = useState('prompts');

    // State for the content being displayed (updates after delay)
    const [displayedTab, setDisplayedTab] = useState('prompts');

    // State to control the fade animation
    const [isTransitioning, setIsTransitioning] = useState(false);

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: Layout },
        { id: 'prompts', label: 'Prompts', icon: Terminal },
        { id: 'requests', label: 'Requests', icon: Activity },
        { id: 'evaluations', label: 'Evaluations', icon: CheckCircle2 },
        { id: 'datasets', label: 'Datasets', icon: Database },
    ];

    const contentMap: Record<string, { file: string, lang: string, lines: { num: number, text: string, color: string }[] }> = {
        dashboard: {
            file: 'analytics_overview.py',
            lang: 'python',
            lines: [
                { num: 1, text: 'import promptlayer', color: 'text-purple-400' },
                { num: 2, text: '', color: '' },
                { num: 3, text: '# Fetch production metrics', color: 'text-slate-500' },
                { num: 4, text: 'stats = promptlayer.get_stats(', color: 'text-blue-400' },
                { num: 5, text: '    time_range="30d",', color: 'text-orange-300' },
                { num: 6, text: '    tags=["production", "gpt-4"]', color: 'text-orange-300' },
                { num: 7, text: ')', color: 'text-slate-300' },
                { num: 8, text: '', color: '' },
                { num: 9, text: 'print(f"Total Cost: ${stats.cost}")', color: 'text-yellow-200' },
                { num: 10, text: 'print(f"Avg Latency: {stats.latency}ms")', color: 'text-yellow-200' },
            ]
        },
        prompts: {
            file: 'payment_flow.py',
            lang: 'python',
            lines: [
                { num: 1, text: 'import openai', color: 'text-purple-400' },
                { num: 2, text: 'import promptlayer', color: 'text-purple-400' },
                { num: 3, text: '', color: '' },
                { num: 4, text: '# Get versioned template', color: 'text-slate-500' },
                { num: 5, text: 'tpl = promptlayer.prompts.get("payment")', color: 'text-blue-400' },
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
                { num: 1, text: '@promptlayer.track', color: 'text-yellow-200' },
                { num: 2, text: 'def chat_endpoint(request):', color: 'text-blue-400' },
                { num: 3, text: '    user_id = request.user.id', color: 'text-slate-300' },
                { num: 4, text: '    ', color: '' },
                { num: 5, text: '    # Metadata is automatically logged', color: 'text-slate-500' },
                { num: 6, text: '    promptlayer.track.metadata(', color: 'text-blue-400' },
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
                { num: 1, text: 'from promptlayer import evaluation', color: 'text-purple-400' },
                { num: 2, text: '', color: '' },
                { num: 3, text: 'def score_helpfulness(output):', color: 'text-blue-400' },
                { num: 4, text: '    return 100 if "solved" in output else 0', color: 'text-yellow-200' },
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
                { num: 2, text: 'ds = promptlayer.datasets.create(', color: 'text-blue-400' },
                { num: 3, text: '    name="gold_standard_support",', color: 'text-orange-300' },
                { num: 4, text: '    from_tags=["5_star_rating"]', color: 'text-orange-300' },
                { num: 5, text: ')', color: 'text-slate-300' },
                { num: 6, text: '', color: '' },
                { num: 7, text: 'for row in ds.iterate():', color: 'text-purple-400' },
                { num: 8, text: '    print(row["input"], row["output"])', color: 'text-yellow-200' },
            ]
        }
    };

    const handleTabChange = (tabId: string) => {
        if (tabId === activeTab) return;

        // 1. Update sidebar immediately
        setActiveTab(tabId);

        // 2. Start transition (fade out old content)
        setIsTransitioning(true);

        // 3. Wait for the delay, then swap content and fade in
        setTimeout(() => {
            setDisplayedTab(tabId);
            setIsTransitioning(false);
        }, 150); // 150ms delay for the "opening" animation
    };

    // Get content based on the *displayed* tab (not the active sidebar tab)
    // This ensures the old code stays visible while fading out
    const activeContent = contentMap[displayedTab];

    return (
        <div className="relative max-w-6xl mx-auto text-left transform hover:scale-[1.01] transition-transform duration-500 shadow-2xl rounded-2xl">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] blur opacity-20 transition duration-1000"></div>

            <div className="relative bg-[#0F1117] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden ring-1 ring-white/10 flex flex-col md:flex-row h-[500px]">
                {/* Sidebar */}
                <div className="w-full md:w-52 border-r border-slate-800 bg-[#0F1117] flex flex-col">
                    <div className="p-4 border-b border-slate-800/50">
                        <div className="flex items-center space-x-2">
                            <div className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                            <div className="h-3 w-3 rounded-full bg-amber-500/20 border border-amber-500/50"></div>
                            <div className="h-3 w-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
                        </div>
                    </div>

                    <div className="p-2">
                        <div className="text-[10px] uppercase font-bold text-slate-500 mb-2 px-3 tracking-widest mt-2">Workspace</div>
                        <ul className="space-y-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <li
                                        key={tab.id}
                                        onClick={() => handleTabChange(tab.id)}
                                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${isActive
                                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm shadow-indigo-900/20'
                                            : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'opacity-70'}`} />
                                        <span className="text-sm font-medium">{tab.label}</span>
                                        {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.5)]"></div>}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* <div className="mt-auto p-4 border-t border-slate-800/50">
                        <div className="flex items-center space-x-3 text-slate-500">
                            <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">PL</div>
                            <div className="text-xs">
                                <div className="text-slate-300 font-medium whitespace-nowrap">Demo Org</div>
                                <div className="text-[10px]">Pro Plan</div>
                            </div>
                        </div>
                    </div> */}
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#0B0D13]">
                    {/* File Header - Also fades to simulate switching files */}
                    <div className={`flex items-center justify-between bg-[#0F1117] px-6 py-3 border-b border-slate-800 transition-opacity duration-200 ${isTransitioning ? 'opacity-50' : 'opacity-100'}`}>
                        <div className="flex items-center space-x-3">
                            <FileCode className="h-4 w-4 text-indigo-400" />
                            <span className="text-sm text-slate-300 font-mono transition-all duration-300">{activeContent.file}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="hidden sm:flex items-center space-x-1.5 px-2 py-1 rounded bg-indigo-500/10 border border-indigo-500/20">
                                <GitBranch className="h-3 w-3 text-indigo-400" />
                                <span className="text-xs text-indigo-400 font-medium">main</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono">Python</span>
                        </div>
                    </div>

                    {/* Code Editor */}
                    {/* We use transition-opacity and duration-200 to smooth the switch */}
                    <div className={`flex-1 p-4 overflow-y-auto overflow-x-hidden font-mono text-sm leading-relaxed bg-[#0B0D13] selection:bg-indigo-500/30 transition-opacity duration-200 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                        <div className="space-y-1">
                            {activeContent.lines.map((line, idx) => (
                                <div key={`${displayedTab}-${idx}`} className="flex">
                                    <span className="w-8 text-slate-700 select-none text-right pr-4 text-xs pt-1">{line.num}</span>
                                    <span className={`${line.color || 'text-slate-200'} transition-colors duration-300 whitespace-pre`}>
                                        {line.text}
                                    </span>
                                </div>
                            ))}
                            <div className="flex animate-pulse">
                                <span className="w-8 text-slate-700 select-none text-right pr-4 text-xs pt-1"></span>
                                <span className="w-2 h-4 bg-indigo-500/50 mt-1"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WorkspacePreview;
