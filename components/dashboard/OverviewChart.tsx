"use client";

export function OverviewChart() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">Overview</h2>
                    <p className="text-sm text-slate-500">
                        Request volume over the last 30 days
                    </p>
                </div>
                <select className="bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
                    <option>Last 30 Days</option>
                    <option>Last 7 Days</option>
                    <option>Last 24 Hours</option>
                </select>
            </div>

            {/* Decorative Mock Chart */}
            <div className="h-64 w-full relative">
                <div className="absolute bottom-0 left-0 right-0 h-px bg-slate-100"></div>
                <div className="absolute top-0 left-0 right-0 h-px bg-slate-100 border-dashed border-t border-slate-200 opacity-50"></div>
                <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-100 border-dashed border-t border-slate-200 opacity-50"></div>

                <div className="flex h-full items-end justify-between px-2">
                    {[40, 65, 45, 80, 55, 70, 40, 60, 50, 75, 85, 60].map((h, i) => (
                        <div
                            key={i}
                            className="group relative flex flex-col items-center gap-2 w-full"
                        >
                            <div
                                style={{ height: `${h}%` }}
                                className="w-full max-w-[24px] bg-indigo-50 rounded-t-sm group-hover:bg-indigo-100 transition-all relative overflow-hidden"
                            >
                                <div className="absolute bottom-0 left-0 right-0 bg-indigo-500 h-1.5 w-full"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
