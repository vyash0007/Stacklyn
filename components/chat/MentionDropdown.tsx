"use client";

import React, { useEffect, useRef } from 'react';

export interface MentionUser {
    id: string;
    name: string | null;
    image_url: string | null;
    email?: string;
}

interface MentionDropdownProps {
    users: MentionUser[];
    searchTerm: string;
    onSelect: (user: MentionUser) => void;
    onClose: () => void;
    position?: { top: number; left: number };
}

export const MentionDropdown: React.FC<MentionDropdownProps> = ({
    users,
    searchTerm,
    onSelect,
    onClose,
}) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter users based on search term
    const filteredUsers = users.filter(user => {
        const name = user.name?.toLowerCase() || '';
        const email = user.email?.toLowerCase() || '';
        const search = searchTerm.toLowerCase();
        return name.includes(search) || email.includes(search);
    });

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    if (filteredUsers.length === 0) {
        return (
            <div
                ref={dropdownRef}
                className="absolute bottom-full left-0 mb-2 bg-[#1F1F1F] border border-white/10 rounded-lg shadow-2xl p-2 z-50 min-w-[200px]"
            >
                <p className="text-xs text-zinc-500 px-2 py-1">No users found</p>
            </div>
        );
    }

    return (
        <div
            ref={dropdownRef}
            className="absolute bottom-full left-0 mb-2 bg-[#1F1F1F] border border-white/10 rounded-lg shadow-2xl py-1 z-50 min-w-[220px] max-h-[200px] overflow-y-auto"
        >
            <p className="text-xs text-zinc-500 px-3 py-1.5 border-b border-white/5">Members</p>
            {filteredUsers.map((user) => (
                <button
                    key={user.id}
                    onClick={() => onSelect(user)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-white/5 transition-colors text-left"
                >
                    {user.image_url ? (
                        <img
                            src={user.image_url}
                            alt={user.name || 'User'}
                            className="w-6 h-6 rounded-full object-cover"
                        />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-300">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{user.name || 'Unknown'}</p>
                        {user.email && (
                            <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                        )}
                    </div>
                </button>
            ))}
        </div>
    );
};
