"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    GitCommit,
    Zap,
    UserPlus,
    FolderPlus,
    Clock,
    AlertCircle,
    MoreHorizontal,
    Download,
    Calendar,
    MessageSquare,
    CheckSquare,
    Square,
    Send,
    Plus,
    Check,
    Bell,
    Trash2,
    X,
    Loader2
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { Activity, Task } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';

const MOCK_TEAM = [
    { id: '1', name: 'Luke', avatar: 'L', color: 'bg-indigo-100 text-indigo-700' },
    { id: '2', name: 'Sarah', avatar: 'S', color: 'bg-emerald-100 text-emerald-700' },
    { id: '3', name: 'Alex', avatar: 'A', color: 'bg-amber-100 text-amber-700' },
];

const ActivityPage = () => {
    const { getActivities, getTasks, createTask, deleteTask } = useApi();
    const [activities, setActivities] = useState<Activity[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);

    // Task Management State
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [newTaskInput, setNewTaskInput] = useState('');
    const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);
    const [isCreatingTask, setIsCreatingTask] = useState(false);
    const [activeFilter, setActiveFilter] = useState<'all' | 'created' | 'deleted'>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleCount, setVisibleCount] = useState(5);

    const fetchActivities = useCallback(async () => {
        try {
            const data = await getActivities(50, 0);
            setActivities(data);
        } catch (error) {
            console.error("Failed to fetch activities:", error);
        } finally {
            setIsLoading(false);
        }
    }, [getActivities]);

    const fetchTasks = useCallback(async () => {
        try {
            // @ts-ignore
            const data = await getTasks();
            setTasks(data);
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
        } finally {
            setIsLoadingTasks(false);
        }
    }, [getTasks]);

    useEffect(() => {
        fetchActivities();
        fetchTasks();
    }, [fetchActivities, fetchTasks]);

    const toggleTask = (id: string) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, status: t.status === 'completed' ? 'in_progress' : 'completed' } : t));
    };

    const handleDeleteTask = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setTasks(prev => prev.filter(t => t.id !== id));
        try {
            // @ts-ignore
            await deleteTask(id);
        } catch (error) {
            console.error("Failed to delete task:", error);
            fetchTasks(); // Revert on failure
        }
    };

    const handleCreateTasks = async () => {
        if (!newTaskInput.trim()) return;

        setIsCreatingTask(true);
        const lines = newTaskInput.split('\n').filter(line => line.trim());

        try {
            const assignee = MOCK_TEAM.find(m => m.id === selectedAssigneeId);
            const newTasksPromises = lines.map(title =>
                // @ts-ignore
                createTask({
                    title: title.trim(),
                    status: 'pending',
                    dueDate: new Date().toISOString(),
                    assignee: assignee ? {
                        name: assignee.name,
                        avatar: assignee.avatar,
                        color: assignee.color
                    } : undefined
                })
            );

            const createdTasks = await Promise.all(newTasksPromises);
            setTasks(prev => [...createdTasks, ...prev]);
            setNewTaskInput('');
            setIsAddingTask(false);
        } catch (error) {
            console.error("Failed to create tasks:", error);
        } finally {
            setIsCreatingTask(false);
        }
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'commit': return { icon: GitCommit, color: 'text-slate-600 bg-slate-50' };
            case 'run': return { icon: Zap, color: 'text-slate-600 bg-slate-50' };
            case 'project': return { icon: FolderPlus, color: 'text-slate-600 bg-slate-50' };
            case 'member': return { icon: UserPlus, color: 'text-slate-600 bg-slate-50' };
            default: return { icon: AlertCircle, color: 'text-slate-600 bg-slate-50' };
        }
    };

    const getAvatarColor = (name: string) => {
        const colors = [
            'bg-slate-100 text-slate-700',
            'bg-slate-200 text-slate-800',
            'bg-indigo-50 text-indigo-700',
        ];
        const index = (name || '?').charCodeAt(0) % colors.length;
        return colors[index];
    };

    return (
        <div className="min-h-screen bg-slate-50/30 font-sans text-slate-900 animate-in fade-in duration-500 p-6 md:p-8 max-w-7xl mx-auto">

            {/* --- Header --- */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-lg tracking-tight text-slate-900">Activity</h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        Monitor workspace events and manage your todo list.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* --- LEFT COLUMN: Activity Feed --- */}
                <div className="lg:col-span-1 space-y-6">

                    {/* Filters */}
                    <div className="bg-white p-2 rounded-md border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 justify-between sticky top-20 z-20">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search activity..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-transparent text-sm focus:outline-none placeholder-slate-400"
                            />
                        </div>
                        <div className="flex items-center gap-1 border-l border-slate-100 pl-2">
                            <button
                                onClick={() => setActiveFilter('all')}
                                className={`p-2 rounded-md text-xs font-lg tracking-tight transition-professional ${activeFilter === 'all' ? 'text-slate-900 bg-slate-100' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setActiveFilter('created')}
                                className={`p-2 rounded-md text-xs font-lg tracking-tight transition-professional ${activeFilter === 'created' ? 'text-slate-900 bg-slate-100' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                Created
                            </button>
                            <button
                                onClick={() => setActiveFilter('deleted')}
                                className={`p-2 rounded-md text-xs font-lg tracking-tight transition-professional ${activeFilter === 'deleted' ? 'text-slate-900 bg-slate-100' : 'text-slate-500 hover:bg-slate-50'}`}
                            >
                                Deleted
                            </button>
                        </div>
                    </div>

                    {/* Feed */}
                    <div className="space-y-6 relative pb-10">
                        <div className="absolute left-6 top-4 bottom-4 w-px bg-slate-200 z-0 hidden sm:block" />

                        {activities
                            .filter(item => {
                                const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                    (item.metadata && JSON.stringify(item.metadata).toLowerCase().includes(searchQuery.toLowerCase()));
                                if (!matchesSearch) return false;

                                if (activeFilter === 'all') return true;
                                if (activeFilter === 'created') return item.action === 'created';
                                if (activeFilter === 'deleted') return item.action === 'deleted';
                                return true;
                            })
                            .slice(0, visibleCount)
                            .map((item) => {
                                const { icon: ActivityIcon, color: iconColor } = getIconForType(item.entity_type);
                                const userAvatar = item.users?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
                                const avatarColor = getAvatarColor(item.users?.name || 'Unknown');
                                const userImage = item.users?.image_url || item.users?.avatar_url || item.users?.profile_image_url;

                                return (
                                    <div key={item.id} className="relative z-10 group">
                                        <div className="flex gap-5">

                                            {/* Icon Marker */}
                                            <div className="hidden sm:flex shrink-0 w-12 h-12 bg-white border border-slate-200 rounded-md items-center justify-center shadow-sm group-hover:border-slate-300 transition-professional h-fit z-10">
                                                <div className={`p-2 rounded-md ${iconColor}`}>
                                                    <ActivityIcon className="h-5 w-5" />
                                                </div>
                                            </div>

                                            {/* Content Card */}
                                            <div className="flex-1 bg-white border border-slate-200 rounded-md p-5 hover:border-slate-300 transition-professional shadow-sm">
                                                <div className="flex flex-col gap-3">

                                                    {/* Header */}
                                                    <div className="flex justify-between items-start">
                                                        <div className="flex items-center gap-2 text-sm flex-wrap">
                                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-lg tracking-tight overflow-hidden ${avatarColor} ring-1 ring-slate-100 bg-slate-100`}>
                                                                {userImage ? (
                                                                    <img
                                                                        src={userImage}
                                                                        alt={item.users?.name || 'User'}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    userAvatar
                                                                )}
                                                            </div>
                                                            <span className="font-lg tracking-tight text-slate-900">{item.users?.name || 'System'}</span>
                                                            <span className="text-slate-500 font-lg tracking-tight">{item.action}</span>
                                                            <span className="font-lg tracking-tight text-slate-700">
                                                                {item.title}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-slate-400 whitespace-nowrap flex items-center gap-1 font-lg tracking-tight">
                                                            <Clock className="h-3 w-3" /> {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                                        </span>
                                                    </div>

                                                    {/* Meta Details */}
                                                    {item.metadata && (
                                                        <div className="text-sm text-slate-600 bg-slate-50/50 p-3 rounded-md border border-slate-100/50 text-wrap break-words font-lg tracking-tight leading-relaxed">
                                                            {typeof item.metadata === 'string' ? item.metadata : JSON.stringify(item.metadata)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>

                    {activities.filter(item => {
                        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (item.metadata && JSON.stringify(item.metadata).toLowerCase().includes(searchQuery.toLowerCase()));
                        if (!matchesSearch) return false;
                        if (activeFilter === 'all') return true;
                        if (activeFilter === 'created') return item.action === 'created';
                        if (activeFilter === 'deleted') return item.action === 'deleted';
                        return true;
                    }).length > 5 && (
                            <div className="flex justify-start gap-3 pt-4 sm:pl-[68px] pl-0">
                                {activities.filter(item => {
                                    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        (item.metadata && JSON.stringify(item.metadata).toLowerCase().includes(searchQuery.toLowerCase()));
                                    if (!matchesSearch) return false;
                                    if (activeFilter === 'all') return true;
                                    if (activeFilter === 'created') return item.action === 'created';
                                    if (activeFilter === 'deleted') return item.action === 'deleted';
                                    return true;
                                }).length > visibleCount && (
                                        <button
                                            onClick={() => setVisibleCount(prev => prev + 5)}
                                            className="px-6 py-2.5 bg-white border border-slate-200 rounded-md text-sm font-lg tracking-tight text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-professional shadow-sm flex items-center gap-2"
                                        >
                                            <Plus className="h-4 w-4" />
                                            Load more activities
                                        </button>
                                    )}

                                {visibleCount > 5 && (
                                    <button
                                        onClick={() => setVisibleCount(5)}
                                        className="px-6 py-2.5 bg-white border border-slate-200 rounded-md text-sm font-lg tracking-tight text-slate-600 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-professional shadow-sm flex items-center gap-2"
                                    >
                                        <X className="h-4 w-4" />
                                        Show less
                                    </button>
                                )}
                            </div>
                        )}
                </div>

                {/* --- RIGHT COLUMN: Tasks Sidebar --- */}
                <div className="lg:col-span-1 space-y-6">

                    <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden sticky top-24 transition-professional">
                        {/* Tasks Header */}
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="font-lg tracking-tight text-slate-900 flex items-center gap-2">
                                <CheckSquare className="h-4 w-4 text-slate-600" />
                                Tasks
                            </h3>
                            <button
                                onClick={() => setIsAddingTask(!isAddingTask)}
                                className={`text-xs font-lg tracking-tight border px-2 py-1 rounded-md transition-professional flex items-center gap-1 ${isAddingTask ? 'bg-slate-100 border-slate-200 text-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900'}`}
                            >
                                {isAddingTask ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                                {isAddingTask ? 'Cancel' : 'Add'}
                            </button>
                        </div>

                        {/* Add Task Form */}
                        {isAddingTask && (
                            <div className="p-3 bg-slate-50/50 border-b border-slate-100 animate-in slide-in-from-top-2">
                                <textarea
                                    value={newTaskInput}
                                    onChange={(e) => setNewTaskInput(e.target.value)}
                                    placeholder="Enter tasks (one per line)..."
                                    className="w-full text-sm p-3 rounded-md border border-slate-200 font-lg tracking-tight focus:outline-none focus:ring-2 focus:ring-slate-500/10 focus:border-slate-400 min-h-[80px] resize-y bg-white placeholder:text-slate-400"
                                    autoFocus
                                />
                                <div className="mt-3">
                                    <label className="text-[10px] text-slate-400 font-lg tracking-tight uppercase px-1 mb-1.5 block">Assignee</label>
                                    <div className="flex flex-wrap gap-2 px-1">
                                        <button
                                            onClick={() => setSelectedAssigneeId(null)}
                                            className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-lg tracking-tight transition-professional border ${selectedAssigneeId === null ? 'bg-slate-100 border-slate-200 text-slate-900' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                        >
                                            <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px] font-bold">?</div>
                                            None
                                        </button>
                                        {MOCK_TEAM.map(member => (
                                            <button
                                                key={member.id}
                                                onClick={() => setSelectedAssigneeId(member.id)}
                                                className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-lg tracking-tight transition-professional border ${selectedAssigneeId === member.id ? 'bg-white border-slate-300 text-slate-900 shadow-sm' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'}`}
                                            >
                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${member.color}`}>
                                                    {member.avatar}
                                                </div>
                                                {member.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end mt-4 pt-3 border-t border-slate-100/50">
                                    <button
                                        onClick={handleCreateTasks}
                                        disabled={!newTaskInput.trim() || isCreatingTask}
                                        className="bg-slate-900 text-white text-xs font-lg tracking-tight px-3 py-1.5 rounded-md hover:bg-slate-800 transition-professional disabled:opacity-50 flex items-center gap-2 shadow-sm"
                                    >
                                        {isCreatingTask ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                                        Add Tasks
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Tasks List */}
                        <div className="p-2">
                            {isLoadingTasks ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                                </div>
                            ) : tasks.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-sm italic font-lg tracking-tight">
                                    No tasks active. Start by adding one!
                                </div>
                            ) : tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={`group flex items-start gap-3 p-3 rounded-md hover:bg-slate-50 transition-professional cursor-pointer ${task.status === 'completed' ? 'opacity-60' : ''}`}
                                    onClick={() => toggleTask(task.id)}
                                >
                                    <div className={`mt-1 shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-professional ${task.status === 'completed' ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-300 group-hover:border-slate-400'}`}>
                                        {task.status === 'completed' && <Check className="h-3 w-3 text-white" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-lg tracking-tight truncate ${task.status === 'completed' ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                                            {task.title}
                                        </h4>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            {task.assignee ? (
                                                <>
                                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0 ${task.assignee.color || 'bg-slate-100 text-slate-600'}`}>
                                                        {task.assignee.avatar || task.assignee.name[0]}
                                                    </div>
                                                    <p className="text-xs text-slate-500 font-lg tracking-tight truncate">
                                                        Assigned to {task.assignee.name}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className="text-xs text-slate-400 font-lg tracking-tight">
                                                    No assignee
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[10px] font-lg tracking-tight bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-wide">
                                                {task.status === 'in_progress' ? 'Active' : 'Pending'}
                                            </span>
                                            {task.dueDate && (
                                                <span className={`text-[10px] flex items-center gap-1 font-lg tracking-tight ${task.status === 'completed' ? 'text-slate-400' : 'text-slate-600 font-lg tracking-tight'}`}>
                                                    <Clock className="h-3 w-3" /> {format(new Date(task.dueDate), 'MMM d')}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Delete Action */}
                                    <button
                                        onClick={(e) => handleDeleteTask(e, task.id)}
                                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded-md lg:opacity-0 group-hover:opacity-100 transition-professional focus:opacity-100"
                                        title="Delete task"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-slate-50 text-center">
                            <button className="text-xs text-slate-400 hover:text-slate-900 font-lg tracking-tight transition-professional">
                                View archived tasks
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default ActivityPage;