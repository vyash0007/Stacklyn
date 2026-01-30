"use client";

import React, { useState, useRef, useEffect } from 'react';
import { SmilePlus } from 'lucide-react';

interface ReactionPickerProps {
    onReactionSelect: (emoji: string) => void;
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👀'];

export const ReactionPicker: React.FC<ReactionPickerProps> = ({ onReactionSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const pickerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleReactionClick = (emoji: string) => {
        onReactionSelect(emoji);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={pickerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 text-zinc-600 hover:text-white hover:bg-white/10 rounded transition-all"
                title="Add reaction"
            >
                <SmilePlus className="h-4 w-4" />
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-0 mb-2 bg-[#1F1F1F] border border-white/10 rounded-lg shadow-2xl p-2 z-50">
                    <div className="flex gap-1">
                        {QUICK_REACTIONS.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => handleReactionClick(emoji)}
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
