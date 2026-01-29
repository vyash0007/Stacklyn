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
                <div className="flex flex-col sm:flex-row items-center gap-10">
                    <div className="relative">
                        <div className="h-24 w-24 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
                            {isUploading ? (
                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                                    <Loader2 className="h-6 w-6 text-indigo-600 animate-spin" />
                                </div>
                            ) : null}
                            <img
                                src={user?.imageUrl}
                                alt="Profile"
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <label className="absolute -bottom-2 -right-2 p-2 bg-white rounded-lg border border-slate-200 text-slate-600 cursor-pointer shadow-sm hover:bg-slate-50 transition-colors">
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
                        <h4 className="text-lg font-bold text-slate-900">Avatar</h4>
                        <p className="text-sm text-slate-500 mt-1">
                            PNG or JPG. At least 400x400px recommended.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-bold text-slate-700">Display Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            className="h-11 bg-white border-slate-200 focus:border-indigo-600 rounded-lg"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-bold text-slate-700">Email Address</Label>
                        <Input
                            id="email"
                            value={email}
                            disabled
                            className="h-11 bg-slate-50 border-slate-200 cursor-not-allowed rounded-lg text-slate-500"
                        />
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-100 flex justify-end">
                    <Button
                        type="submit"
                        disabled={isSaving}
                        className="h-11 px-8 bg-black hover:bg-slate-800 text-white font-bold rounded-lg transition-all"
                    >
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
