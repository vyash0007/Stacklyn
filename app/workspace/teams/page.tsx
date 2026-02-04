"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    MoreHorizontal,
    MessageSquare,
    Send,
    Loader2,
    ChevronDown,
    ChevronUp,
    Reply,
    ExternalLink,
    ListFilter,
    Wifi,
    WifiOff
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useApi } from '@/hooks/useApi';
import { ChatMessage, Project, MessageReaction } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';
import { EmojiPicker } from '@/components/chat/EmojiPicker';
import { ReactionsSummary } from '@/components/chat/ReactionsSummary';
import { MentionDropdown, MentionUser } from '@/components/chat/MentionDropdown';
import { useWebSocket } from '@/components/providers/WebSocketProvider';
import { UserAvatar } from '@/components/ui/UserAvatar';

const TeamsPage = () => {
    const api = useApi();
    const { isConnected, onlineUsers, joinProject, leaveProject, onNewMessage, onNewReply, onNewReaction, onReactionRemoved } = useWebSocket();
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [isProjectListOpen, setIsProjectListOpen] = useState(true);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);

    // Thread state
    const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());
    const [threadReplies, setThreadReplies] = useState<{ [messageId: string]: ChatMessage[] }>({});
    const [loadingThreads, setLoadingThreads] = useState<Set<string>>(new Set());
    const [replyInputs, setReplyInputs] = useState<{ [messageId: string]: string }>({});
    const [sendingReply, setSendingReply] = useState<string | null>(null);

    // Reactions state
    const [messageReactions, setMessageReactions] = useState<{ [messageId: string]: MessageReaction[] }>({});

    // Mention state
    const [projectMembers, setProjectMembers] = useState<MentionUser[]>([]);
    const [showMentionDropdown, setShowMentionDropdown] = useState(false);

    // Scroll ref for auto-scrolling to bottom
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const [mentionSearchTerm, setMentionSearchTerm] = useState('');
    const [mentionInputType, setMentionInputType] = useState<'main' | string>('main'); // 'main' or messageId for replies

    // Load projects on mount (owned + shared via membership)
    useEffect(() => {
        const loadProjects = async () => {
            try {
                // Fetch both owned projects and memberships
                const [ownedProjects, memberships] = await Promise.all([
                    api.getProjects(),
                    api.getProjectMemberships(),
                ]);

                // Combine owned projects with shared projects from memberships
                const ownedList = ownedProjects || [];
                const sharedProjects = (memberships || [])
                    .filter((m: any) => m.projects)
                    .map((m: any) => m.projects);

                // Merge and remove duplicates by id
                const allProjects = [...ownedList];
                sharedProjects.forEach((shared: Project) => {
                    if (!allProjects.find(p => p.id === shared.id)) {
                        allProjects.push(shared);
                    }
                });

                setProjects(allProjects);
                if (allProjects.length > 0) {
                    setSelectedProjectId(allProjects[0].id);
                }
            } catch (error) {
                console.error("Failed to load projects:", error);
            }
        };
        loadProjects();
    }, [api]);

    // Load messages when project changes
    useEffect(() => {
        const loadMessages = async () => {
            if (!selectedProjectId) {
                setIsLoading(false);
                return;
            }
            setIsLoading(true);
            // Reset thread state when switching projects
            setExpandedThreads(new Set());
            setThreadReplies({});
            setReplyInputs({});
            setMessageReactions({});
            try {
                const data = await api.getProjectMessages(selectedProjectId);
                setMessages(data || []);

                // Load reactions for all messages
                if (data && data.length > 0) {
                    const reactionsPromises = data.map(async (msg: ChatMessage) => {
                        try {
                            const reactions = await api.getMessageReactions(selectedProjectId, msg.id);
                            return { messageId: msg.id, reactions };
                        } catch {
                            return { messageId: msg.id, reactions: [] };
                        }
                    });
                    const reactionsResults = await Promise.all(reactionsPromises);
                    const reactionsMap: { [key: string]: MessageReaction[] } = {};
                    reactionsResults.forEach(({ messageId, reactions }) => {
                        reactionsMap[messageId] = reactions;
                    });
                    setMessageReactions(reactionsMap);
                }
            } catch (error) {
                console.error("Failed to load messages:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadMessages();
        setIsProjectListOpen(false); // Close mobile project list on selection
    }, [selectedProjectId, api]);

    // Load project members when project changes (for @mentions)
    useEffect(() => {
        const loadMembers = async () => {
            if (!selectedProjectId) {
                setProjectMembers([]);
                return;
            }
            try {
                const members = await api.getProjectMembers(selectedProjectId);
                // Transform members to MentionUser format
                const mentionUsers: MentionUser[] = (members || []).map((m: any) => ({
                    id: m.users?.id || m.user_id,
                    name: m.users?.name || null,
                    image_url: m.users?.image_url || null,
                    email: m.users?.email || null,
                }));
                setProjectMembers(mentionUsers);
            } catch (error) {
                console.error("Failed to load project members:", error);
            }
        };
        loadMembers();
    }, [selectedProjectId, api]);

    // WebSocket: Join/leave project room when selection changes
    useEffect(() => {
        if (selectedProjectId && isConnected) {
            joinProject(selectedProjectId);
        }
        return () => {
            if (selectedProjectId) {
                leaveProject(selectedProjectId);
            }
        };
    }, [selectedProjectId, isConnected, joinProject, leaveProject]);

    // WebSocket: Handle new messages in real-time
    const handleNewMessage = useCallback((data: { projectId: string; message: any }) => {
        if (data.projectId === selectedProjectId) {
            const transformedMessage: ChatMessage = {
                id: data.message.id,
                project_id: selectedProjectId,
                user_id: data.message.user?.id || null,
                content: data.message.content,
                parent_message_id: data.message.parent_message_id,
                created_at: data.message.created_at,
                updated_at: data.message.updated_at,
                user: data.message.user ? {
                    id: data.message.user.id,
                    name: data.message.user.name,
                    image_url: data.message.user.image_url,
                } : undefined,
                replies_count: data.message.replies_count || 0,
            };
            setMessages(prev => {
                // Avoid duplicates
                if (prev.some(m => m.id === transformedMessage.id)) {
                    return prev;
                }
                return [...prev, transformedMessage];
            });
        }
    }, [selectedProjectId]);

    // WebSocket: Handle new replies in real-time
    const handleNewReply = useCallback((data: { projectId: string; parentMessageId: string; reply: any }) => {
        if (data.projectId === selectedProjectId) {
            const transformedReply: ChatMessage = {
                id: data.reply.id,
                project_id: selectedProjectId,
                user_id: data.reply.user?.id || null,
                content: data.reply.content,
                parent_message_id: data.reply.parent_message_id,
                created_at: data.reply.created_at,
                updated_at: data.reply.updated_at,
                user: data.reply.user ? {
                    id: data.reply.user.id,
                    name: data.reply.user.name,
                    image_url: data.reply.user.image_url,
                } : undefined,
            };
            // Add to thread replies if thread is expanded
            setThreadReplies(prev => {
                const existingReplies = prev[data.parentMessageId] || [];
                if (existingReplies.some(r => r.id === transformedReply.id)) {
                    return prev;
                }
                return {
                    ...prev,
                    [data.parentMessageId]: [...existingReplies, transformedReply],
                };
            });
            // Update reply count on parent message
            setMessages(prev => prev.map(m => 
                m.id === data.parentMessageId 
                    ? { ...m, replies_count: (m.replies_count || 0) + 1 }
                    : m
            ));
        }
    }, [selectedProjectId]);

    // WebSocket: Handle new reactions
    const handleNewReactionWS = useCallback((data: { projectId: string; messageId: string; reaction: any }) => {
        if (data.projectId === selectedProjectId) {
            // Reload reactions for the message
            api.getMessageReactions(selectedProjectId, data.messageId).then(reactions => {
                setMessageReactions(prev => ({
                    ...prev,
                    [data.messageId]: reactions,
                }));
            }).catch(console.error);
        }
    }, [selectedProjectId, api]);

    // WebSocket: Handle reaction removed
    const handleReactionRemovedWS = useCallback((data: { projectId: string; messageId: string }) => {
        if (data.projectId === selectedProjectId) {
            // Reload reactions for the message
            api.getMessageReactions(selectedProjectId, data.messageId).then(reactions => {
                setMessageReactions(prev => ({
                    ...prev,
                    [data.messageId]: reactions,
                }));
            }).catch(console.error);
        }
    }, [selectedProjectId, api]);

    // Subscribe to WebSocket events
    useEffect(() => {
        if (!selectedProjectId) return;

        const unsubMessage = onNewMessage(handleNewMessage);
        const unsubReply = onNewReply(handleNewReply);
        const unsubReaction = onNewReaction(handleNewReactionWS);
        const unsubReactionRemoved = onReactionRemoved(handleReactionRemovedWS);
        
        return () => {
            unsubMessage();
            unsubReply();
            unsubReaction();
            unsubReactionRemoved();
        };
    }, [selectedProjectId, onNewMessage, onNewReply, onNewReaction, onReactionRemoved, handleNewMessage, handleNewReply, handleNewReactionWS, handleReactionRemovedWS]);

    // Handle input change for main message (detect @mentions)
    const handleMessageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNewMessage(value);

        // Check for @ symbol to trigger mention dropdown
        const lastAtIndex = value.lastIndexOf('@');
        if (lastAtIndex !== -1) {
            const textAfterAt = value.slice(lastAtIndex + 1);
            // Only show dropdown if @ is at start or preceded by space, and no space after @
            const charBeforeAt = lastAtIndex > 0 ? value[lastAtIndex - 1] : ' ';
            if ((charBeforeAt === ' ' || lastAtIndex === 0) && !textAfterAt.includes(' ')) {
                setMentionSearchTerm(textAfterAt);
                setMentionInputType('main');
                setShowMentionDropdown(true);
                return;
            }
        }
        setShowMentionDropdown(false);
    };

    // Handle mention selection
    const handleMentionSelect = (user: MentionUser) => {
        if (mentionInputType === 'main') {
            const lastAtIndex = newMessage.lastIndexOf('@');
            const beforeMention = newMessage.slice(0, lastAtIndex);
            const mention = `@${user.name || 'user'} `;
            setNewMessage(beforeMention + mention);
        } else {
            // For reply inputs
            const currentReply = replyInputs[mentionInputType] || '';
            const lastAtIndex = currentReply.lastIndexOf('@');
            const beforeMention = currentReply.slice(0, lastAtIndex);
            const mention = `@${user.name || 'user'} `;
            setReplyInputs(prev => ({ ...prev, [mentionInputType]: beforeMention + mention }));
        }
        setShowMentionDropdown(false);
    };

    // Handle reply input change (detect @mentions)
    const handleReplyInputChange = (messageId: string, value: string) => {
        setReplyInputs(prev => ({ ...prev, [messageId]: value }));

        // Check for @ symbol to trigger mention dropdown
        const lastAtIndex = value.lastIndexOf('@');
        if (lastAtIndex !== -1) {
            const textAfterAt = value.slice(lastAtIndex + 1);
            const charBeforeAt = lastAtIndex > 0 ? value[lastAtIndex - 1] : ' ';
            if ((charBeforeAt === ' ' || lastAtIndex === 0) && !textAfterAt.includes(' ')) {
                setMentionSearchTerm(textAfterAt);
                setMentionInputType(messageId);
                setShowMentionDropdown(true);
                return;
            }
        }
        if (mentionInputType === messageId) {
            setShowMentionDropdown(false);
        }
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !selectedProjectId) return;

        setIsSending(true);
        try {
            // Just send to API - WebSocket will broadcast the message back
            await api.createMessage(selectedProjectId, newMessage.trim());
            setNewMessage('');
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Toggle thread expansion and load replies
    const toggleThread = async (messageId: string) => {
        const newExpanded = new Set(expandedThreads);

        if (newExpanded.has(messageId)) {
            // Collapse thread
            newExpanded.delete(messageId);
            setExpandedThreads(newExpanded);
        } else {
            // Expand thread and load replies if not already loaded
            newExpanded.add(messageId);
            setExpandedThreads(newExpanded);

            if (!threadReplies[messageId] && selectedProjectId) {
                // Load replies
                setLoadingThreads(prev => new Set(prev).add(messageId));
                try {
                    const replies = await api.getMessageReplies(selectedProjectId, messageId);
                    setThreadReplies(prev => ({ ...prev, [messageId]: replies || [] }));
                } catch (error) {
                    console.error("Failed to load replies:", error);
                } finally {
                    setLoadingThreads(prev => {
                        const next = new Set(prev);
                        next.delete(messageId);
                        return next;
                    });
                }
            }
        }
    };

    // Send a reply to a thread
    const handleSendReply = async (messageId: string) => {
        const replyContent = replyInputs[messageId]?.trim();
        if (!replyContent || !selectedProjectId) return;

        setSendingReply(messageId);
        try {
            // Just send to API - WebSocket will broadcast the reply back
            await api.createReply(selectedProjectId, messageId, replyContent);
            // Clear input
            setReplyInputs(prev => ({ ...prev, [messageId]: '' }));
        } catch (error) {
            console.error("Failed to send reply:", error);
        } finally {
            setSendingReply(null);
        }
    };

    const handleReplyKeyDown = (e: React.KeyboardEvent, messageId: string) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendReply(messageId);
        }
    };

    // Load reactions for a message
    const loadReactions = async (messageId: string) => {
        if (!selectedProjectId) return;
        try {
            const reactions = await api.getMessageReactions(selectedProjectId, messageId);
            setMessageReactions(prev => ({ ...prev, [messageId]: reactions }));
        } catch (error) {
            console.error("Failed to load reactions:", error);
        }
    };

    // Toggle reaction (add if not exists, remove if exists)
    const toggleReaction = async (messageId: string, emoji: string) => {
        if (!selectedProjectId) return;

        const reactions = messageReactions[messageId] || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);
        // Check if current user has reacted using backend flag
        const userHasReacted = existingReaction?.current_user_reacted ?? false;

        try {
            if (userHasReacted) {
                // Remove reaction
                await api.removeReaction(selectedProjectId, messageId, emoji);
            } else {
                // Add reaction
                await api.addReaction(selectedProjectId, messageId, emoji);
            }
            // Reload reactions
            await loadReactions(messageId);
        } catch (error) {
            console.error("Failed to toggle reaction:", error);
        }
    };

    // Render message content with highlighted @mentions
    const renderMessageContent = (content: string) => {
        // Match @mentions (@ followed by non-space characters until space or end)
        const mentionRegex = /@(\S+)/g;
        const parts = content.split(mentionRegex);

        return parts.map((part, index) => {
            // Odd indices are the captured groups (mention names)
            if (index % 2 === 1) {
                return (
                    <span key={index} className="text-indigo-400 font-medium">
                        @{part}
                    </span>
                );
            }
            return part;
        });
    };

    // Group messages by date (sorted oldest to newest within each group)
    const sortedMessages = [...messages].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const groupedMessages = sortedMessages.reduce((groups: { [key: string]: ChatMessage[] }, message) => {
        const date = new Date(message.created_at);
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
            });
        }

        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(message);
        return groups;
    }, {});

    // Auto-scroll to bottom
    const scrollToBottom = useCallback((smooth = true) => {
        messagesEndRef.current?.scrollIntoView({ 
            behavior: smooth ? 'smooth' : 'instant' 
        });
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (messages.length > 0 && !isLoading) {
            scrollToBottom();
        }
    }, [messages, isLoading, scrollToBottom]);

    // Scroll to bottom on initial load
    useEffect(() => {
        if (!isLoading && messages.length > 0) {
            // Use instant scroll on initial load
            setTimeout(() => scrollToBottom(false), 100);
        }
    }, [isLoading, selectedProjectId]);

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-56px)] font-sans text-zinc-900 dark:text-white animate-in fade-in duration-500 overflow-hidden relative bg-zinc-50 dark:bg-[#181818]">

            {/* --- Project Selector Sidebar (Collapsible on mobile) --- */}
            {isProjectListOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[65] lg:hidden"
                    onClick={() => setIsProjectListOpen(false)}
                />
            )}
            <div className={cn(
                "fixed inset-y-0 left-0 w-64 bg-white dark:bg-[#121212] border-r border-zinc-200 dark:border-white/5 flex flex-col z-[70] transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-auto lg:h-full",
                isProjectListOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-5 flex items-center justify-between border-b border-zinc-200 dark:border-white/5">
                    <h2 className="text-sm font-lg tracking-tight text-zinc-900 dark:text-white">Project Channels</h2>
                    <button onClick={() => setIsProjectListOpen(false)} className="lg:hidden text-zinc-500 hover:text-zinc-900 dark:hover:text-white">
                        <ChevronDown className="h-4 w-4 rotate-90" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                    {projects.map((project) => (
                        <button
                            key={project.id}
                            onClick={() => setSelectedProjectId(project.id)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-professional relative group ${selectedProjectId === project.id
                                ? 'bg-zinc-100 dark:bg-white/10 border border-zinc-300 dark:border-white/20 text-zinc-900 dark:text-white font-lg tracking-tight shadow-sm'
                                : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-white/5 hover:text-zinc-900 dark:hover:text-white border border-transparent'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                {selectedProjectId === project.id && (
                                    <div className="absolute left-0 w-0.5 h-4 bg-zinc-900 dark:bg-white rounded-r-full" />
                                )}
                                <span className="truncate">{project.name}</span>
                            </div>
                        </button>
                    ))}
                    {projects.length === 0 && !isLoading && (
                        <div className="text-center py-8 text-zinc-500 text-xs">
                            No projects found
                        </div>
                    )}
                </div>
            </div>

            {/* --- Main Content: Activity Feed & Chat --- */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative">

                {/* Top Header (Breadcrumb & Title) */}
                <div className="px-4 md:px-8 py-4 md:py-6 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsProjectListOpen(true)}
                            className="lg:hidden flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 border border-zinc-200 dark:border-white/10 rounded-lg text-zinc-900 dark:text-zinc-100 transition-all active:scale-95"
                        >
                            <h1 className="text-sm font-lg tracking-tight truncate max-w-[120px]">
                                {projects.find(p => p.id === selectedProjectId)?.name || 'Select Project'}
                            </h1>
                            <ChevronDown className={cn("h-3.5 w-3.5 text-zinc-500 transition-transform", isProjectListOpen && "rotate-180")} />
                        </button>
                        <div className="hidden lg:block">
                            <div className="text-xs text-zinc-500 mb-1 font-lg tracking-tight">Home / Chat</div>
                            <h1 className="text-2xl font-lg tracking-tight text-zinc-900 dark:text-white">
                                {projects.find(p => p.id === selectedProjectId)?.name || 'Select a Project'}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Online Users Avatars */}
                        {onlineUsers.length > 0 && (
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    {onlineUsers.slice(0, 4).map((user) => (
                                        <div key={user.id} className="relative">
                                            {user.image_url ? (
                                                <img
                                                    src={user.image_url}
                                                    alt={user.name || 'User'}
                                                    className="w-8 h-8 rounded-full border-2 border-white dark:border-[#181818] object-cover"
                                                    title={user.name || 'Online user'}
                                                />
                                            ) : (
                                                <div 
                                                    className="w-8 h-8 rounded-full border-2 border-white dark:border-[#181818] bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold"
                                                    title={user.name || 'Online user'}
                                                >
                                                    {user.name?.charAt(0).toUpperCase() || 'U'}
                                                </div>
                                            )}
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-[#181818]" />
                                        </div>
                                    ))}
                                </div>
                                {onlineUsers.length > 4 && (
                                    <span className="text-xs text-zinc-500 font-medium">+{onlineUsers.length - 4}</span>
                                )}
                                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium ml-1">online</span>
                            </div>
                        )}
                        {selectedProjectId && (
                            <Link
                                href={`/workspace/projects/${selectedProjectId}`}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-md transition-all"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                View Project
                            </Link>
                        )}
                        <button className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-professional">
                            <MoreHorizontal className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Feed Filters */}
                <div className="px-4 md:px-8 py-3 md:py-4 flex items-center justify-between border-b border-zinc-200 dark:border-white/5 shrink-0">
                    <h2 className="text-xs md:text-sm font-lg tracking-tight text-zinc-700 dark:text-zinc-300">Project Chat</h2>
                    <div className="flex items-center gap-4 text-[10px] md:text-xs text-zinc-500 font-lg tracking-tight">
                        <span>{messages.length} messages</span>
                    </div>
                </div>

                {/* Timeline Feed - SCROLLABLE AREA */}
                <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 md:p-8 relative custom-scrollbar">
                    {isLoading ? (
                        <div className="max-w-4xl space-y-8">
                            {/* Skeleton Date Label */}
                            <div className="text-center relative z-10 mb-8">
                                <div className="inline-block h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse"></div>
                            </div>
                            {/* Skeleton Message Cards */}
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="relative pl-10 md:pl-16 animate-pulse">
                                    {/* Avatar Skeleton */}
                                    <div className="absolute left-0 top-0 w-8 h-8 md:w-10 md:h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 border-[3px] md:border-4 border-zinc-50 dark:border-[#181818]"></div>

                                    {/* Content Skeleton */}
                                    <div className="flex flex-col gap-1.5">
                                        {/* Header Line Skeleton */}
                                        <div className="flex items-center gap-2">
                                            <div className="h-2.5 w-12 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                                            <div className="h-2.5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                                            <div className="h-2.5 w-20 bg-zinc-100 dark:bg-zinc-900 rounded"></div>
                                        </div>

                                        {/* Message Card Skeleton */}
                                        <div className="bg-white dark:bg-[#1F1F1F] border border-zinc-200 dark:border-white/5 rounded-md p-4 mt-1">
                                            <div className="space-y-2">
                                                <div className="h-3 w-full bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                                                <div className="h-3 w-3/4 bg-zinc-100 dark:bg-zinc-900 rounded"></div>
                                            </div>

                                            {/* Footer Skeleton */}
                                            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-zinc-100 dark:border-white/5">
                                                <div className="h-5 w-16 bg-zinc-100 dark:bg-zinc-900 rounded"></div>
                                                <div className="h-5 w-20 bg-zinc-100 dark:bg-zinc-900 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : !selectedProjectId ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                            <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                            <p className="text-sm">Select a project to view messages</p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                            <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                            <p className="text-sm">No messages yet. Start the conversation!</p>
                        </div>
                    ) : (
                        <div className="max-w-4xl">
                            {/* Vertical Timeline Line */}
                            <div className="absolute left-[30px] md:left-[54px] top-8 bottom-0 w-px bg-white/10" />

                            <div className="space-y-8">
                                {Object.entries(groupedMessages).map(([dateGroup, groupMessages]) => (
                                    <div key={dateGroup}>
                                        {/* Date Label */}
                                        <div className="text-center relative z-10 mb-8">
                                            <span className="text-xs font-lg tracking-tight text-zinc-500 uppercase tracking-wider bg-zinc-50 dark:bg-[#181818] px-2">{dateGroup}</span>
                                        </div>

                                        {groupMessages.map((message) => {
                                            const isExpanded = expandedThreads.has(message.id);
                                            const replies = threadReplies[message.id] || [];
                                            const isLoadingReplies = loadingThreads.has(message.id);
                                            const replyCount = message.replies_count || 0;

                                            return (
                                                <div key={message.id} className="relative pl-10 md:pl-16 group mb-8">
                                                    {/* Avatar Marker */}
                                                    <div className="absolute left-0 top-0">
                                                        <UserAvatar
                                                            userId={message.user?.id || message.user_id || ''}
                                                            name={message.user?.name}
                                                            imageUrl={message.user?.image_url}
                                                            size="md"
                                                            showOnlineStatus={false}
                                                            className="border-[3px] md:border-4 border-zinc-50 dark:border-[#181818]"
                                                        />
                                                    </div>

                                                    {/* Content Container */}
                                                    <div className="flex flex-col gap-1.5">
                                                        {/* Header Line */}
                                                        <div className="flex items-baseline gap-1.5 text-sm flex-wrap font-lg tracking-tight">
                                                            <span className="text-zinc-400 dark:text-zinc-600 text-xs">{formatTime(message.created_at)}</span>
                                                            <span className="text-zinc-900 dark:text-white ml-2">{message.user?.name || 'Unknown User'}</span>
                                                            <span className="text-zinc-500">posted a message</span>
                                                        </div>

                                                        {/* Message Card */}
                                                        <div className="bg-white dark:bg-[#1F1F1F] border border-zinc-200 dark:border-white/5 rounded-md p-4 mt-1 hover:border-zinc-300 dark:hover:border-white/10 hover:bg-zinc-50 dark:hover:bg-[#252527] transition-professional">
                                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-lg tracking-tight whitespace-pre-wrap">
                                                                {renderMessageContent(message.content)}
                                                            </p>

                                                            {/* Footer bar */}
                                                            <div className="flex items-center gap-4 text-xs text-zinc-500 font-lg tracking-tight mt-3 pt-3 border-t border-zinc-100 dark:border-white/5">
                                                                {/* Reactions summary with built-in picker */}
                                                                <ReactionsSummary
                                                                    reactions={messageReactions[message.id] || []}
                                                                    onReactionClick={(emoji) => toggleReaction(message.id, emoji)}
                                                                />
                                                                {/* Thread toggle button */}
                                                                <button
                                                                    onClick={() => toggleThread(message.id)}
                                                                    className="flex items-center gap-1.5 hover:text-white transition-professional shrink-0"
                                                                >
                                                                    {isExpanded ? (
                                                                        <ChevronUp className="h-3 w-3 md:h-4 md:w-4" />
                                                                    ) : (
                                                                        <ChevronDown className="h-3 w-3 md:h-4 md:w-4" />
                                                                    )}
                                                                    <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
                                                                    <span className="hidden xs:inline">{replyCount > 0 ? `${replyCount} replies` : 'Reply'}</span>
                                                                    <span className="xs:hidden">{replyCount > 0 ? replyCount : ''}</span>
                                                                </button>
                                                                {/* Last activity - show if there are replies */}
                                                                {replyCount > 0 && (
                                                                    <span className="text-[10px] md:text-zinc-600 ml-auto hidden sm:inline">
                                                                        Last activity at {format(
                                                                            new Date(replies.length > 0 ? replies[replies.length - 1].created_at : message.created_at),
                                                                            'HH:mm'
                                                                        )}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Thread Replies Section */}
                                                        {isExpanded && (
                                                            <div className="mt-3 ml-4 border-l-2 border-zinc-200 dark:border-white/10 pl-4 space-y-3">
                                                                {/* Loading state */}
                                                                {isLoadingReplies && (
                                                                    <div className="flex items-center gap-2 py-2 text-zinc-500">
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                        <span className="text-xs">Loading replies...</span>
                                                                    </div>
                                                                )}

                                                                {/* Replies list */}
                                                                {replies.map((reply) => (
                                                                    <div key={reply.id} className="flex gap-3">
                                                                        {/* Reply avatar */}
                                                                        <UserAvatar
                                                                            userId={reply.user?.id || reply.user_id || ''}
                                                                            name={reply.user?.name}
                                                                            imageUrl={reply.user?.image_url}
                                                                            size="xs"
                                                                            showOnlineStatus={false}
                                                                            className="shrink-0"
                                                                        />
                                                                        {/* Reply content */}
                                                                        <div className="flex-1 bg-zinc-100 dark:bg-[#252527] border border-zinc-200 dark:border-white/5 rounded-md p-3">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                                                                                    {reply.user?.name || 'Unknown User'}
                                                                                </span>
                                                                                <span className="text-[10px] text-zinc-500 dark:text-zinc-600">
                                                                                    {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                                                                                {renderMessageContent(reply.content)}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ))}

                                                                {/* Reply input */}
                                                                <div className="flex gap-3 pt-2">
                                                                    <Reply className="w-7 h-7 text-zinc-600 shrink-0 mt-1" />
                                                                    <div className="flex-1 relative">
                                                                        {/* Mention Dropdown for reply input */}
                                                                        {showMentionDropdown && mentionInputType === message.id && (
                                                                            <MentionDropdown
                                                                                users={projectMembers}
                                                                                searchTerm={mentionSearchTerm}
                                                                                onSelect={handleMentionSelect}
                                                                                onClose={() => setShowMentionDropdown(false)}
                                                                            />
                                                                        )}
                                                                        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-[#1a1a1a] border border-zinc-200 dark:border-white/5 rounded-md px-3 py-2 focus-within:border-zinc-400 dark:focus-within:border-white/20 transition-all">
                                                                            <input
                                                                                type="text"
                                                                                value={replyInputs[message.id] || ''}
                                                                                onChange={(e) => handleReplyInputChange(message.id, e.target.value)}
                                                                                onKeyDown={(e) => handleReplyKeyDown(e, message.id)}
                                                                                placeholder="Write a reply... (use @ to mention)"
                                                                                disabled={sendingReply === message.id}
                                                                                className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 disabled:opacity-50"
                                                                            />
                                                                            <EmojiPicker
                                                                                onEmojiSelect={(emoji) => setReplyInputs(prev => ({
                                                                                    ...prev,
                                                                                    [message.id]: (prev[message.id] || '') + emoji
                                                                                }))}
                                                                            />
                                                                            <button
                                                                                onClick={() => handleSendReply(message.id)}
                                                                                disabled={!replyInputs[message.id]?.trim() || sendingReply === message.id}
                                                                                className="p-1.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-professional disabled:opacity-50 disabled:cursor-not-allowed"
                                                                            >
                                                                                {sendingReply === message.id ? (
                                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                                ) : (
                                                                                    <Send className="h-3 w-3" />
                                                                                )}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                            {/* Scroll anchor */}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* --- Bottom Chat Input - FIXED POSITIONED AT THE BOTTOM --- */}
                <div className="px-4 md:px-8 py-3 md:py-4 border-t border-zinc-200 dark:border-white/5 shrink-0 bg-white/80 dark:bg-[#181818]/80 backdrop-blur-xl">
                    <div className="max-w-4xl mx-auto relative">
                        {/* Mention Dropdown for main input */}
                        {showMentionDropdown && mentionInputType === 'main' && (
                            <MentionDropdown
                                users={projectMembers}
                                searchTerm={mentionSearchTerm}
                                onSelect={handleMentionSelect}
                                onClose={() => setShowMentionDropdown(false)}
                            />
                        )}
                        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-[#1F1F1F] border border-zinc-200 dark:border-white/5 rounded-md px-4 py-3 transition-professional hover:border-zinc-300 dark:hover:border-white/10 focus-within:border-zinc-400 dark:focus-within:border-white/20 focus-within:bg-white dark:focus-within:bg-[#252527] focus-within:shadow-sm">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={handleMessageInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder={selectedProjectId ? "Send message to project... (use @ to mention)" : "Select a project first..."}
                                disabled={!selectedProjectId || isSending}
                                className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 font-lg tracking-tight disabled:opacity-50"
                            />
                            <EmojiPicker onEmojiSelect={(emoji) => setNewMessage(prev => prev + emoji)} />
                            <button
                                onClick={handleSendMessage}
                                disabled={!selectedProjectId || !newMessage.trim() || isSending}
                                className="bg-zinc-900 dark:bg-white text-white dark:text-black p-2 rounded-md hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-professional disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TeamsPage;
