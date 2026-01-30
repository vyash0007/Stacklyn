"use client";

import { useEffect, useState, useMemo } from "react";
import { Folder, Zap, BarChart3, ChevronDown, Sparkles, Plus, Activity as ActivityIcon } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityItem } from "@/components/dashboard/ActivityItem"; // I might need to update this too
import { ProjectsTable } from "@/components/dashboard/ProjectsTable";
import { Activity, Project } from "@/types";
import { formatRelativeTime } from "@/lib/utils";
import Link from "next/link";

export default function Dashboard() {
    const api = useApi();
    const [stats, setStats] = useState({
        projects: 0,
        runs: 0,
        avgScore: 0,
    });
    const [activities, setActivities] = useState<Activity[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        async function loadData() {
            try {
                const [projectsData, runs, scores, recentActivities] = await Promise.all([
                    api.getProjects(),
                    api.getRuns(),
                    api.getScores(),
                    api.getActivities(10, 0),
                ]);

                let avg = 0;
                if (scores.length > 0) {
                    const total = scores.reduce((acc: number, s: any) => acc + s.score, 0);
                    avg = total / scores.length;
                }

                setStats({
                    projects: projectsData.length,
                    runs: runs.length,
                    avgScore: avg,
                });

                // Fetch members for each project
                const projectsWithMembers = await Promise.all(
                    projectsData.map(async (project: Project) => {
                        try {
                            const members = await api.getProjectMembers(project.id);
                            return { ...project, members };
                        } catch {
                            return { ...project, members: [] };
                        }
                    })
                );

                setProjects(projectsWithMembers);
                setActivities(recentActivities);
            } catch (e) {
                console.error("Failed to load dashboard data", e);
            }
        }
        loadData();
    }, [api]);

    // Group activities by date
    const groupedActivities = useMemo(() => {
        const groups: { [key: string]: Activity[] } = {};

        activities.forEach((activity) => {
            const date = new Date(activity.created_at);
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            let dateKey: string;
            if (date.toDateString() === today.toDateString()) {
                dateKey = "Today";
            } else if (date.toDateString() === yesterday.toDateString()) {
                dateKey = "Yesterday";
            } else {
                dateKey = date.toLocaleDateString('en-US', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                });
            }

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].push(activity);
        });

        return groups;
    }, [activities]);

    const formatActivityTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).toLowerCase();
    };

    return (
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 md:space-y-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#1F1F1F] text-[9px] font-bold text-zinc-500 dark:text-zinc-400 mb-4 uppercase tracking-[0.2em]">
                        <span className="w-1 h-1 rounded-full bg-emerald-500 dark:bg-zinc-400 animate-pulse"></span>
                        System Operational
                    </div>
                    <h1 className="text-xl md:text-2xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1 md:mb-2">
                        Good morning, <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-700 to-zinc-400 dark:from-zinc-100 dark:to-zinc-500">Engineer.</span>
                    </h1>
                    <p className="text-xs md:text-sm lg:text-base text-zinc-500 dark:text-zinc-500 font-medium tracking-wide">Overview of your AI engineering workbench.</p>
                </div>

                <div className="flex items-center gap-4">
                    <button className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-md text-xs font-bold uppercase tracking-wider hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(0,0,0,0.1)] dark:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        <Plus className="h-3.5 w-3.5" />
                        New Project
                    </button>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                <StatCard
                    title="Workspaces"
                    value={stats.projects}
                    subtext="active environments"
                    icon={Folder}
                />
                <StatCard
                    title="Intelligence Runs"
                    value={stats.runs}
                    subtext="total executions"
                    icon={Zap}
                />
                <StatCard
                    title="Efficacy Score"
                    value={stats.avgScore.toFixed(1) + "%"}
                    subtext="avg performance"
                    icon={BarChart3}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Projects Table */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Active Projects</h2>
                        <Link href="/workspace/projects" className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors uppercase tracking-widest">See all &rarr;</Link>
                    </div>
                    <ProjectsTable projects={projects} />
                </div>

                {/* Recent Activity Feed */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Timeline</h2>
                        <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-[9px] font-bold text-zinc-500 dark:text-zinc-500 uppercase tracking-widest">
                            Latest
                        </div>
                    </div>

                    <div className="bg-white dark:bg-[#1F1F1F] rounded-md border border-zinc-200 dark:border-white/5 shadow-lg dark:shadow-3xl p-6 h-auto min-h-[200px] overflow-y-auto custom-scrollbar flex flex-col backdrop-blur-md">
                        {Object.keys(groupedActivities).length > 0 ? (
                            Object.entries(groupedActivities).map(([dateGroup, groupActivities]) => (
                                <div key={dateGroup} className="mb-8 last:mb-0 relative">
                                    <div className="flex items-center gap-3 mb-2 px-2">
                                        <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-400 uppercase tracking-widest whitespace-nowrap">{dateGroup}</p>
                                        <div className="h-[1px] flex-1 bg-zinc-200 dark:bg-white/5"></div>
                                    </div>
                                    <div className="space-y-0.5">
                                        {groupActivities.slice(0, 5).map((activity) => (
                                            <ActivityItem
                                                key={activity.id}
                                                title={activity.title}
                                                user={activity.users?.name || activity.users?.email || "Unknown"}
                                                userImage={activity.users?.image_url || activity.users?.avatar_url}
                                                time={formatRelativeTime(activity.created_at)}
                                                fullTime={formatActivityTime(activity.created_at)}
                                                entityType={activity.entity_type}
                                                entityId={activity.entity_id}
                                                projectId={activity.project_id}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
                                <ActivityIcon className="h-8 w-8 text-zinc-300 dark:text-zinc-800" />
                                <p className="text-xs font-medium text-zinc-400 dark:text-zinc-600 tracking-wide uppercase">No system logs yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Custom CSS for scrollbar should be in globals.css ideally, but adding a note here.
