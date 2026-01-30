"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Smile } from 'lucide-react';

interface EmojiPickerProps {
    onEmojiSelect: (emoji: string) => void;
}

const EMOJI_CATEGORIES = {
    'Smileys': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😋', '😜', '🤪', '😎', '🤩', '🥳'],
    'Gestures': ['👍', '👎', '👌', '✌️', '🤞', '🤝', '👏', '🙌', '💪', '🙏', '✋', '👋', '🤙', '👊', '✊', '🤘'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘'],
    'Objects': ['💡', '🔥', '⭐', '✨', '🎉', '🎊', '🎯', '💻', '📱', '📧', '📝', '✅', '❌', '⚡', '💬', '🚀'],
    'Faces': ['🤔', '😐', '😑', '😶', '🙄', '😏', '😣', '😥', '😮', '🤐', '😯', '😪', '😫', '🥱', '😴', '🤤'],
};

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Smileys');
    const pickerRef = useRef<HTMLDivElement>(null);

    // Close picker when clicking outside
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

    const handleEmojiClick = (emoji: string) => {
        onEmojiSelect(emoji);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={pickerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded-md transition-all"
                title="Add emoji"
            >
                <Smile className="h-5 w-5" />
            </button>

            {isOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-80 bg-[#1F1F1F] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50">
                    {/* Category tabs */}
                    <div className="flex border-b border-white/5 overflow-x-auto">
                        {Object.keys(EMOJI_CATEGORIES).map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                                    activeCategory === category
                                        ? 'text-white bg-white/10 border-b-2 border-white'
                                        : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Emoji grid */}
                    <div className="p-3 max-h-48 overflow-y-auto">
                        <div className="grid grid-cols-8 gap-1">
                            {EMOJI_CATEGORIES[activeCategory as keyof typeof EMOJI_CATEGORIES].map((emoji, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleEmojiClick(emoji)}
                                    className="w-8 h-8 flex items-center justify-center text-xl hover:bg-white/10 rounded transition-colors"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
