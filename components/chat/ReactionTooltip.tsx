"use client";

import React, { useState } from 'react';
import { MessageReaction } from '@/types';

interface ReactionTooltipProps {
    reaction: MessageReaction;
    children: React.ReactNode;
}

export const ReactionTooltip: React.FC<ReactionTooltipProps> = ({ reaction, children }) => {
    const [isVisible, setIsVisible] = useState(false);

    const formatUserNames = () => {
        const names = reaction.users.map(u => u.name || 'Unknown');
        if (names.length === 0) return 'No reactions';
        if (names.length === 1) return names[0];
        if (names.length === 2) return `${names[0]} and ${names[1]}`;
        if (names.length <= 5) {
            const lastUser = names.pop();
            return `${names.join(', ')} and ${lastUser}`;
        }
        // More than 5 users
        const displayedNames = names.slice(0, 4);
        const remaining = names.length - 4;
        return `${displayedNames.join(', ')} and ${remaining} others`;
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}

            {isVisible && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl px-3 py-2 min-w-[120px] max-w-[250px]">
                        {/* Emoji display */}
                        <div className="flex items-center justify-center mb-2">
                            <span className="text-2xl">{reaction.emoji}</span>
                        </div>

                        {/* User names */}
                        <p className="text-xs text-zinc-300 text-center leading-relaxed">
                            <span className="font-medium text-white">{formatUserNames()}</span>
                            <span className="text-zinc-500"> reacted</span>
                        </p>
                    </div>

                    {/* Arrow */}
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-[#1a1a1a] border-r border-b border-white/10 rotate-45" />
                </div>
            )}
        </div>
    );
};
