"use client";

import { useState, useEffect } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";
import { useRouter } from "next/navigation";

export function SettingsAccount() {
    const { user } = useUser();
    const { signOut } = useClerk();
    const { deleteMe } = useApi();
    const router = useRouter();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmationStep, setConfirmationStep] = useState(1);
    const [phraseInput, setPhraseInput] = useState("");
    const [emailInput, setEmailInput] = useState("");
    const [countdown, setCountdown] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isModalOpen && confirmationStep === 2 && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isModalOpen, confirmationStep, countdown]);

    const openDeleteModal = () => {
        setIsModalOpen(true);
        setConfirmationStep(1);
        setPhraseInput("");
        setEmailInput("");
        setCountdown(0);
    };

    const handleFirstConfirmation = () => {
        setConfirmationStep(2);
        setCountdown(3);
    };

    const handleDeleteAccount = async () => {
        if (!user) return;

        setIsDeleting(true);
        try {
            // 1. Delete from local database
            await deleteMe();

            // 2. Delete from Clerk
            await user.delete();

            toast.success("Account deleted successfully");

            // 3. Sign out and redirect
            await signOut();
            router.push("/");
        } catch (error: any) {
            console.error("Deletion error:", error);
            toast.error(error.message || "Failed to delete account");
        } finally {
            setIsDeleting(false);
            setIsModalOpen(false);
        }
    };

    const targetPhrase = "delete my account";
    const userEmail = user?.primaryEmailAddress?.emailAddress || "";

    return (
        <div className="space-y-12">
            <div className="p-4 md:p-8 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-6">
                <div className="flex items-start gap-3 md:gap-4">
                    <div className="p-2 bg-red-500/10 rounded-lg text-red-500 shrink-0">
                        <AlertTriangle className="h-4 w-4 md:h-5 md:w-5" />
                    </div>
                    <div>
                        <h4 className="text-base md:text-lg font-bold text-white">Danger Zone</h4>
                        <p className="text-xs md:text-sm text-zinc-500 mt-1">
                            Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                    </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-end">
                    <Button
                        variant="destructive"
                        onClick={openDeleteModal}
                        className="h-10 md:h-11 px-6 md:px-8 text-sm md:text-base font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-900/20"
                    >
                        Delete Account
                    </Button>
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[480px] rounded-3xl p-0 overflow-hidden border border-white/10 bg-[#1F1F1F] shadow-2xl">
                    {confirmationStep === 1 ? (
                        <>
                            <div className="bg-white/5 p-8 text-white relative border-b border-white/5">
                                <div className="absolute top-2 right-2 opacity-10">
                                    <Trash2 className="h-24 w-24" />
                                </div>
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black tracking-tight text-white">
                                        Delete account
                                    </DialogTitle>
                                </DialogHeader>
                            </div>
                            <div className="p-8 space-y-6 text-center">
                                <div className="flex justify-center">
                                    <div className="p-4 bg-red-500/10 rounded-full border border-red-500/20">
                                        <AlertTriangle className="h-12 w-12 text-red-500" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-xl font-bold text-white">Are you absolutely sure?</p>
                                    <p className="text-sm text-zinc-400 max-w-xs mx-auto">
                                        This will permanently delete your account and all associated data.
                                    </p>
                                </div>
                                <Button
                                    className="w-full h-14 bg-white/5 hover:bg-white/10 text-red-500 border border-white/10 font-bold rounded-xl transition-all"
                                    onClick={handleFirstConfirmation}
                                >
                                    I want to delete my account
                                </Button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="bg-red-600 p-8 text-white relative">
                                <div className="absolute top-2 right-2 opacity-20">
                                    <AlertTriangle className="h-24 w-24" />
                                </div>
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-3 text-white">
                                        Final Verification
                                    </DialogTitle>
                                </DialogHeader>
                            </div>

                            <div className="p-8 space-y-6 bg-[#1F1F1F]">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-zinc-400">
                                            Type <span className="font-bold text-white">"{targetPhrase}"</span> to confirm:
                                        </p>
                                        <Input
                                            placeholder="Type phrase here..."
                                            value={phraseInput}
                                            onChange={(e) => setPhraseInput(e.target.value)}
                                            className="h-12 border-white/5 bg-black/40 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 rounded-xl px-4 text-sm font-bold text-white placeholder:text-zinc-600"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-zinc-400">
                                            Confirm your email address:
                                        </p>
                                        <Input
                                            placeholder="your@email.com"
                                            value={emailInput}
                                            onChange={(e) => setEmailInput(e.target.value)}
                                            className="h-12 border-white/5 bg-black/40 focus:border-red-500 focus:ring-1 focus:ring-red-500/20 rounded-xl px-4 text-sm font-bold text-white placeholder:text-zinc-600"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 pt-2">
                                    <Button
                                        variant="destructive"
                                        disabled={
                                            phraseInput.toLowerCase() !== targetPhrase ||
                                            emailInput !== userEmail ||
                                            countdown > 0 ||
                                            isDeleting
                                        }
                                        onClick={handleDeleteAccount}
                                        className="h-14 rounded-xl font-bold text-lg shadow-xl bg-red-600 hover:bg-red-700 text-white border-none disabled:opacity-50"
                                    >
                                        {isDeleting ? (
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                        ) : countdown > 0 ? (
                                            `Disabled for ${countdown}s`
                                        ) : (
                                            "Confirm Account Deletion"
                                        )}
                                    </Button>
                                    <button
                                        onClick={() => setConfirmationStep(1)}
                                        className="text-zinc-500 font-bold hover:text-white transition-colors py-2 text-sm"
                                    >
                                        Back
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
