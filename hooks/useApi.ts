"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback, useMemo } from "react";
import { toast } from "sonner";

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
                endpoint.includes('/tags/mappings') || endpoint.includes('/activities') ||
                endpoint.includes('/memberships');
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
                endpoint.includes('/tags/mappings') || endpoint.includes('/activities') ||
                endpoint.includes('/memberships');
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
            const errorData = await res.json().catch(() => ({}));
            const errorMessage = errorData.error || errorData.message || `API Error: ${res.statusText}`;

            if (res.status === 401) {
                throw new Error(errorMessage || 'Authentication required. Please sign in.');
            }
            if (res.status === 403) {
                toast.error(errorMessage);
                return {} as T; // Return empty instead of throwing to avoid error overlay
            }
            if (res.status === 404) {
                throw new Error(errorMessage || 'Resource not found.');
            }

            throw new Error(errorMessage);
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
        updateMe: (data: any) => fetchWithAuth<any>("/users/me", {
            method: "PUT",
            body: JSON.stringify(data),
        }),
        deleteMe: () => fetchWithAuth<void>("/users/me", {
            method: "DELETE",
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
        getProjectMemberships: () => fetchWithAuth<any[]>("/projects/memberships"),

        // Prompts
        getPrompts: () => fetchWithAuth<any[]>("/prompts"),
        getPromptsByProject: (projectId: string) => fetchWithAuth<any[]>(`/prompts/project/${projectId}`),
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
        getCommitsByPrompt: (promptId: string) => fetchWithAuth<any[]>(`/commits/prompt/${promptId}`),
        getCommit: (id: string) => fetchWithAuth<any>(`/commits/${id}`),
        createCommit: (data: any) => fetchWithAuth<any>("/commits", {
            method: "POST",
            body: JSON.stringify(data),
        }),
        deleteCommit: (id: string) => fetchWithAuth<void>(`/commits/${id}`, { method: "DELETE" }),

        // Runs
        getRuns: () => fetchWithAuth<any[]>("/runs"),
        getRunsByCommit: (commitId: string) => fetchWithAuth<any[]>(`/runs/commit/${commitId}`),
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

        // Activities
        getActivities: (limit: number = 20, offset: number = 0) =>
            fetchWithAuth<any[]>(`/activities?limit=${limit}&offset=${offset}`),

        // Chat
        getProjectMessages: (projectId: string) =>
            fetchWithAuth<any[]>(`/projects/${projectId}/chat`),
        createMessage: (projectId: string, content: string) =>
            fetchWithAuth<any>(`/projects/${projectId}/chat`, {
                method: "POST",
                body: JSON.stringify({ content }),
            }),
        getMessageReplies: (projectId: string, messageId: string) =>
            fetchWithAuth<any[]>(`/projects/${projectId}/chat/${messageId}/replies`),
        createReply: (projectId: string, messageId: string, content: string) =>
            fetchWithAuth<any>(`/projects/${projectId}/chat/${messageId}/replies`, {
                method: "POST",
                body: JSON.stringify({ content }),
            }),
        updateMessage: (projectId: string, messageId: string, content: string) =>
            fetchWithAuth<any>(`/projects/${projectId}/chat/${messageId}`, {
                method: "PUT",
                body: JSON.stringify({ content }),
            }),
        deleteMessage: (projectId: string, messageId: string) =>
            fetchWithAuth<void>(`/projects/${projectId}/chat/${messageId}`, {
                method: "DELETE",
            }),

        // Reactions
        getMessageReactions: (projectId: string, messageId: string) =>
            fetchWithAuth<any[]>(`/projects/${projectId}/chat/${messageId}/reactions`),
        addReaction: (projectId: string, messageId: string, emoji: string) =>
            fetchWithAuth<any>(`/projects/${projectId}/chat/${messageId}/reactions`, {
                method: "POST",
                body: JSON.stringify({ emoji }),
            }),
        removeReaction: (projectId: string, messageId: string, emoji: string) =>
            fetchWithAuth<void>(`/projects/${projectId}/chat/${messageId}/reactions/${encodeURIComponent(emoji)}`, {
                method: "DELETE",
            }),

        // Mock Tasks
        getTasks: async () => {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            return [
                {
                    id: '1',
                    title: 'Greetings! Greet the client, and thank them for their purchase.',
                    status: 'in_progress',
                    assignee: { name: 'Luke', avatar: 'L', color: 'bg-cyan-100 text-cyan-700' },
                    dueDate: new Date().toISOString(),
                    createdAt: new Date().toISOString()
                },
                {
                    id: '2',
                    title: 'Get to Work. Start working on the order.',
                    status: 'pending',
                    dueDate: new Date(Date.now() + 86400000).toISOString(),
                    createdAt: new Date().toISOString()
                },
                {
                    id: '3',
                    title: 'QA Step. Submit deliverables to Account Manager for review.',
                    status: 'pending',
                    assignee: { name: 'Mike', avatar: 'M', color: 'bg-amber-100 text-amber-700' },
                    dueDate: new Date(Date.now() + 172800000).toISOString(),
                    createdAt: new Date().toISOString()
                }
            ] as any[];
        },
        createTask: async (task: any) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                id: Math.random().toString(36).substr(2, 9),
                ...task,
                createdAt: new Date().toISOString()
            };
        },

        // Mock Comments
        getComments: async () => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return [
                {
                    id: 'c1',
                    user: { name: 'Nikhil Arora', avatar: 'N', color: 'bg-green-100 text-green-700', image_url: undefined },
                    content: 'Sit fugiat ratione commodi nihil. Quo et eaque natus sunt similique consequuntur. Aliquid et excepturi dolorem veniam autem.',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                }
            ] as any[];
        },
        postComment: async (content: string) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return {
                id: Math.random().toString(36).substr(2, 9),
                content,
                timestamp: new Date().toISOString(),
                user: { name: 'You', avatar: 'Y', color: 'bg-indigo-100 text-indigo-700', image_url: undefined }
            };
        },
        deleteTask: async (id: string) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            return true;
        }
    }), [fetchWithAuth]);
}
