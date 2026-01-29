"use client";

import React from 'react';
import { Task } from '@/types';
import { Calendar, CheckCircle2, Circle } from 'lucide-react';
import { format } from 'date-fns';

interface TaskItemProps {
    task: Task;
    onToggle: (id: string) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle }) => {
    return (
        <div className="group flex items-start gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all">
            <button
                onClick={() => onToggle(task.id)}
                className={`mt-0.5 shrink-0 ${task.status === 'completed' ? 'text-emerald-500' : 'text-slate-300 group-hover:text-indigo-500'}`}
            >
                {task.status === 'completed' ? (
                    <CheckCircle2 className="h-5 w-5" />
                ) : (
                    <Circle className="h-5 w-5" />
                )}
            </button>
            <div className="flex-1">
                <p className={`text-sm font-medium ${task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                    {task.title}
                </p>

                <div className="flex items-center gap-4 mt-2">
                    {task.assignee && (
                        <div className="flex items-center gap-1.5">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${task.assignee.color} ring-1 ring-slate-100`}>
                                {task.assignee.avatar}
                            </div>
                            <span className="text-xs text-slate-500">{task.assignee.name}</span>
                        </div>
                    )}

                    {task.dueDate && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Calendar className="h-3.5 w-3.5" />
                            <span>{format(new Date(task.dueDate), 'MMM d, yyyy')}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
