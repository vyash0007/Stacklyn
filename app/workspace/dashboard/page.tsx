"use client";

import { useEffect, useState, useMemo } from "react";
import { Folder, Zap, BarChart3, ChevronDown } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityItem } from "@/components/dashboard/ActivityItem";
import { ProjectsTable } from "@/components/dashboard/ProjectsTable";
import { Activity, Project } from "@/types";
import { formatRelativeTime } from "@/lib/utils";

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
                    api.getActivities(5, 0),
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
                    year: 'numeric'
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
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        }) + ' at ' + date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).toLowerCase();
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
                {/* Projects Table */}
                <div className="lg:col-span-2">
                    <ProjectsTable projects={projects} />
                </div>

                {/* Recent Activity Feed - Timeline Style */}
                <div className="bg-white rounded-md border border-slate-200 shadow-sm flex flex-col">
                    <div className="px-4 py-3 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold tracking-tight text-slate-900">Recent Activities</h2>
                            <button className="flex items-center gap-1 text-xs text-[#4F46E5] hover:text-[#4338CA] font-medium">
                                For This Month
                                <ChevronDown className="h-3 w-3" />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[350px] custom-scrollbar px-4 py-3">
                        {Object.keys(groupedActivities).length > 0 ? (
                            Object.entries(groupedActivities).map(([dateGroup, groupActivities]) => (
                                <div key={dateGroup} className="mb-3 last:mb-0">
                                    <p className="text-xs font-medium text-slate-500 mb-0.5">{dateGroup}</p>
                                    <div>
                                        {groupActivities.map((activity) => (
                                            <ActivityItem
                                                key={activity.id}
                                                title={activity.title}
                                                user={activity.users?.name || activity.users?.email || "Unknown"}
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
                            <div className="p-8 text-center text-slate-400 text-sm">
                                No recent activity
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
