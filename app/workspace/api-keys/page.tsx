import ApiKeysPanel from "@/components/settings/ApiKeysPanel";
import { Key } from "lucide-react";

export default function ApiKeysPage() {
  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 md:space-y-12 pb-24">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="animate-in fade-in slide-in-from-left-4 duration-500">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#1F1F1F] text-[9px] font-bold text-zinc-500 dark:text-zinc-400 mb-4 uppercase tracking-[0.2em]">
            <span className="w-1 h-1 rounded-full bg-emerald-500 dark:bg-zinc-400 animate-pulse"></span>
            System Operational
          </div>
          <h1 className="text-xl md:text-2xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1 md:mb-2">
            Access, <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-500">API Keys.</span>
          </h1>
          <p className="text-xs md:text-sm lg:text-base text-zinc-500 dark:text-zinc-500 font-medium tracking-wide">
            Manage secure keys for your AI engineering workbench.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Panel */}
        <div className="lg:col-span-8">
          <ApiKeysPanel />
        </div>

        {/* Info Sidebar */}
        <div className="lg:col-span-4 space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-[0.2em]">Documentation</h2>
          </div>

          <div className="bg-white dark:bg-[#1F1F1F] rounded-xl border border-zinc-200 dark:border-white/5 p-6 space-y-8 backdrop-blur-md">
            <div>
              <h3 className="text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-widest mb-3">What are API Keys?</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium">
                API keys allow you to securely access your production prompts from external applications without exposing sensitive information.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/5">
              <h3 className="text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-widest mb-3">Security Protocol</h3>
              <ul className="text-[11px] text-zinc-500 dark:text-zinc-500 space-y-2 font-bold uppercase tracking-wider">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                  Never share keys
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                  Use Env Variables
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                  Rotate periodically
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-widest mb-3">Developer Resources</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-medium mb-4">
                Learn how to integrate these keys into your tech stack.
              </p>
              <a
                href="/workspace/docs"
                className="inline-flex items-center gap-2 text-[10px] font-bold text-zinc-900 dark:text-zinc-200 uppercase tracking-[0.2em] hover:opacity-70 transition-opacity"
              >
                View API Documentation
                <span className="text-lg">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
