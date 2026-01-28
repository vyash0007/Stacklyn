"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Users, Folder, Clock, Shield, UserCircle } from "lucide-react";
import { useApi } from "@/hooks/useApi";
import { formatRelativeTime } from "@/lib/utils";

interface ProjectMembership {
    project_id: string;
    user_id: string;
    role: string;
    created_at: string;
    projects: {
        id: string;
        name: string;
        description?: string;
        created_at: string;
        updated_at: string;
    };
    users: {
        id: string;
        email: string;
        name: string;
    };
}

export default function TeamsPage() {
    const api = useApi();
    const [memberships, setMemberships] = useState<ProjectMembership[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadMemberships = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await api.getProjectMemberships();
            setMemberships(data);
        } catch (error) {
            console.error("Failed to load memberships", error);
        } finally {
            setIsLoading(false);
        }
    }, [api]);

    useEffect(() => {
        loadMemberships();
    }, [loadMemberships]);

    const getRoleBadgeStyles = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-indigo-100 text-indigo-700';
            case 'member':
                return 'bg-emerald-100 text-emerald-700';
            case 'viewer':
                return 'bg-slate-100 text-slate-600';
            default:
                return 'bg-slate-100 text-slate-600';
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2.5 bg-indigo-50 rounded-md">
                        <Users className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h1 className="text-3xl font-lg tracking-tight text-slate-900">Teams</h1>
                </div>
                <p className="text-slate-500 mt-2">
                    Projects you have access to as a team member.
                </p>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-md border border-slate-200 p-6 animate-pulse">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-md"></div>
                                <div className="w-16 h-5 bg-slate-100 rounded-full"></div>
                            </div>
                            <div className="h-5 w-3/4 bg-slate-100 rounded mb-2"></div>
                            <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
                        </div>
                    ))}
                </div>
            )}

            {/* Projects Grid */}
            {!isLoading && memberships.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {memberships.map((membership) => (
                        <Link
                            key={membership.project_id}
                            href={`/workspace/projects/${membership.project_id}`}
                            className="group block bg-white rounded-md border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-200/50 hover:border-indigo-200 transition-all cursor-pointer relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-slate-50 rounded-bl-[80px] -mr-6 -mt-6 transition-colors group-hover:bg-indigo-50"></div>

                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-2.5 bg-slate-50 rounded-md group-hover:bg-indigo-50 transition-colors">
                                        <Folder className="h-5 w-5 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-lg tracking-tight uppercase ${getRoleBadgeStyles(membership.role)}`}>
                                        <Shield className="h-3 w-3" />
                                        {membership.role}
                                    </span>
                                </div>

                                <h3 className="text-lg font-lg tracking-tight text-slate-900 mb-2">
                                    {membership.projects.name}
                                </h3>
                                <p className="text-slate-500 text-sm mb-6 line-clamp-2 h-10">
                                    {membership.projects.description || "No description provided."}
                                </p>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                    <div className="flex items-center gap-2 text-[11px] font-lg tracking-tight text-slate-500">
                                        <UserCircle className="h-3.5 w-3.5" />
                                        <span>Joined {formatRelativeTime(membership.created_at)}</span>
                                    </div>
                                    <div className="flex items-center text-[11px] font-lg tracking-tight text-slate-400">
                                        <Clock className="h-3 w-3 mr-1" />
                                        {membership.projects.updated_at
                                            ? new Date(membership.projects.updated_at).toLocaleDateString()
                                            : "Never"}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading && memberships.length === 0 && (
                <div className="text-center py-20 bg-white border-2 border-dashed border-slate-200 rounded-md">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-lg tracking-tight text-slate-900 mb-2">No team projects</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">
                        You haven't been added to any projects yet. Ask a project admin to invite you.
                    </p>
                </div>
            )}
        </div>
    );
}
