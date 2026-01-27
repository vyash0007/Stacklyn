export interface User {
    id: string;
    email: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface Prompt {
    id: string;
    name: string;
    project_id: string;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface Commit {
    id: string;
    prompt_id: string;
    system_prompt: string;
    user_query: string;
    commit_message: string;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface Run {
    id: string;
    commit_id: string;
    model_name: string;
    response: string;
    latency_ms: number;
    token_usage: number;
    status: string;
    created_at: string;
}

export interface Score {
    id: string;
    commit_id: string;
    score: number;
    scorer: string;
    reference_prompt?: string;
    actual_prompt?: string;
    reasoning?: string;
    created_at: string;
}

export interface Tag {
    commit_id: string;
    tag_name: string;
    created_at: string;
}

export type CreateUserDto = Omit<User, 'id' | 'created_at' | 'updated_at'>;
export type CreateProjectDto = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
export type CreatePromptDto = Omit<Prompt, 'id' | 'created_at' | 'updated_at'>;
export type CreateCommitDto = Omit<Commit, 'id' | 'created_at' | 'updated_at'>;
export type CreateRunDto = Omit<Run, 'id' | 'created_at'>;
export type CreateScoreDto = Omit<Score, 'id' | 'created_at'>;
export type CreateTagDto = { tagName: string };
