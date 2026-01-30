"use client";
import React from 'react';
import {
    Filter,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ArrowUpRight
} from 'lucide-react';

const ActivityPage = () => {
    const requests = [
        { id: 'req_01j8a', model: 'gpt-4-turbo', status: 'success', latency: '240ms', tokens: 420, cost: '$0.012', time: 'Just now', prompt: 'Summarize the payment logs...' },
        { id: 'req_01j8b', model: 'claude-3-opus', status: 'success', latency: '890ms', tokens: 1250, cost: '$0.045', time: '2m ago', prompt: 'Generate React component for...' },
        { id: 'req_01j8c', model: 'gpt-3.5-turbo', status: 'error', latency: '45ms', tokens: 0, cost: '$0.000', time: '5m ago', prompt: 'Classify support ticket #4492...' },
        { id: 'req_01j8d', model: 'gpt-4-turbo', status: 'success', latency: '310ms', tokens: 88, cost: '$0.003', time: '12m ago', prompt: 'Extract entities from invoice...' },
        { id: 'req_01j8e', model: 'mistral-large', status: 'success', latency: '150ms', tokens: 340, cost: '$0.001', time: '15m ago', prompt: 'Translate to Spanish: Hello...' },
        { id: 'req_01j8f', model: 'gpt-4-turbo', status: 'warning', latency: '2100ms', tokens: 600, cost: '$0.018', time: '22m ago', prompt: 'Analyze sentiment of reviews...' },
    ];

    return (
        <div className="flex-1 p-4 lg:p-8 bg-[#181818] min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-white mb-2">
                        Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500">Stream.</span>
                    </h1>
                    <p className="text-xs md:text-sm text-zinc-500 font-medium">Real-time observability of your AI traffic.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-[#1F1F1F] border border-white/5 rounded-md text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                        <Filter size={12} /> Filter
                    </button>
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-[#1F1F1F] border border-white/5 rounded-md text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors">
                        <Clock size={12} /> Last 30m
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
                {[
                    { label: 'Total Requests', value: '14,205', color: 'text-white' },
                    { label: 'Avg Latency', value: '324', suffix: 'ms', color: 'text-white' },
                    { label: 'Error Rate', value: '0.04%', color: 'text-emerald-400' },
                    { label: 'Cost (24h)', value: '$42.80', color: 'text-white' }
                ].map((stat, i) => (
                    <div key={i} className="bg-[#1F1F1F] border border-white/5 p-6 rounded-xl shadow-2xl backdrop-blur-md">
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">{stat.label}</div>
                        <div className={cn("text-3xl font-bold tracking-tight", stat.color)}>
                            {stat.value}
                            {stat.suffix && <span className="text-sm text-zinc-600 font-medium ml-1 tracking-normal">{stat.suffix}</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Logs Table */}
            <div className="w-full border border-white/5 rounded-xl overflow-hidden bg-[#1F1F1F]/30 backdrop-blur-md shadow-3xl">
                <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 border-b border-white/5 text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em] bg-[#1F1F1F]/80">
                    <div className="col-span-1">Status</div>
                    <div className="col-span-2">Time</div>
                    <div className="col-span-2">Model</div>
                    <div className="col-span-4">Prompt Preview</div>
                    <div className="col-span-1">Latency</div>
                    <div className="col-span-1">Tokens</div>
                    <div className="col-span-1 text-right">Cost</div>
                </div>

                <div className="divide-y divide-white/[0.03]">
                    {requests.map((req) => (
                        <div key={req.id} className="flex flex-col md:grid md:grid-cols-12 gap-4 px-6 md:px-8 py-5 items-start md:items-center hover:bg-white/[0.02] transition-colors group cursor-pointer text-xs">
                            <div className="flex items-center gap-3 md:col-span-1">
                                <div>
                                    {req.status === 'success' && <CheckCircle2 size={16} className="text-emerald-500" />}
                                    {req.status === 'error' && <XCircle size={16} className="text-red-500" />}
                                    {req.status === 'warning' && <AlertCircle size={16} className="text-orange-400" />}
                                </div>
                                <div className="md:hidden flex flex-col">
                                    <span className="text-zinc-500 font-mono text-[10px]">{req.time}</span>
                                    <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/5 text-zinc-400 font-bold uppercase text-[8px] tracking-wider w-fit mt-1">{req.model}</span>
                                </div>
                            </div>
                            <div className="hidden md:block md:col-span-2 text-zinc-500 font-mono text-[10px]">{req.time}</div>
                            <div className="hidden md:block md:col-span-2">
                                <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-zinc-400 font-bold uppercase text-[9px] tracking-wider">{req.model}</span>
                            </div>
                            <div className="md:col-span-4 text-zinc-300 md:text-zinc-500 truncate font-mono italic opacity-80">
                                "{req.prompt}"
                            </div>
                            <div className="flex items-center justify-between w-full md:w-auto md:contents">
                                <div className="flex items-center gap-4 md:contents">
                                    <div className={cn(
                                        "md:col-span-1 font-mono text-[11px]",
                                        parseInt(req.latency) > 1000 ? 'text-orange-400' : 'text-zinc-500 font-medium'
                                    )}>
                                        <span className="md:hidden text-zinc-700 mr-2">Lat:</span>
                                        {req.latency}
                                    </div>
                                    <div className="md:col-span-1 text-zinc-500 font-mono text-[11px]">
                                        <span className="md:hidden text-zinc-700 mr-2">Tok:</span>
                                        {req.tokens}
                                    </div>
                                </div>
                                <div className="md:col-span-1 text-right text-zinc-400 font-mono font-bold tracking-tight">
                                    {req.cost}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Mock cn utility since we don't want to import it for a small snippet or if it's already available
function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}

export default ActivityPage;