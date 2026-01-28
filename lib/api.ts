import {
    CreateCommitDto,
    CreateProjectDto,
    CreatePromptDto,
    CreateRunDto,
    CreateScoreDto,
    CreateTagDto,
    CreateUserDto,
    User,
    Project,
    Prompt,
    Commit,
    Run,
    Score,
    Tag
} from "../types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// This will be set by components using useAuth hook
let getTokenFn: (() => Promise<string | null>) | null = null;

export function setAuthToken(fn: () => Promise<string | null>) {
    getTokenFn = fn;
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // Get Clerk session token
    let token: string | null = null;
    if (getTokenFn) {
        try {
            token = await getTokenFn();
        } catch (error) {
            console.error("Error getting token:", error);
        }
    }

    const res = await fetch(`${BASE_URL}/api${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options?.headers,
        },
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || `API Error: ${res.statusText}`);
    }

    if (res.status === 204) {
        return {} as T;
    }

    const text = await res.text();
    return text ? JSON.parse(text) : {} as T;
}

export const api = {
    // Users
    createUser: (data: CreateUserDto) => fetchAPI<User>("/users", { method: "POST", body: JSON.stringify(data) }),
    getUsers: () => fetchAPI<User[]>("/users"),
    getUserByEmail: (email: string) => fetchAPI<User>(`/users/email/${email}`),

    // Projects
    createProject: (data: CreateProjectDto) => fetchAPI<Project>("/projects", { method: "POST", body: JSON.stringify(data) }),
    updateProject: (id: string, data: { name?: string; description?: string }) =>
        fetchAPI<Project>(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteProject: (id: string) => fetchAPI(`/projects/${id}`, { method: "DELETE" }),
    getProjects: () => fetchAPI<Project[]>("/projects"),
    getProjectMembers: (projectId: string) => fetchAPI<any[]>(`/projects/${projectId}/members`),
    addProjectMemberByEmail: (projectId: string, data: { email: string; role?: string }) =>
        fetchAPI(`/projects/${projectId}/members/email`, { method: "POST", body: JSON.stringify(data) }),
    removeProjectMember: (projectId: string, userId: string) =>
        fetchAPI(`/projects/${projectId}/members/${userId}`, { method: "DELETE" }),

    // Prompts
    createPrompt: (data: CreatePromptDto) => fetchAPI<Prompt>("/prompts", { method: "POST", body: JSON.stringify(data) }),
    updatePrompt: (id: string, data: { name: string }) =>
        fetchAPI<Prompt>(`/prompts/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deletePrompt: (id: string) => fetchAPI(`/prompts/${id}`, { method: "DELETE" }),
    getPrompts: () => fetchAPI<Prompt[]>("/prompts"),

    // Commits
    createCommit: (data: CreateCommitDto) => fetchAPI<Commit>("/commits", { method: "POST", body: JSON.stringify(data) }),
    deleteCommit: (id: string) => fetchAPI(`/commits/${id}`, { method: "DELETE" }),
    getCommits: () => fetchAPI<Commit[]>("/commits"),

    // Runs
    createRun: (data: CreateRunDto) => fetchAPI<Run>("/runs", { method: "POST", body: JSON.stringify(data) }),
    deleteRun: (id: string) => fetchAPI(`/runs/${id}`, { method: "DELETE" }),
    getRuns: () => fetchAPI<Run[]>("/runs"),
    getAvailableModels: () => fetchAPI<Record<string, string[]>>("/runs/models"),

    // Execution
    executeCommit: (commitId: string, model?: string) => fetchAPI<Run>("/runs/execute", { method: "POST", body: JSON.stringify({ commit_id: commitId, model }) }),

    // Scores
    createScore: (data: CreateScoreDto) => fetchAPI<Score>("/scores", { method: "POST", body: JSON.stringify(data) }),
    deleteScore: (id: string) => fetchAPI(`/scores/${id}`, { method: "DELETE" }),
    getScores: () => fetchAPI<Score[]>("/scores"),

    // Tags
    addTag: (commitId: string, data: CreateTagDto) => fetchAPI<Tag>(`/commits/${commitId}/tags`, { method: "POST", body: JSON.stringify(data) }),
    deleteTag: (commitId: string, tagName: string) => fetchAPI(`/commits/${commitId}/tags/${tagName}`, { method: "DELETE" }),
    getTags: () => fetchAPI<Tag[]>("/tags/mappings"),
    getTagsByCommitId: (commitId: string) => fetchAPI<Tag[]>(`/commits/${commitId}/tags`),

    // Compare
    compareCommits: (commitId1: string, commitId2: string) => fetchAPI<{
        oldCommit: { id: string; system_prompt: string; commit_message: string; created_at: string };
        newCommit: { id: string; system_prompt: string; commit_message: string; created_at: string };
        diff: Array<{ value: string; type: "added" | "removed" | "unchanged" }>;
    }>(`/commits/compare/${commitId1}/${commitId2}`),
};
