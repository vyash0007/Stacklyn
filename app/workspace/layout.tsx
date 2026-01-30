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
        <div className="min-h-screen bg-[#181818] text-white font-sans selection:bg-white/30 flex relative overflow-hidden">
            {/* --- Decorative Background Elements --- */}
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,20,20,1)_0%,transparent_100%)]"></div>
            </div>

            {/* --- Ambient Lighting --- */}
            <div className="fixed top-0 left-1/4 w-[800px] h-[800px] bg-white/[0.02] blur-[150px] pointer-events-none -z-10" />
            <div className="fixed bottom-0 right-1/4 w-[800px] h-[800px] bg-zinc-900/10 blur-[180px] rounded-full pointer-events-none -z-10" />

            <Sidebar />

            <main className="flex-1 ml-0 lg:ml-64 flex flex-col min-h-screen relative z-10 transition-all duration-300">
                <Topbar title={getTitle()} breadcrumb="Workspace" />
                <div className="flex-1 overflow-y-auto relative">{children}</div>
            </main>

            <Toaster position="top-right" theme="dark" richColors />
        </div>
    );
}
