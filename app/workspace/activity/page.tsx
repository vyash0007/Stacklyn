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
    CheckSquare,
    Plus,
    Check,
    Trash2,
    X,
    Loader2,
    Calendar,
    ArrowUpRight,
    Activity as ActivityIcon
} from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { Activity, Task } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

const MOCK_TEAM = [
    { id: '1', name: 'Luke', avatar: 'L', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
    { id: '2', name: 'Sarah', avatar: 'S', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    { id: '3', name: 'Alex', avatar: 'A', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
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
    const [visibleCount, setVisibleCount] = useState(10);

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
            case 'commit': return { icon: GitCommit, color: 'text-zinc-400 bg-white/5' };
            case 'run': return { icon: Zap, color: 'text-zinc-400 bg-white/5' };
            case 'project': return { icon: FolderPlus, color: 'text-zinc-400 bg-white/5' };
            case 'member': return { icon: UserPlus, color: 'text-zinc-400 bg-white/5' };
            default: return { icon: AlertCircle, color: 'text-zinc-400 bg-white/5' };
        }
    };

    return (
        <div className="p-8 max-w-[1600px] mx-auto space-y-12">

            {/* --- Header --- */}
            <div>
                <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                    System <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500">Activity.</span>
                </h1>
                <p className="text-zinc-500 font-medium tracking-wide">
                    Monitor workspace events and coordinate with your team.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">

                {/* --- LEFT COLUMN: Activity Feed --- */}
                <div className="lg:col-span-1 space-y-8">

                    {/* Filters & Search */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="relative flex-1 w-full max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-zinc-300 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search logs..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-[#1F1F1F] border border-white/5 rounded-md text-sm text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/5 focus:border-white/10 transition-all font-medium"
                            />
                        </div>
                        <div className="flex items-center p-1 bg-white/5 border border-white/10 rounded-md backdrop-blur-md">
                            {['all', 'created', 'deleted'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setActiveFilter(filter as any)}
                                    className={cn(
                                        "px-5 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all",
                                        activeFilter === filter
                                            ? "bg-white text-black shadow-lg shadow-white/5"
                                            : "text-zinc-500 hover:text-white"
                                    )}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Feed */}
                    <div className="space-y-6 relative">
                        <div className="absolute left-[23px] top-6 bottom-6 w-[1px] bg-white/5 hidden sm:block" />

                        {isLoading ? (
                            <div className="flex justify-center p-20">
                                <Loader2 className="h-10 w-10 animate-spin text-zinc-800" />
                            </div>
                        ) : activities
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
                                const userImage = item.users?.image_url || item.users?.avatar_url || item.users?.profile_image_url;

                                return (
                                    <div key={item.id} className="relative z-10 group">
                                        <div className="flex gap-6">

                                            {/* Icon Marker */}
                                            <div className="hidden sm:flex shrink-0 w-12 h-12 bg-[#0c0c0e] border border-white/[0.08] rounded-md items-center justify-center shadow-2xl group-hover:border-white/20 transition-all duration-300">
                                                <div className={cn("p-2.5 rounded-md", iconColor)}>
                                                    <ActivityIcon className="h-5 w-5" />
                                                </div>
                                            </div>

                                            {/* Content Card */}
                                            <div className="flex-1 bg-[#1F1F1F] border border-white/5 rounded-md p-6 hover:bg-[#252527] hover:border-white/10 transition-all duration-300 shadow-3xl backdrop-blur-md relative overflow-hidden">
                                                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                                <div className="relative z-10 flex flex-col gap-4">
                                                    {/* Header */}
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex items-center gap-3 flex-wrap">
                                                            <div className="w-6 h-6 rounded-full border border-white/10 overflow-hidden bg-zinc-800 shrink-0">
                                                                {userImage ? (
                                                                    <img src={userImage} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-zinc-500 bg-zinc-900 uppercase">
                                                                        {item.users?.name?.charAt(0) || '?'}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-white tracking-tight">{item.users?.name || 'System Auto'}</span>
                                                                <span className="text-[10px] uppercase font-bold tracking-[0.1em] text-zinc-600 px-2 py-0.5 rounded bg-white/5 border border-white/5">{item.action}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5">
                                                                <p className="text-xs text-zinc-400 font-medium leading-relaxed">
                                                                    {item.title}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                                                            <Clock className="h-3 w-3" />
                                                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                                                        </div>
                                                    </div>

                                                    {/* Meta Details */}
                                                    {item.metadata && (
                                                        <div className="text-[11px] font-mono text-zinc-500 bg-black/40 p-4 rounded-md border border-white/5 group-hover:border-white/10 transition-colors leading-relaxed">
                                                            <span className="text-zinc-700 block mb-1 uppercase text-[9px] font-bold tracking-widest">Metadata payload</span>
                                                            {typeof item.metadata === 'string' ? item.metadata : JSON.stringify(item.metadata, null, 2)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}

                        {!isLoading && activities.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 bg-white/[0.01] border-2 border-dashed border-white/[0.05] rounded-3xl space-y-4">
                                <ActivityIcon className="h-10 w-10 text-zinc-800" />
                                <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">No activity logs found</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    {activities.length > 5 && (
                        <div className="flex justify-center gap-4 pt-4">
                            {activities.length > visibleCount && (
                                <button
                                    onClick={() => setVisibleCount(prev => prev + 10)}
                                    className="px-8 py-3 bg-white text-black border-0 rounded-md text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Load More Logs
                                </button>
                            )}

                            {visibleCount > 10 && (
                                <button
                                    onClick={() => setVisibleCount(10)}
                                    className="px-8 py-3 bg-white/5 border border-white/10 rounded-md text-xs font-bold uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center gap-2"
                                >
                                    <X className="h-4 w-4" />
                                    Condense Feed
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* --- RIGHT COLUMN: Tasks Sidebar --- */}
                <div className="lg:col-span-1 space-y-8">

                    <div className="bg-[#1F1F1F] rounded-md border border-white/5 shadow-3xl overflow-hidden sticky top-24 backdrop-blur-md">
                        {/* Tasks Header */}
                        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
                            <h3 className="text-xs font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
                                <CheckSquare className="h-4 w-4 text-zinc-400" />
                                System Tasks
                            </h3>
                            <button
                                onClick={() => setIsAddingTask(!isAddingTask)}
                                className={cn(
                                    "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md border transition-all flex items-center gap-2",
                                    isAddingTask
                                        ? "bg-white text-black border-white"
                                        : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:border-white/20 hover:bg-white/10"
                                )}
                            >
                                {isAddingTask ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                                {isAddingTask ? 'Cancel' : 'New Task'}
                            </button>
                        </div>

                        {/* Add Task Form */}
                        {isAddingTask && (
                            <div className="p-6 bg-white/[0.01] border-b border-white/[0.08] animate-in slide-in-from-top-4 duration-300">
                                <textarea
                                    value={newTaskInput}
                                    onChange={(e) => setNewTaskInput(e.target.value)}
                                    placeholder="Queue multiple tasks (one per line)..."
                                    className="w-full text-sm p-4 rounded-md bg-black/40 border border-white/10 text-white placeholder-zinc-700 focus:outline-none focus:ring-2 focus:ring-white/5 focus:border-white/20 min-h-[100px] resize-none transition-all font-medium"
                                    autoFocus
                                />
                                <div className="mt-6">
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-3 block">Deployment Lead</label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSelectedAssigneeId(null)}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all border",
                                                selectedAssigneeId === null
                                                    ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                                                    : 'bg-white/5 border-white/5 text-zinc-600 hover:border-white/10 hover:text-zinc-400'
                                            )}
                                        >
                                            <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] font-black">?</div>
                                            Unassigned
                                        </button>
                                        {MOCK_TEAM.map(member => (
                                            <button
                                                key={member.id}
                                                onClick={() => setSelectedAssigneeId(member.id)}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all border",
                                                    selectedAssigneeId === member.id
                                                        ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                                                        : 'bg-white/5 border-white/5 text-zinc-600 hover:border-white/10 hover:text-zinc-400'
                                                )}
                                            >
                                                <div className={cn("w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black", member.color)}>
                                                    {member.avatar}
                                                </div>
                                                {member.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex justify-end mt-8 pt-6 border-t border-white/5">
                                    <button
                                        onClick={handleCreateTasks}
                                        disabled={!newTaskInput.trim() || isCreatingTask}
                                        className="bg-white text-black text-[10px] font-bold uppercase tracking-widest px-6 py-2.5 rounded-md hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] flex items-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                        {isCreatingTask ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                                        Initialize Tasks
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Tasks List */}
                        <div className="p-4 space-y-2">
                            {isLoadingTasks ? (
                                <div className="flex justify-center p-12">
                                    <Loader2 className="h-8 w-8 animate-spin text-zinc-800" />
                                </div>
                            ) : tasks.length === 0 ? (
                                <div className="text-center py-16 px-6 space-y-4">
                                    <CheckSquare className="h-10 w-10 text-zinc-900 mx-auto" />
                                    <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest leading-relaxed">
                                        Optimization queue is empty.
                                    </p>
                                </div>
                            ) : tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={cn(
                                        "group flex items-start gap-4 p-4 rounded-md border border-transparent hover:bg-white/5 hover:border-white/10 transition-all duration-300 cursor-pointer overflow-hidden relative",
                                        task.status === 'completed' ? 'opacity-40' : ''
                                    )}
                                    onClick={() => toggleTask(task.id)}
                                >
                                    <div className={cn(
                                        "mt-1 shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300",
                                        task.status === 'completed'
                                            ? 'bg-white border-white'
                                            : 'bg-white/5 border-white/20 group-hover:border-white/40 shadow-inner'
                                    )}>
                                        {task.status === 'completed' && <Check className="h-3 w-3 text-black stroke-[3px]" />}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className={cn(
                                            "text-sm font-bold tracking-tight truncate transition-all",
                                            task.status === 'completed' ? 'text-zinc-500 line-through' : 'text-white'
                                        )}>
                                            {task.title}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-2">
                                            {task.assignee ? (
                                                <div className="flex items-center gap-2 max-w-full">
                                                    <div className={cn(
                                                        "w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black shrink-0 border border-white/5",
                                                        task.assignee.color || 'bg-zinc-800 text-zinc-500'
                                                    )}>
                                                        {task.assignee.avatar || task.assignee.name[0]}
                                                    </div>
                                                    <p className="text-[10px] text-zinc-600 font-bold truncate tracking-tight">
                                                        {task.assignee.name}
                                                    </p>
                                                </div>
                                            ) : (
                                                <p className="text-[10px] text-zinc-700 font-bold tracking-tight">System Managed</p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 mt-4">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-[#0c0c0e] bg-zinc-500 px-2 py-0.5 rounded-sm">
                                                {task.status === 'in_progress' ? 'Active' : 'Pending'}
                                            </span>
                                            {task.dueDate && (
                                                <span className="text-[9px] flex items-center gap-1.5 font-bold uppercase tracking-widest text-zinc-700">
                                                    <Calendar className="h-3 w-3" /> {format(new Date(task.dueDate), 'MMM d')}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Delete Action */}
                                    <button
                                        onClick={(e) => handleDeleteTask(e, task.id)}
                                        className="text-zinc-800 hover:text-red-400 hover:bg-red-400/10 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                                        title="Terminate task"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5 text-center bg-white/[0.01]">
                            <button className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-all">
                                Project Archive
                            </button>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default ActivityPage;