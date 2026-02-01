import ApiKeysPanel from "@/components/settings/ApiKeysPanel";
import { Key } from "lucide-react";

export default function ApiKeysPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-zinc-900 dark:text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <Key className="w-6 h-6 text-zinc-600 dark:text-zinc-300" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">API Keys</h1>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 mt-1">
                Create and manage API keys to access your production prompts
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Panel */}
          <div className="lg:col-span-2">
            <ApiKeysPanel />
          </div>

          {/* Info Sidebar */}
          <div className="space-y-4">
            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-sm">What are API Keys?</h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                API keys allow you to securely access your production prompts from external applications without exposing sensitive information.
              </p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-sm text-blue-900 dark:text-blue-300">Security Tips</h3>
              <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1 leading-relaxed">
                <li>• Never share your API key</li>
                <li>• Store keys in environment variables</li>
                <li>• Rotate keys periodically</li>
                <li>• Delete unused keys</li>
              </ul>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-sm text-green-900 dark:text-green-300">Get Started</h3>
              <p className="text-xs text-green-800 dark:text-green-400 leading-relaxed mb-2">
                Visit our <a href="/workspace/docs" className="font-semibold hover:underline">API documentation</a> to learn how to use your keys.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
