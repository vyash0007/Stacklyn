"use client";

import React, { useState, useEffect } from 'react';
import { ChatMessage } from '@/types';
import { useApi } from '@/hooks/useApi';
import { formatDistanceToNow } from 'date-fns';
import { Send, Loader2 } from 'lucide-react';

interface CommentSectionProps {
    projectId?: string;
}

// Helper to generate avatar initials and color from name
const getAvatarProps = (name?: string) => {
    const displayName = name || 'Unknown';
    const initial = displayName.charAt(0).toUpperCase();
    const colors = [
        'bg-green-100 text-green-700',
        'bg-cyan-100 text-cyan-700',
        'bg-amber-100 text-amber-700',
        'bg-indigo-100 text-indigo-700',
        'bg-pink-100 text-pink-700',
        'bg-purple-100 text-purple-700',
    ];
    // Simple hash to pick a consistent color
    const colorIndex = displayName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return { initial, color: colors[colorIndex] };
};

export const CommentSection: React.FC<CommentSectionProps> = ({ projectId }) => {
    const { getProjectMessages, createMessage, getComments, postComment } = useApi();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);

    useEffect(() => {
        const loadMessages = async () => {
            try {
                if (projectId) {
                    // Use real API
                    const data = await getProjectMessages(projectId);
                    setMessages(data || []);
                } else {
                    // Fallback to mock for dashboard without project context
                    // @ts-ignore
                    const data = await getComments();
                    // Transform mock data to ChatMessage format
                    const transformed: ChatMessage[] = data.map((c: any) => ({
                        id: c.id,
                        project_id: '',
                        user_id: null,
                        content: c.content,
                        parent_message_id: null,
                        created_at: c.timestamp,
                        updated_at: null,
                        user: {
                            id: c.id,
                            name: c.user.name,
                            image_url: c.user.image_url,
                        },
                    }));
                    setMessages(transformed);
                }
            } catch (error) {
                console.error("Failed to load messages:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadMessages();
    }, [projectId, getProjectMessages, getComments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setIsPosting(true);
        try {
            if (projectId) {
                // Use real API
                const message = await createMessage(projectId, newMessage.trim());
                setMessages(prev => [message, ...prev]);
            } else {
                // Fallback to mock
                // @ts-ignore
                const comment = await postComment(newMessage);
                const transformed: ChatMessage = {
                    id: comment.id,
                    project_id: '',
                    user_id: null,
                    content: comment.content,
                    parent_message_id: null,
                    created_at: comment.timestamp,
                    updated_at: null,
                    user: {
                        id: comment.id,
                        name: comment.user.name,
                        image_url: comment.user.image_url,
                    },
                };
                setMessages(prev => [transformed, ...prev]);
            }
            setNewMessage('');
        } catch (error) {
            console.error("Failed to post message:", error);
        } finally {
            setIsPosting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {projectId && (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-800 flex items-center gap-2">
                    <span className="font-bold bg-amber-200 text-amber-900 w-5 h-5 flex items-center justify-center rounded text-xs">
                        {messages.length}
                    </span>
                    messages in this project
                </div>
            )}

            <form onSubmit={handleSubmit} className="relative">
                <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Write a message..."
                    className="w-full p-4 pr-12 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none min-h-[100px] text-sm"
                />
                <button
                    type="submit"
                    disabled={isPosting || !newMessage.trim()}
                    className="absolute right-3 bottom-3 p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
            </form>

            <div className="space-y-6">
                {messages.map((message) => {
                    const { initial, color } = getAvatarProps(message.user?.name);
                    return (
                        <div key={message.id} className="flex gap-4">
                            {message.user?.image_url ? (
                                <img
                                    src={message.user.image_url}
                                    alt={message.user.name || 'User'}
                                    className="shrink-0 w-8 h-8 rounded-full ring-2 ring-white shadow-sm object-cover"
                                />
                            ) : (
                                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${color} ring-2 ring-white shadow-sm`}>
                                    {initial}
                                </div>
                            )}
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-slate-900">
                                        {message.user?.name || 'Unknown User'}
                                    </span>
                                    <span className="text-xs text-slate-400">posted</span>
                                </div>
                                <div className="text-xs text-slate-400 mb-2">
                                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    {message.content}
                                </p>
                                {message.replies_count && message.replies_count > 0 && (
                                    <div className="text-xs text-indigo-600 mt-2">
                                        {message.replies_count} {message.replies_count === 1 ? 'reply' : 'replies'}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                {messages.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-sm">
                        No messages yet. Start the conversation!
                    </div>
                )}
            </div>
        </div>
    );
};
