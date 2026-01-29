"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Folder, Zap, BarChart3 } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityItem } from "@/components/dashboard/ActivityItem";
import { OverviewChart } from "@/components/dashboard/OverviewChart";
import { Activity } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

export default function Dashboard() {
    const api = useApi();
    const [stats, setStats] = useState({
        projects: 0,
        runs: 0,
        avgScore: 0,
    });
    const [activities, setActivities] = useState<Activity[]>([]);

    useEffect(() => {
        async function loadData() {
            try {
                const [projects, runs, scores, recentActivities] = await Promise.all([
                    api.getProjects(),
                    api.getRuns(),
                    api.getScores(),
                    api.getActivities(5, 0),
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

                setActivities(recentActivities);
            } catch (e) {
                console.error("Failed to load dashboard data", e);
            }
        }
        loadData();
    }, [api]);

    const getActivityStatus = (action: Activity['action']): "success" | "warning" | "neutral" => {
        if (['created', 'updated', 'executed'].includes(action)) return 'success';
        if (action === 'failed') return 'warning';
        return 'neutral';
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Projects"
                    value={stats.projects}
                    subtext="Active workspaces"
                    icon={Folder}
                />
                <StatCard
                    title="Total Runs"
                    value={stats.runs}
                    subtext="LLM executions"
                    icon={Zap}
                />
                <StatCard
                    title="Average Score"
                    value={stats.avgScore.toFixed(2)}
                    subtext="Human evaluation"
                    icon={BarChart3}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart Section */}
                <div className="lg:col-span-2">
                    <OverviewChart />
                </div>

                {/* Recent Activity Feed */}
                <div className="bg-white rounded-md border border-slate-200 shadow-sm flex flex-col">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-lg tracking-tight text-slate-900">Recent Activity</h2>
                            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                            Latest actions across your projects.
                        </p>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[400px] no-scrollbar">
                        {activities.length > 0 ? (
                            activities.map((activity) => (
                                <ActivityItem
                                    key={activity.id}
                                    title={activity.title}
                                    user={activity.users?.name || activity.users?.email || "Unknown"}
                                    time={formatRelativeTime(activity.created_at)}
                                    status={getActivityStatus(activity.action)}
                                />
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                No recent activity
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t border-slate-50">
                        <Link href="/workspace/activity">
                            <button className="w-full py-2 text-sm font-lg tracking-tight text-slate-500 hover:text-slate-900 transition-professional hover:bg-slate-50 rounded-md">
                                View All Activity
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
