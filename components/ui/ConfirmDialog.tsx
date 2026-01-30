import React from 'react';

interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning';
}

export function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Delete',
    cancelText = 'Cancel',
    variant = 'danger'
}: ConfirmDialogProps) {
    if (!open) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-[#1F1F1F] rounded-md shadow-3xl max-w-md w-full mx-4 overflow-hidden border border-white/10">
                <div className="p-8">
                    <div className="flex flex-col items-center text-center gap-6">
                        <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center border-2 ${variant === 'danger' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                            <svg className="w-8 h-8 font-bold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold tracking-tight text-white mb-3 uppercase">
                                {title}
                            </h3>
                            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
                                {description}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white/[0.02] px-8 py-5 flex gap-4 justify-center border-t border-white/5">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-widest text-zinc-400 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 hover:text-white transition-all"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`flex-1 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white rounded-md transition-all shadow-lg ${variant === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
