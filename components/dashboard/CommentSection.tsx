"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Comment } from '@/types';
import { useApi } from '@/hooks/useApi';
import { formatDistanceToNow } from 'date-fns';
import { Send, Loader2 } from 'lucide-react';

export const CommentSection: React.FC = () => {
    const { getComments, postComment } = useApi();
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isPosting, setIsPosting] = useState(false);

    useEffect(() => {
        const loadComments = async () => {
            try {
                // @ts-ignore - mock function might not be strictly typed in hook definition yet
                const data = await getComments();
                setComments(data);
            } catch (error) {
                console.error("Failed to load comments:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadComments();
    }, [getComments]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsPosting(true);
        try {
            // @ts-ignore
            const comment = await postComment(newComment);
            setComments(prev => [...prev, comment]);
            setNewComment('');
        } catch (error) {
            console.error("Failed to post comment:", error);
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
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-sm text-amber-800 flex items-center gap-2">
                <span className="font-bold bg-amber-200 text-amber-900 w-5 h-5 flex items-center justify-center rounded text-xs">2</span>
                people are from Globex Industries
            </div>

            <form onSubmit={handleSubmit} className="relative">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Message to the client..."
                    className="w-full p-4 pr-12 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none min-h-[100px] text-sm"
                />
                <button
                    type="submit"
                    disabled={isPosting || !newComment.trim()}
                    className="absolute right-3 bottom-3 p-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isPosting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </button>
            </form>

            <div className="space-y-6">
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${comment.user.color} ring-2 ring-white shadow-sm`}>
                            {comment.user.avatar}
                        </div>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-900">{comment.user.name}</span>
                                <span className="text-xs text-slate-400">replied</span>
                            </div>
                            <div className="text-xs text-slate-400 mb-2">
                                {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {comment.content}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
