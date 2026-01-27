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

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(localStorage.getItem("stacklyn_token") ? { Authorization: `Bearer ${localStorage.getItem("stacklyn_token")}` } : {}),
            ...options?.headers,
        },
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${res.statusText}`);
    }

    return res.json();
}

export const api = {
    // Auth
    login: (data: any) => fetchAPI<{ user: User, token: string }>("/auth/login", { method: "POST", body: JSON.stringify(data) }),
    register: (data: any) => fetchAPI<{ user: User, token: string }>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

    // Users
    createUser: (data: CreateUserDto) => fetchAPI<User>("/users", { method: "POST", body: JSON.stringify(data) }),
    getUsers: () => fetchAPI<User[]>("/users"),
    getUserByEmail: (email: string) => fetchAPI<User>(`/users/email/${email}`),

    // Projects
    createProject: (data: CreateProjectDto) => fetchAPI<Project>("/projects", { method: "POST", body: JSON.stringify(data) }),
    getProjects: () => fetchAPI<Project[]>("/projects"),

    // Prompts
    createPrompt: (data: CreatePromptDto) => fetchAPI<Prompt>("/prompts", { method: "POST", body: JSON.stringify(data) }),
    getPrompts: () => fetchAPI<Prompt[]>("/prompts"),

    // Commits
    createCommit: (data: CreateCommitDto) => fetchAPI<Commit>("/commits", { method: "POST", body: JSON.stringify(data) }),
    getCommits: () => fetchAPI<Commit[]>("/commits"),

    // Runs
    createRun: (data: CreateRunDto) => fetchAPI<Run>("/runs", { method: "POST", body: JSON.stringify(data) }),
    getRuns: () => fetchAPI<Run[]>("/runs"),

    // Execution
    executeCommit: (commitId: string) => fetchAPI<Run>("/runs/execute", { method: "POST", body: JSON.stringify({ commit_id: commitId }) }),

    // Scores
    createScore: (data: CreateScoreDto) => fetchAPI<Score>("/scores", { method: "POST", body: JSON.stringify(data) }),
    getScores: () => fetchAPI<Score[]>("/scores"),

    // Tags
    addTag: (commitId: string, data: CreateTagDto) => fetchAPI<Tag>(`/commits/${commitId}/tags`, { method: "POST", body: JSON.stringify(data) }),
    getTags: () => fetchAPI<Tag[]>("/tags"),
    getTagsByCommitId: (commitId: string) => fetchAPI<Tag[]>(`/commits/${commitId}/tags`),
};
