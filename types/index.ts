export interface User {
    id: string;
    email: string;
    name: string;
    image_url?: string;
    avatar_url?: string;
    profile_image_url?: string;
    created_at: string;
    updated_at: string;
}

export interface ProjectMember {
    user_id: string;
    role: string;
    users?: {
        id: string;
        email: string;
        name?: string;
        image_url?: string;
        avatar_url?: string;
        profile_image_url?: string;
    };
}

export interface Project {
    id: string;
    display_id?: string;
    name: string;
    description: string;
    created_by: string;
    created_at: string;
    updated_at: string;
    members?: ProjectMember[];
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
    commit_tags?: Array<{ tag_name: string }>;
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

export interface Activity {
    id: string;
    user_id: string;
    project_id: string;
    entity_type: 'project' | 'prompt' | 'commit' | 'run' | 'member';
    entity_id: string;
    action: 'created' | 'updated' | 'deleted' | 'executed' | 'failed';
    title: string;
    metadata: any;
    created_at: string;
    users: {
        id: string;
        email: string;
        name: string;
        image_url?: string;
        avatar_url?: string;
        profile_image_url?: string;
    };
    projects: {
        id: string;
        name: string;
    };
    comments?: Comment[];
}

export type CreateUserDto = Omit<User, 'id' | 'created_at' | 'updated_at'>;
export type CreateProjectDto = Omit<Project, 'id' | 'created_at' | 'updated_at'>;
export type CreatePromptDto = Omit<Prompt, 'id' | 'created_at' | 'updated_at'>;
export type CreateCommitDto = Omit<Commit, 'id' | 'created_at' | 'updated_at'>;
export type CreateRunDto = Omit<Run, 'id' | 'created_at'>;
export type CreateScoreDto = Omit<Score, 'id' | 'created_at'>;
export type CreateTagDto = { tagName: string };

export interface Task {
    id: string;
    title: string;
    status: 'in_progress' | 'completed' | 'pending';
    assignee?: {
        name: string;
        avatar: string;
        color: string;
    };
    dueDate?: string;
    createdAt: string;
}

export interface Comment {
    id: string;
    user: {
        name: string;
        avatar: string;
        color: string;
        image_url?: string;
    };
    content: string;
    timestamp: string;
    replies?: Comment[];
}

export interface ChatMessage {
    id: string;
    project_id: string;
    user_id: string | null;
    content: string;
    parent_message_id: string | null;
    created_at: string;
    updated_at: string | null;
    user?: {
        id: string;
        name: string;
        image_url?: string;
    };
    replies_count?: number;
    reactions?: MessageReaction[];
}

export interface MessageReaction {
    emoji: string;
    count: number;
    current_user_reacted: boolean;
    users: {
        id: string;
        name: string | null;
        image_url: string | null;
    }[];
}

// Model types
export interface ModelInfo {
    id: string;
    name: string;
    icon: string;
}

export type ModelProvider = 'groq' | 'openai' | 'anthropic' | 'gemini';

export type AvailableModels = Record<ModelProvider, ModelInfo[]>;

// Re-export WebSocket types
export * from './websocket';
