"use client";

import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";

export default function WorkspaceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const getTitle = () => {
        if (pathname.includes("/dashboard")) return "Dashboard";
        if (pathname.includes("/projects")) return "Projects";
        if (pathname.includes("/activity")) return "Activity";
        if (pathname.includes("/team")) return "Team";
        if (pathname.includes("/settings")) return "Settings";
        return "Stacklyn";
    };

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 flex">
            <Sidebar />
            <main className="flex-1 ml-64 flex flex-col min-h-screen bg-[#F9FAFB]">
                <Topbar title={getTitle()} breadcrumb="Stacklyn Workspace" />
                <div className="flex-1 overflow-y-auto">{children}</div>
            </main>
            <Toaster position="top-right" richColors />
        </div>
    );
}
