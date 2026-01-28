"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useMemo } from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export function useApi() {
    const { getToken } = useAuth();

    const fetchWithAuth = useCallback(async <T>(
        endpoint: string,
        options?: RequestInit
    ): Promise<T> => {
        let token: string | null = null;
        try {
            token = await getToken();
        } catch (e: any) {
            // Auth is still loading or user not signed in - return empty data gracefully
            console.debug(`[API] Auth not ready for ${endpoint}, returning empty`);
            const isList = endpoint.includes('/users') || endpoint.includes('/projects') ||
                endpoint.includes('/prompts') || endpoint.includes('/commits') ||
                endpoint.includes('/runs') || endpoint.includes('/scores') ||
                endpoint.includes('/tags/mappings');
            if (endpoint.includes('/search')) {
                return { projects: [], prompts: [], commits: [] } as T;
            }
            return (isList ? [] : {}) as T;
        }

        if (!token) {
            // Auth is still loading - return empty data gracefully
            console.debug(`[API] No token yet for ${endpoint}, returning empty`);
            const isList = endpoint.includes('/users') || endpoint.includes('/projects') ||
                endpoint.includes('/prompts') || endpoint.includes('/commits') ||
                endpoint.includes('/runs') || endpoint.includes('/scores') ||
                endpoint.includes('/tags/mappings');
            if (endpoint.includes('/search')) {
                return { projects: [], prompts: [], commits: [] } as T;
            }
            return (isList ? [] : {}) as T;
        }

        const res = await fetch(`${BASE_URL}/api${endpoint}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...options?.headers,
            },
        });

        if (!res.ok) {
            // Now we have a token but backend rejected it - this is a real error
            if (res.status === 401) {
                throw new Error('Authentication required. Please sign in.');
            }
            if (res.status === 403) {
                throw new Error('Access denied. You do not have permission to access this resource.');
            }
            if (res.status === 404) {
                throw new Error('Resource not found.');
            }

            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || `API Error: ${res.statusText}`);
        }

        if (res.status === 204) {
            return {} as T;
        }

        const text = await res.text();
        return text ? JSON.parse(text) : {} as T;
    }, [getToken]);

    return useMemo(() => ({
        // Users
        getUsers: () => fetchWithAuth<any[]>("/users"),
        getUser: (id: string) => fetchWithAuth<any>(`/users/${id}`),
        getUserByEmail: (email: string) => fetchWithAuth<any>(`/users/email/${email}`),
        createUser: (data: any) => fetchWithAuth<any>("/users", {
            method: "POST",
            body: JSON.stringify(data),
        }),

        // Projects
        getProjects: () => fetchWithAuth<any[]>("/projects"),
        getProject: (id: string) => fetchWithAuth<any>(`/projects/${id}`),
        createProject: (data: any) => fetchWithAuth<any>("/projects", {
            method: "POST",
            body: JSON.stringify(data),
        }),
        updateProject: (id: string, data: any) => fetchWithAuth<any>(`/projects/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
        deleteProject: (id: string) => fetchWithAuth<void>(`/projects/${id}`, {
            method: "DELETE",
        }),
        getProjectMembers: (projectId: string) => fetchWithAuth<any[]>(`/projects/${projectId}/members`),
        addProjectMemberByEmail: (projectId: string, data: { email: string; role?: string }) =>
            fetchWithAuth(`/projects/${projectId}/members/email`, { method: "POST", body: JSON.stringify(data) }),
        removeProjectMember: (projectId: string, userId: string) =>
            fetchWithAuth(`/projects/${projectId}/members/${userId}`, { method: "DELETE" }),

        // Prompts
        getPrompts: () => fetchWithAuth<any[]>("/prompts"),
        getPrompt: (id: string) => fetchWithAuth<any>(`/prompts/${id}`),
        createPrompt: (data: any) => fetchWithAuth<any>("/prompts", {
            method: "POST",
            body: JSON.stringify(data),
        }),
        updatePrompt: (id: string, data: { name: string }) => fetchWithAuth<any>(`/prompts/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),
        deletePrompt: (id: string) => fetchWithAuth<void>(`/prompts/${id}`, { method: "DELETE" }),

        // Commits
        getCommits: () => fetchWithAuth<any[]>("/commits"),
        getCommit: (id: string) => fetchWithAuth<any>(`/commits/${id}`),
        createCommit: (data: any) => fetchWithAuth<any>("/commits", {
            method: "POST",
            body: JSON.stringify(data),
        }),
        deleteCommit: (id: string) => fetchWithAuth<void>(`/commits/${id}`, { method: "DELETE" }),

        // Runs
        getRuns: () => fetchWithAuth<any[]>("/runs"),
        getRun: (id: string) => fetchWithAuth<any>(`/runs/${id}`),
        createRun: (data: any) => fetchWithAuth<any>("/runs", {
            method: "POST",
            body: JSON.stringify(data),
        }),
        deleteRun: (id: string) => fetchWithAuth<void>(`/runs/${id}`, { method: "DELETE" }),
        getAvailableModels: () => fetchWithAuth<Record<string, string[]>>("/runs/models"),
        executeCommit: (commitId: string, model?: string) =>
            fetchWithAuth<any>("/runs/execute", { method: "POST", body: JSON.stringify({ commit_id: commitId, model }) }),

        // Scores
        getScores: () => fetchWithAuth<any[]>("/scores"),
        getScore: (id: string) => fetchWithAuth<any>(`/scores/${id}`),
        createScore: (data: any) => fetchWithAuth<any>("/scores", {
            method: "POST",
            body: JSON.stringify(data),
        }),
        deleteScore: (id: string) => fetchWithAuth<void>(`/scores/${id}`, { method: "DELETE" }),

        // Tags
        getTags: () => fetchWithAuth<any[]>("/tags/mappings"),
        getTagsByCommitId: (commitId: string) => fetchWithAuth<any[]>(`/commits/${commitId}/tags`),
        addTag: (commitId: string, data: any) =>
            fetchWithAuth<any>(`/commits/${commitId}/tags`, { method: "POST", body: JSON.stringify(data) }),
        deleteTag: (commitId: string, tagName: string) =>
            fetchWithAuth<void>(`/commits/${commitId}/tags/${tagName}`, { method: "DELETE" }),

        // Compare
        compareCommits: (commitId1: string, commitId2: string) => fetchWithAuth<{
            oldCommit: { id: string; system_prompt: string; commit_message: string; created_at: string };
            newCommit: { id: string; system_prompt: string; commit_message: string; created_at: string };
            diff: Array<{ value: string; type: "added" | "removed" | "unchanged" }>;
        }>(`/commits/compare/${commitId1}/${commitId2}`),

        // Search
        searchWorkspace: (query: string) => fetchWithAuth<{
            projects: any[];
            prompts: any[];
            commits: any[];
        }>(`/search?q=${encodeURIComponent(query)}`),
    }), [fetchWithAuth]);
}
