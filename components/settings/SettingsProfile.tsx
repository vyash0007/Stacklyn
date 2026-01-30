"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Camera, Loader2, Check, Shield } from "lucide-react";
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

    if (!isLoaded) return <div className="animate-pulse space-y-4">
        <div className="h-20 w-20 bg-slate-100 rounded-full" />
        <div className="h-10 bg-slate-100 rounded-md w-full" />
        <div className="h-10 bg-slate-100 rounded-md w-full" />
    </div>;

    return (
        <div className="space-y-12">
            <form onSubmit={handleProfileUpdate} className="space-y-12">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-10">
                    <div className="relative">
                        <div className="h-24 w-24 rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-sm relative">
                            {isUploading ? (
                                <div className="absolute inset-0 bg-[#181818]/80 flex items-center justify-center z-10">
                                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                                </div>
                            ) : null}
                            <img
                                src={user?.imageUrl}
                                alt="Profile"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <label className="absolute -bottom-2 -right-2 p-2 bg-white rounded-lg border border-white/5 text-black cursor-pointer shadow-sm hover:bg-zinc-100 transition-colors">
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
                        <h4 className="text-lg font-bold text-white">Avatar</h4>
                        <p className="text-sm text-zinc-500 mt-1">
                            PNG or JPG. At least 400x400px recommended.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                    <div className="space-y-2 group">
                        <Label htmlFor="name" className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider group-focus-within:text-white transition-colors">Display Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="h-11 bg-black/40 border-white/5 text-white focus:ring-1 focus:ring-white/10 focus:border-white/20 transition-all rounded-lg"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Email Address</Label>
                        <Input
                            id="email"
                            value={email}
                            disabled
                            className="h-11 bg-white/5 border-white/5 cursor-not-allowed rounded-lg text-zinc-600 disabled:opacity-100"
                        />
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex justify-end">
                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="h-11 px-8 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl transition-all shadow-lg"
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
