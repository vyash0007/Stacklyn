"use client";

import { useEffect, useState } from "react";
import { Folder, Zap, BarChart3 } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityItem } from "@/components/dashboard/ActivityItem";
import { OverviewChart } from "@/components/dashboard/OverviewChart";

export default function Dashboard() {
    const api = useApi();
    const [stats, setStats] = useState({
        projects: 0,
        runs: 0,
        avgScore: 0,
    });

    useEffect(() => {
        async function loadStats() {
            try {
                const [projects, runs, scores] = await Promise.all([
                    api.getProjects(),
                    api.getRuns(),
                    api.getScores(),
                ]);

                let avg = 0;
                if (scores.length > 0) {
                    const total = scores.reduce((acc: number, s: any) => acc + s.score, 0);
                    avg = total / scores.length;
                }

                setStats({
                    projects: projects.length,
                    runs: runs.length,
                    avgScore: avg,
                });
            } catch (e) {
                console.error("Failed to load dashboard stats", e);
            }
        }
        loadStats();
    }, [api]);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Projects"
                    value={stats.projects}
                    subtext="Active workspaces"
                    icon={Folder}
                    trend={12}
                />
                <StatCard
                    title="Total Runs"
                    value={stats.runs}
                    subtext="LLM executions"
                    icon={Zap}
                    trend={8}
                />
                <StatCard
                    title="Average Score"
                    value={stats.avgScore.toFixed(2)}
                    subtext="Human evaluation"
                    icon={BarChart3}
                    trend={2.4}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Section */}
                <div className="lg:col-span-2">
                    <OverviewChart />
                </div>

                {/* Recent Activity Feed */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900">Recent Activity</h2>
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                            Latest actions across your projects.
                        </p>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[400px] no-scrollbar">
                        <ActivityItem
                            title="Updated 'customer_support_v2'"
                            user="You"
                            time="2 mins ago"
                            status="success"
                        />
                        <ActivityItem
                            title="New evaluation run on 'Marketing'"
                            user="System"
                            time="1 hour ago"
                            status="success"
                        />
                        <ActivityItem
                            title="Failed generation in 'Webyrix'"
                            user="API"
                            time="3 hours ago"
                            status="warning"
                        />
                        <ActivityItem
                            title="Project created: 'New Experiment'"
                            user="Sarah"
                            time="5 hours ago"
                            status="success"
                        />
                    </div>
                    <div className="p-4 border-t border-slate-50">
                        <button className="w-full py-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
                            View All Activity
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
