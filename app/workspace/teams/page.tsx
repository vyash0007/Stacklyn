"use client";

import React, { useState } from 'react';
import {
    Search,
    Filter,
    MoreHorizontal,
    MessageSquare,
    Smile,
    Paperclip,
    Send,
    Check,
    X,
    ChevronDown,
    Hash,
    Users,
    Bell,
    Layout,
    ExternalLink,
    Rocket
} from 'lucide-react';

const TeamsPage = () => {
    const [selectedTeam, setSelectedTeam] = useState('design');

    // Exact mock data from the reference image
    const feed = [
        {
            id: 1,
            user: { name: 'James Hetfield', avatar: 'JH', image: 'https://i.pravatar.cc/150?u=1', color: 'bg-slate-200' },
            action: 'added reaction 🚀 in team',
            target: '#dev-team',
            time: '14:47',
            type: 'simple_action'
        },
        {
            id: 2,
            user: { name: 'Carlos Sine', avatar: 'CS', image: 'https://i.pravatar.cc/150?u=2', color: 'bg-indigo-100' },
            action: 'Sent message to thread in team channel 🚀 in team',
            target: '#design-team',
            time: '15:30',
            type: 'message',
            content: {
                text: "Hello everyone, question on email redirection. We want some new redesign in the some of our application and side by side in the webapp because that redesign reflect in the webapp.",
                reactions: 3,
                replies: 3,
                lastActivity: '16:01'
            }
        },
        {
            id: 3,
            user: { name: 'Charlotte Dengler', avatar: 'CD', image: 'https://i.pravatar.cc/150?u=3', color: 'bg-emerald-100' },
            action: 'added a comment to',
            target: 'Announcement',
            time: '16:20',
            type: 'simple_action',
            link: true
        },
        {
            id: 4,
            user: { name: 'Lisa Lowis', avatar: 'LL', image: 'https://i.pravatar.cc/150?u=4', color: 'bg-amber-100' },
            action: 'is requesting access to',
            target: '#design-team',
            time: '18:41',
            type: 'request',
            status: 'pending'
        },
        {
            id: 5,
            user: { name: 'Carlos Sine', avatar: 'CS', image: 'https://i.pravatar.cc/150?u=2', color: 'bg-indigo-100' },
            action: 'Sent message to thread in team channel 🚀 in team',
            target: '#testing-team',
            time: '15:30',
            type: 'message',
            content: {
                text: "Hey everyone, in our recent testing rules i added few new rules and regulation for new testing approach to our features products.",
                reactions: 3,
                replies: 3,
                lastActivity: '16:01'
            }
        }
    ];

    return (
        <div className="flex h-[calc(100vh-64px)] font-sans text-white animate-in fade-in duration-500 overflow-hidden">

            {/* --- Left Sidebar: Teams List --- */}
            <div className="w-64 border-r border-white/5 flex flex-col bg-[#121212] h-full">
                <div className="p-5 flex items-center justify-between">
                    <h2 className="text-sm font-lg tracking-tight text-white">Teams</h2>
                    <span className="text-[10px] font-medium text-zinc-500">
                        12 Notifications
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto px-3 space-y-1">
                    {[
                        { id: 'design', name: 'Design Team', count: 4 },
                        { id: 'dev', name: 'Dev Team', count: 0 },
                        { id: 'support', name: 'Support Team', count: 0 },
                        { id: 'research', name: 'Research Team', count: 4 },
                        { id: 'testing', name: 'Testing Team', count: 4 },
                        { id: 'client', name: 'Client side Team', count: 0 },
                    ].map((team) => (
                        <button
                            key={team.id}
                            onClick={() => setSelectedTeam(team.id)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm transition-professional relative group ${selectedTeam === team.id
                                ? 'bg-white/10 border border-white/20 text-white font-lg tracking-tight shadow-sm'
                                : 'text-zinc-500 hover:bg-white/5 hover:text-white border border-transparent'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                {selectedTeam === team.id && (
                                    <div className="absolute left-0 w-0.5 h-4 bg-white rounded-r-full" />
                                )}
                                <span>{team.name}</span>
                            </div>
                            {team.count > 0 && (
                                <span className={`${selectedTeam === team.id ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'} text-[10px] font-bold px-1.5 min-w-[1.25rem] h-5 rounded flex items-center justify-center`}>
                                    {team.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- Main Content: Activity Feed & Chat --- */}
            <div className="flex-1 flex flex-col min-w-0 h-full relative">

                {/* Top Header (Breadcrumb & Title) */}
                <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between shrink-0">
                    <div>
                        <div className="text-xs text-zinc-500 mb-1 font-lg tracking-tight">Home / Activities</div>
                        <h1 className="text-2xl font-lg tracking-tight text-white">Activities</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="bg-[#1F1F1F] border border-white/5 text-zinc-300 px-4 py-2 rounded-md text-sm font-lg tracking-tight hover:bg-[#252527] transition-professional flex items-center gap-2">
                            Release <ChevronDown className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-zinc-500 hover:text-white transition-professional">
                            <MoreHorizontal className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Feed Filters */}
                <div className="px-8 py-4 flex items-center justify-between border-b border-white/5 shrink-0">
                    <h2 className="text-sm font-lg tracking-tight text-zinc-300">Latest Activity Feed</h2>
                    <div className="flex items-center gap-6 text-xs text-zinc-500 font-lg tracking-tight">
                        <button className="flex items-center gap-1.5 hover:text-white transition-professional">
                            <Filter className="h-3.5 w-3.5" /> Filters
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-white transition-professional">
                            <Layout className="h-3.5 w-3.5" /> Most important first <ChevronDown className="h-3 w-3" />
                        </button>
                        <button className="flex items-center gap-1.5 hover:text-white transition-professional">
                            <Layout className="h-3.5 w-3.5" /> All activities <ChevronDown className="h-3 w-3" />
                        </button>
                    </div>
                </div>

                {/* Timeline Feed - SCROLLABLE AREA */}
                <div className="flex-1 overflow-y-auto p-8 relative">
                    <div className="max-w-4xl">
                        {/* Vertical Timeline Line */}
                        <div className="absolute left-[54px] top-8 bottom-0 w-px bg-white/10" />

                        <div className="space-y-8">
                            {/* Today Label */}
                            <div className="text-center relative z-10 mb-8">
                                <span className="text-xs font-lg tracking-tight text-zinc-500 uppercase tracking-wider bg-[#181818] px-2">Today</span>
                            </div>

                            {feed.map((item) => (
                                <div key={item.id} className="relative pl-16 group">

                                    {/* Avatar Marker */}
                                    <div className="absolute left-0 top-0 w-10 h-10">
                                        <img
                                            src={item.user.image}
                                            alt={item.user.name}
                                            className="w-10 h-10 rounded-full border-4 border-white bg-slate-100 object-cover relative z-10"
                                        />
                                    </div>

                                    {/* Content Container */}
                                    <div className="flex flex-col gap-1.5">
                                        {/* Header Line */}
                                        <div className="flex items-baseline gap-1.5 text-sm flex-wrap font-lg tracking-tight">
                                            <span className="text-zinc-600 text-xs">{item.time}</span>
                                            <span className="text-white ml-2">{item.user.name}</span>
                                            <span className="text-zinc-500">{item.action}</span>
                                            <span className="text-white">{item.target}</span>
                                            {item.link && <ExternalLink className="h-3 w-3 text-zinc-500" />}
                                        </div>

                                        {/* Message Card Type */}
                                        {item.type === 'message' && (
                                            <div className="bg-[#1F1F1F] border border-white/5 rounded-md p-4 mt-1 hover:border-white/10 hover:bg-[#252527] transition-professional">
                                                <p className="text-sm text-zinc-400 leading-relaxed mb-4 font-lg tracking-tight">
                                                    {item.content?.text}
                                                </p>
                                                <div className="flex items-center gap-6 text-xs text-zinc-500 font-lg tracking-tight">
                                                    <button className="flex items-center gap-1.5 hover:text-white transition-professional">
                                                        <Smile className="h-4 w-4" /> {item.content?.reactions} reactions
                                                    </button>
                                                    <button className="flex items-center gap-1.5 hover:text-white transition-professional">
                                                        <MessageSquare className="h-4 w-4" /> {item.content?.replies} replies
                                                    </button>
                                                    <span className="text-zinc-600 font-normal">Last activity at {item.content?.lastActivity}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Request Card Type */}
                                        {item.type === 'request' && (
                                            <div className="flex items-center gap-3 mt-2">
                                                <button className="bg-[#1F1F1F] border border-white/5 text-zinc-300 px-5 py-1.5 rounded-md text-xs font-lg tracking-tight hover:bg-[#252527] transition-professional">
                                                    Decline
                                                </button>
                                                <button className="bg-white border border-white/5 text-black px-5 py-1.5 rounded-md text-xs font-lg tracking-tight hover:bg-zinc-200 transition-professional">
                                                    Approve
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Yesterday Label */}
                            <div className="text-center relative z-10 pt-8">
                                <span className="text-xs font-lg tracking-tight text-zinc-500 uppercase tracking-wider bg-[#181818] px-2">Yesterday</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Bottom Chat Input - FIXED POSITIONED AT THE BOTTOM --- */}
                <div className="px-8 py-4 border-t border-white/5 shrink-0">
                    <div className="max-w-4xl mx-auto flex items-center gap-3 bg-[#1F1F1F] border border-white/5 rounded-md px-4 py-3 transition-professional hover:border-white/10 focus-within:border-white/20 focus-within:bg-[#252527] focus-within:shadow-sm">
                        <input
                            type="text"
                            placeholder="Send message to team..."
                            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder-zinc-500 font-lg tracking-tight"
                        />
                        <button className="bg-white text-black p-2 rounded-md hover:bg-zinc-200 transition-professional">
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default TeamsPage;
