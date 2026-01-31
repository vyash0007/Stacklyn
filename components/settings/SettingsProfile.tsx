"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Camera, Loader2, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useApi } from "@/hooks/useApi";

export function SettingsProfile() {
    const { user, isLoaded } = useUser();
    const { updateMe } = useApi();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (user) {
            setName(`${user.firstName || ""} ${user.lastName || ""}`.trim());
            setEmail(user.primaryEmailAddress?.emailAddress || "");
        }
    }, [user]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        try {
            // Update Clerk profile
            const [firstName, ...lastNameParts] = name.split(" ");
            const lastName = lastNameParts.join(" ");

            await user.update({
                firstName,
                lastName: lastName || "",
            });

            // Update local backend with image URL and name
            await updateMe({
                name,
                image_url: user.imageUrl
            });

            toast.success("Profile updated successfully");
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;

        setIsUploading(true);
        try {
            await user.setProfileImage({ file });
            toast.success("Profile image updated");
        } catch (error: any) {
            console.error(error);
            toast.error("Failed to upload image");
        } finally {
            setIsUploading(false);
        }
    };

    if (!isLoaded) return (
        <div className="animate-pulse space-y-8">
            <div className="flex items-center gap-6">
                <div className="h-24 w-24 bg-zinc-200 dark:bg-white/10 rounded-2xl" />
                <div className="space-y-2">
                    <div className="h-5 w-24 bg-zinc-200 dark:bg-white/10 rounded" />
                    <div className="h-4 w-48 bg-zinc-200 dark:bg-white/10 rounded" />
                </div>
            </div>
            <div className="h-14 bg-zinc-200 dark:bg-white/10 rounded-xl w-full" />
            <div className="h-14 bg-zinc-200 dark:bg-white/10 rounded-xl w-full" />
        </div>
    );

    return (
        <div className="space-y-10">
            <form onSubmit={handleProfileUpdate} className="space-y-8">
                {/* Avatar Section - Card Style */}
                <div className="p-6 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02]">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative group">
                            <div className="h-24 w-24 rounded-2xl overflow-hidden border-2 border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-black/40 relative transition-all group-hover:border-zinc-300 dark:group-hover:border-white/20">
                                {isUploading ? (
                                    <div className="absolute inset-0 bg-zinc-100/90 dark:bg-black/80 flex items-center justify-center z-10">
                                        <Loader2 className="h-6 w-6 text-zinc-900 dark:text-white animate-spin" />
                                    </div>
                                ) : null}
                                <img
                                    src={user?.imageUrl}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <label className="absolute -bottom-2 -right-2 p-2.5 bg-zinc-900 dark:bg-white rounded-xl text-white dark:text-black cursor-pointer hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-all shadow-lg">
                                <Camera className="h-4 w-4" />
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    disabled={isUploading}
                                />
                            </label>
                        </div>
                        <div className="text-center sm:text-left">
                            <h4 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">Profile Photo</h4>
                            <p className="text-sm text-zinc-500 mt-1">
                                PNG or JPG. At least 400×400px recommended.
                            </p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-2">
                                Click the camera icon to upload a new photo
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Fields - Card Style */}
                <div className="p-6 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-white/[0.02] space-y-6">
                    <div className="space-y-1">
                        <h4 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">Personal Information</h4>
                        <p className="text-sm text-zinc-500">Update your personal details here.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 group">
                            <Label htmlFor="name" className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                <User className="h-3 w-3" />
                                Display Name
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                className="h-12 bg-zinc-50 dark:bg-black/40 border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-white/10 focus:border-zinc-300 dark:focus:border-white/20 transition-all rounded-xl font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                <Mail className="h-3 w-3" />
                                Email Address
                                <span className="text-[9px] px-1.5 py-0.5 bg-zinc-200 dark:bg-white/10 rounded text-zinc-400 dark:text-zinc-500 ml-1">READ ONLY</span>
                            </Label>
                            <Input
                                id="email"
                                value={email}
                                disabled
                                className="h-12 bg-zinc-100 dark:bg-white/5 border-zinc-200 dark:border-white/5 cursor-not-allowed rounded-xl text-zinc-400 dark:text-zinc-600 disabled:opacity-100 font-medium"
                            />
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="h-12 px-8 bg-zinc-900 dark:bg-white hover:bg-zinc-700 dark:hover:bg-zinc-200 text-white dark:text-black font-bold rounded-xl transition-all"
                    >
                        {isSaving ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Saving...</span>
                            </div>
                        ) : "Save Changes"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
