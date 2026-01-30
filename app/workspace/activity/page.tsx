"use client";
import { useEffect, useState } from 'react';
import {
    Filter,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    X
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';

interface TokenUsageRequest {
    id: string;
    user_id: string;
    model_name: string;
    input_tokens: number;
    output_tokens: number;
    cost: number;
    latency_ms: number;
    system_prompt: string;
    user_query: string;
    response: string;
    status: string;
    created_at: string;
}

interface Pagination {
    limit: number;
    offset: number;
    total: number;
}

interface Summary {
    total_input_tokens: number;
    total_output_tokens: number;
    total_tokens: number;
    total_cost: number;
    total_latency_ms: number;
    avg_latency_ms: number;
}

type PeriodFilter = '1h' | '6h' | '24h' | '7d' | '30d' | 'all';
type StatusFilter = 'all' | 'success' | 'failed';

const PERIOD_LABELS: Record<PeriodFilter, string> = {
    '1h': 'Last 1h',
    '6h': 'Last 6h',
    '24h': 'Last 24h',
    '7d': 'Last 7d',
    '30d': 'Last 30d',
    'all': 'All Time'
};

const STATUS_LABELS: Record<StatusFilter, string> = {
    'all': 'All Status',
    'success': 'Success',
    'failed': 'Failed'
};

const ITEMS_PER_PAGE = 10;

const ActivityPage = () => {
    const api = useApi();
    const [requests, setRequests] = useState<TokenUsageRequest[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [modelsUsed, setModelsUsed] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);

    // Filters
    const [period, setPeriod] = useState<PeriodFilter>('all');
    const [selectedModel, setSelectedModel] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');

    // Dropdowns
    const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
    const [showFilterDropdown, setShowFilterDropdown] = useState(false);
    const [showModelDropdown, setShowModelDropdown] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);

    const fetchRequests = async (
        page: number,
        filters: { period: PeriodFilter; model: string; status: StatusFilter },
        isInitial: boolean = false
    ) => {
        if (isInitial) {
            setLoading(true);
        } else {
            setLoadingMore(true);
        }

        try {
            const offset = page * ITEMS_PER_PAGE;
            const response = await api.getTokenUsageHistory({
                limit: ITEMS_PER_PAGE,
                offset,
                period: filters.period === 'all' ? undefined : filters.period,
                model: filters.model === 'all' ? undefined : filters.model,
                status: filters.status === 'all' ? undefined : filters.status as 'success' | 'failed'
            });
            setRequests(response.data);
            setPagination(response.pagination);
            setSummary(response.summary);
            setModelsUsed(response.models_used || []);
            setCurrentPage(page);
        } catch (error) {
            console.error('Failed to fetch token usage history:', error);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        fetchRequests(0, { period, model: selectedModel, status: selectedStatus }, true);
    }, [api]);

    const applyFilters = () => {
        setShowFilterDropdown(false);
        setCurrentPage(0);
        fetchRequests(0, { period, model: selectedModel, status: selectedStatus }, true);
    };

    const handlePeriodChange = (newPeriod: PeriodFilter) => {
        setPeriod(newPeriod);
        setShowPeriodDropdown(false);
        setCurrentPage(0);
        fetchRequests(0, { period: newPeriod, model: selectedModel, status: selectedStatus }, true);
    };

    const clearFilters = () => {
        setSelectedModel('all');
        setSelectedStatus('all');
        setShowFilterDropdown(false);
        fetchRequests(0, { period, model: 'all', status: 'all' }, true);
    };

    const hasActiveFilters = selectedModel !== 'all' || selectedStatus !== 'all';

    const formatNumber = (num: number) => {
        return num.toLocaleString();
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
        return date.toLocaleDateString();
    };

    const formatCost = (cost: number) => {
        return `$${cost.toFixed(4)}`;
    };

    const formatLatency = (ms: number) => {
        if (ms < 1000) return `${ms}ms`;
        return `${(ms / 1000).toFixed(1)}s`;
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success':
                return <CheckCircle2 size={16} className="text-emerald-500" />;
            case 'error':
            case 'failed':
                return <XCircle size={16} className="text-red-500" />;
            default:
                return <AlertCircle size={16} className="text-orange-400" />;
        }
    };

    const totalPages = pagination ? Math.ceil(pagination.total / ITEMS_PER_PAGE) : 0;
    const canGoPrev = currentPage > 0;
    const canGoNext = currentPage < totalPages - 1;

    const handlePrevPage = () => {
        if (canGoPrev) {
            fetchRequests(currentPage - 1, { period, model: selectedModel, status: selectedStatus });
        }
    };

    const handleNextPage = () => {
        if (canGoNext) {
            fetchRequests(currentPage + 1, { period, model: selectedModel, status: selectedStatus });
        }
    };

    return (
        <div className="flex-1 p-4 lg:p-8 bg-zinc-50 dark:bg-[#181818]">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                    <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2">
                        Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-700 to-zinc-400 dark:from-zinc-100 dark:to-zinc-500">Stream.</span>
                    </h1>
                    <p className="text-xs md:text-sm text-zinc-500 font-medium">Real-time observability of your AI traffic.</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Filter Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                            className={cn(
                                "flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-[#1F1F1F] border rounded-md text-[10px] font-bold uppercase tracking-widest transition-colors",
                                hasActiveFilters
                                    ? "border-emerald-500/50 text-emerald-600 dark:text-emerald-400"
                                    : "border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                            )}
                        >
                            <Filter size={12} /> Filter {hasActiveFilters && `(${(selectedModel !== 'all' ? 1 : 0) + (selectedStatus !== 'all' ? 1 : 0)})`}
                        </button>
                        {showFilterDropdown && (
                            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#1F1F1F] border border-zinc-200 dark:border-white/10 rounded-lg shadow-xl z-20 p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Filters</span>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearFilters}
                                            className="text-[10px] text-zinc-500 hover:text-white flex items-center gap-1"
                                        >
                                            <X size={10} /> Clear
                                        </button>
                                    )}
                                </div>

                                {/* Model Filter */}
                                <div className="mb-4">
                                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Model</label>
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowModelDropdown(!showModelDropdown)}
                                            className="w-full bg-zinc-100 dark:bg-[#181818] border border-zinc-200 dark:border-white/10 rounded-md px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 text-left flex items-center justify-between hover:border-zinc-300 dark:hover:border-white/20 transition-colors"
                                        >
                                            <span className="truncate">{selectedModel === 'all' ? 'All Models' : selectedModel}</span>
                                            <ChevronDown size={12} className="text-zinc-500 flex-shrink-0" />
                                        </button>
                                        {showModelDropdown && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#181818] border border-zinc-200 dark:border-white/10 rounded-md shadow-xl z-30 max-h-48 overflow-y-auto">
                                                <button
                                                    onClick={() => { setSelectedModel('all'); setShowModelDropdown(false); }}
                                                    className={cn(
                                                        "w-full px-3 py-2 text-left text-xs transition-colors",
                                                        selectedModel === 'all' ? "bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
                                                    )}
                                                >
                                                    All Models
                                                </button>
                                                {modelsUsed.map((model) => (
                                                    <button
                                                        key={model}
                                                        onClick={() => { setSelectedModel(model); setShowModelDropdown(false); }}
                                                        className={cn(
                                                            "w-full px-3 py-2 text-left text-xs transition-colors truncate",
                                                            selectedModel === model ? "bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
                                                        )}
                                                    >
                                                        {model}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Status Filter */}
                                <div className="mb-4">
                                    <label className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2 block">Status</label>
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                                            className="w-full bg-zinc-100 dark:bg-[#181818] border border-zinc-200 dark:border-white/10 rounded-md px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 text-left flex items-center justify-between hover:border-zinc-300 dark:hover:border-white/20 transition-colors"
                                        >
                                            <span>{STATUS_LABELS[selectedStatus]}</span>
                                            <ChevronDown size={12} className="text-zinc-500" />
                                        </button>
                                        {showStatusDropdown && (
                                            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#181818] border border-zinc-200 dark:border-white/10 rounded-md shadow-xl z-30">
                                                {(Object.keys(STATUS_LABELS) as StatusFilter[]).map((s) => (
                                                    <button
                                                        key={s}
                                                        onClick={() => { setSelectedStatus(s); setShowStatusDropdown(false); }}
                                                        className={cn(
                                                            "w-full px-3 py-2 text-left text-xs transition-colors",
                                                            selectedStatus === s ? "bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white" : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
                                                        )}
                                                    >
                                                        {STATUS_LABELS[s]}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={applyFilters}
                                    className="w-full bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/15 text-zinc-900 dark:text-white text-[10px] font-bold uppercase tracking-widest py-2 rounded-md transition-colors"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Period Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-[#1F1F1F] border border-zinc-200 dark:border-white/5 rounded-md text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                        >
                            <Clock size={12} /> {PERIOD_LABELS[period]} <ChevronDown size={10} />
                        </button>
                        {showPeriodDropdown && (
                            <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#1F1F1F] border border-zinc-200 dark:border-white/10 rounded-lg shadow-xl z-20 overflow-hidden">
                                {(Object.keys(PERIOD_LABELS) as PeriodFilter[]).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => handlePeriodChange(p)}
                                        className={cn(
                                            "w-full px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest transition-colors",
                                            period === p
                                                ? "bg-zinc-100 dark:bg-white/5 text-zinc-900 dark:text-white"
                                                : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white"
                                        )}
                                    >
                                        {PERIOD_LABELS[p]}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-12">
                        {[
                            { label: 'Total Requests', value: formatNumber(pagination?.total ?? 0), color: 'text-zinc-900 dark:text-white' },
                            { label: 'Input Tokens', value: formatNumber(summary?.total_input_tokens ?? 0), color: 'text-zinc-900 dark:text-white' },
                            { label: 'Output Tokens', value: formatNumber(summary?.total_output_tokens ?? 0), color: 'text-zinc-900 dark:text-white' },
                            { label: 'Avg Latency', value: formatLatency(summary?.avg_latency_ms ?? 0), color: 'text-zinc-900 dark:text-white' },
                            { label: 'Total Cost', value: formatCost(summary?.total_cost ?? 0), color: 'text-emerald-600 dark:text-emerald-400' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white dark:bg-[#1F1F1F] border border-zinc-200 dark:border-white/5 p-6 rounded-xl shadow-2xl backdrop-blur-md">
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-3">{stat.label}</div>
                                <div className={cn("text-2xl lg:text-3xl font-bold tracking-tight", stat.color)}>
                                    {stat.value}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Requests Table */}
                    <div className="w-full border border-zinc-200 dark:border-white/5 rounded-xl overflow-hidden bg-white dark:bg-[#1F1F1F]/30 backdrop-blur-md shadow-3xl">
                        <div className="hidden md:grid grid-cols-12 gap-4 px-8 py-4 border-b border-zinc-200 dark:border-white/5 text-[9px] font-bold text-zinc-500 dark:text-zinc-600 uppercase tracking-[0.2em] bg-zinc-100 dark:bg-[#1F1F1F]/80">
                            <div className="col-span-1">Status</div>
                            <div className="col-span-2">Time</div>
                            <div className="col-span-2">Model</div>
                            <div className="col-span-3">Prompt Preview</div>
                            <div className="col-span-1">Latency</div>
                            <div className="col-span-1">Tokens</div>
                            <div className="col-span-2 text-right">Cost</div>
                        </div>

                        <div className="divide-y divide-zinc-100 dark:divide-white/[0.03] relative">
                            {loadingMore && (
                                <div className="absolute inset-0 bg-zinc-100/50 dark:bg-[#181818]/50 flex items-center justify-center z-10">
                                    <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                                </div>
                            )}
                            {requests.length > 0 ? (
                                requests.map((req) => (
                                    <div key={req.id} className="flex flex-col md:grid md:grid-cols-12 gap-4 px-6 md:px-8 py-5 items-start md:items-center hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group cursor-pointer text-xs">
                                        <div className="flex items-center gap-3 md:col-span-1">
                                            <div>
                                                {getStatusIcon(req.status)}
                                            </div>
                                            <div className="md:hidden flex flex-col">
                                                <span className="text-zinc-500 font-mono text-[10px]">{formatTime(req.created_at)}</span>
                                                <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[8px] tracking-wider w-fit mt-1">{req.model_name}</span>
                                            </div>
                                        </div>
                                        <div className="hidden md:block md:col-span-2 text-zinc-500 font-mono text-[10px]">{formatTime(req.created_at)}</div>
                                        <div className="hidden md:block md:col-span-2">
                                            <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5 text-zinc-500 dark:text-zinc-400 font-bold uppercase text-[9px] tracking-wider">{req.model_name}</span>
                                        </div>
                                        <div className="md:col-span-3 text-zinc-700 dark:text-zinc-300 md:text-zinc-500 truncate font-mono italic opacity-80">
                                            "{req.system_prompt}"
                                        </div>
                                        <div className={cn(
                                            "hidden md:block md:col-span-1 font-mono text-[11px]",
                                            req.latency_ms > 2000 ? 'text-orange-500 dark:text-orange-400' : 'text-zinc-500'
                                        )}>
                                            {formatLatency(req.latency_ms)}
                                        </div>
                                        <div className="flex items-center justify-between w-full md:w-auto md:contents">
                                            <div className="md:col-span-1 text-zinc-500 font-mono text-[11px]">
                                                <span className="md:hidden text-zinc-400 dark:text-zinc-700 mr-2">Tok:</span>
                                                {formatNumber(req.input_tokens + req.output_tokens)}
                                            </div>
                                            <div className="md:col-span-2 text-right text-zinc-600 dark:text-zinc-400 font-mono font-bold tracking-tight">
                                                {formatCost(req.cost)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="px-8 py-12 text-center text-zinc-500 text-sm">
                                    No requests yet.
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.total > 0 && (
                            <div className="flex items-center justify-between px-8 py-4 border-t border-zinc-200 dark:border-white/5 bg-zinc-100 dark:bg-[#1F1F1F]/80">
                                <div className="text-[10px] text-zinc-500 font-medium">
                                    {pagination.total > 0 ? (
                                        <>Showing {currentPage * ITEMS_PER_PAGE + 1}-{Math.min((currentPage + 1) * ITEMS_PER_PAGE, pagination.total)} of {pagination.total}</>
                                    ) : (
                                        <>No results</>
                                    )}
                                </div>
                                {pagination.total > ITEMS_PER_PAGE && (
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handlePrevPage}
                                            disabled={!canGoPrev || loadingMore}
                                            className={cn(
                                                "p-2 rounded-md border border-zinc-200 dark:border-white/5 transition-colors",
                                                canGoPrev && !loadingMore
                                                    ? "bg-white dark:bg-[#1F1F1F] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/10"
                                                    : "bg-zinc-100 dark:bg-[#1F1F1F]/50 text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
                                            )}
                                        >
                                            <ChevronLeft size={14} />
                                        </button>
                                        <span className="text-[10px] text-zinc-500 font-mono px-2">
                                            {currentPage + 1} / {totalPages}
                                        </span>
                                        <button
                                            onClick={handleNextPage}
                                            disabled={!canGoNext || loadingMore}
                                            className={cn(
                                                "p-2 rounded-md border border-zinc-200 dark:border-white/5 transition-colors",
                                                canGoNext && !loadingMore
                                                    ? "bg-white dark:bg-[#1F1F1F] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-white/10"
                                                    : "bg-zinc-100 dark:bg-[#1F1F1F]/50 text-zinc-300 dark:text-zinc-700 cursor-not-allowed"
                                            )}
                                        >
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

function cn(...inputs: (string | boolean | undefined)[]) {
    return inputs.filter(Boolean).join(' ');
}

export default ActivityPage;
