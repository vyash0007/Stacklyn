"use client";

import React, { useState, useEffect } from 'react';
import { Task } from '@/types';
import { useApi } from '@/hooks/useApi';
import { TaskItem } from './TaskItem';
import { Loader2, Plus } from 'lucide-react';

export const TaskList: React.FC = () => {
    const { getTasks, createTask } = useApi();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadTasks = async () => {
            try {
                // @ts-ignore
                const data = await getTasks();
                setTasks(data);
            } catch (error) {
                console.error("Failed to load tasks:", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadTasks();
    }, [getTasks]);

    const handleToggle = (id: string) => {
        setTasks(prev => prev.map(task =>
            task.id === id
                ? { ...task, status: task.status === 'completed' ? 'in_progress' : 'completed' }
                : task
        ));
    };

    if (isLoading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Tasks</h3>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 text-slate-600 text-sm font-medium rounded-lg hover:border-indigo-200 hover:text-indigo-600 transition-colors shadow-sm">
                    <Plus className="h-4 w-4" />
                    <span>Add Task</span>
                </button>
            </div>

            <div className="space-y-3">
                {tasks.map((task) => (
                    <TaskItem key={task.id} task={task} onToggle={handleToggle} />
                ))}
            </div>

            {tasks.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-sm border-2 border-dashed border-slate-100 rounded-xl">
                    No tasks yet.
                </div>
            )}
        </div>
    );
};
