"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';
import { MessageReaction } from '@/types';

const QUICK_REACTIONS = ['👍', '❤️', '😂', '🎉', '👀'];

interface ReactionsSummaryProps {
    reactions: MessageReaction[];
    onReactionClick: (emoji: string) => void;
}

export const ReactionsSummary: React.FC<ReactionsSummaryProps> = ({ reactions, onReactionClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    const totalReactions = reactions?.reduce((sum, r) => sum + r.count, 0) || 0;

    // Find if current user has reacted with any emoji
    const userReaction = reactions?.find(r => r.current_user_reacted);

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsPickerOpen(false);
            }
        };
        if (isPickerOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isPickerOpen]);

    const formatUserNames = (users: { name: string | null }[]) => {
        const names = users.map(u => u.name || 'Unknown');
        if (names.length === 0) return 'No one';
        if (names.length === 1) return names[0];
        if (names.length === 2) return `${names[0]} and ${names[1]}`;
        if (names.length <= 4) {
            const lastUser = names[names.length - 1];
            const otherUsers = names.slice(0, -1);
            return `${otherUsers.join(', ')}, and ${lastUser}`;
        }
        const displayedNames = names.slice(0, 3);
        const remaining = names.length - 3;
        return `${displayedNames.join(', ')}, and ${remaining} others`;
    };

    const handleIconClick = () => {
        if (userReaction) {
            // User has reacted - clicking removes their reaction
            onReactionClick(userReaction.emoji);
        } else {
            // Open picker to add reaction
            setIsPickerOpen(!isPickerOpen);
        }
    };

    const handleQuickReaction = (emoji: string) => {
        onReactionClick(emoji);
        setIsPickerOpen(false);
    };

    return (
        <div
            className="relative inline-flex items-center"
            ref={pickerRef}
        >
            {/* Icon button - shows user's emoji or smile */}
            <button
                onClick={handleIconClick}
                className="flex items-center justify-center w-6 h-6 rounded hover:bg-white/10 transition-colors"
                title={userReaction ? `Remove ${userReaction.emoji} reaction` : 'Add reaction'}
            >
                {userReaction ? (
                    <span className="text-sm">{userReaction.emoji}</span>
                ) : (
                    <Smile className="h-4 w-4 text-zinc-500" />
                )}
            </button>

            {/* Reaction count with hover */}
            {totalReactions > 0 && (
                <div
                    className="relative"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <span className="text-xs text-zinc-500 cursor-default">
                        {totalReactions} {totalReactions === 1 ? 'reaction' : 'reactions'}
                    </span>

                    {/* Hover tooltip */}
                    {isHovered && (
                        <div className="absolute bottom-full left-0 mb-2 z-50 pointer-events-none">
                            <div className="bg-[#222] border border-white/10 rounded-xl shadow-2xl p-3 min-w-[180px] max-w-[280px]">
                                <div className="space-y-2">
                                    {reactions.map((reaction) => (
                                        <div
                                            key={reaction.emoji}
                                            className={`flex items-start gap-2 p-1.5 rounded-md ${
                                                reaction.current_user_reacted ? 'bg-indigo-500/10' : ''
                                            }`}
                                        >
                                            <span className="text-2xl shrink-0">{reaction.emoji}</span>
                                            <p className="text-xs text-zinc-300 leading-relaxed pt-1">
                                                <span className="font-medium text-white">{formatUserNames(reaction.users)}</span>
                                                <span className="text-zinc-500"> reacted</span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {/* Arrow */}
                            <div className="absolute left-4 -bottom-1.5 w-3 h-3 bg-[#222] border-r border-b border-white/10 rotate-45" />
                        </div>
                    )}
                </div>
            )}

            {/* Quick reaction picker */}
            {isPickerOpen && (
                <div className="absolute bottom-full left-0 mb-2 bg-[#1F1F1F] border border-white/10 rounded-lg shadow-2xl p-2 z-50">
                    <div className="flex gap-1">
                        {QUICK_REACTIONS.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => handleQuickReaction(emoji)}
                                className="w-8 h-8 flex items-center justify-center text-lg hover:bg-white/10 rounded transition-colors"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
