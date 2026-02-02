'use client'
import { useEffect, useState } from "react";
import { EyeOff, Trash2, Plus, Copy, Check, AlertCircle, Zap } from "lucide-react";
import { useApi } from "@/hooks/useApi";

interface ApiKey {
  id: string;
  name: string;
  status: string;
  created_at: string;
  key?: string; // Only present on creation
}

export default function ApiKeysPanel() {
  const api = useApi();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showKey, setShowKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const keys = await api.getApiKeys();
      setApiKeys(keys);
    } catch (e) {
      // handle error
    }
  };

  const handleAddKey = async () => {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const res = await api.createApiKey({ name: newKeyName.trim() });
      setShowKey(res.key); // Only show once
      setApiKeys([{ ...res, status: 'active' }, ...apiKeys]);
      setNewKeyName("");
    } catch (e) {
      // handle error
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      await api.revokeApiKey(id);
      // Remove the key from the list after successful deletion
      setApiKeys(apiKeys.filter((key) => key.id !== id));
    } catch (e: any) {
      alert(e.message || 'Failed to delete API key');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Create New Key Section */}
      <div className="bg-white dark:bg-[#1F1F1F] rounded-xl border border-zinc-200 dark:border-white/5 p-6 md:p-8 backdrop-blur-md dark:shadow-3xl transition-all">
        <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
          <Plus className="w-3.5 h-3.5 text-zinc-400" />
          Create New API Key
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1 relative group">
            <input
              className="w-full px-4 py-3 rounded-lg border border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-[#181818] text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-white/20 transition-all"
              placeholder="e.g., Production API, Integration Test"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddKey()}
              disabled={creating}
            />
          </div>
          <button
            className="px-6 py-3 rounded-lg bg-zinc-900 dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 whitespace-nowrap hover:bg-zinc-800 dark:hover:bg-zinc-100"
            onClick={handleAddKey}
            disabled={creating || !newKeyName.trim()}
          >
            {creating ? (
              <>
                <Zap className="w-3.5 h-3.5 animate-spin" />
                Processing
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Create Key
              </>
            )}
          </button>
        </div>

        {/* Display New Key Alert */}
        {showKey && (
          <div className="p-5 bg-emerald-50/50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20 rounded-lg animate-in zoom-in-95 duration-300">
            <div className="flex gap-4 mb-4">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
              </div>
              <div className="flex-1 pt-1">
                <p className="font-bold text-sm text-emerald-900 dark:text-emerald-400 mb-1">API Key Created</p>
                <p className="text-xs text-emerald-800/70 dark:text-emerald-500/60 leading-relaxed">
                  Save this key now. It will not be shown again for security.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white dark:bg-[#181818] rounded-lg p-4 border border-emerald-200 dark:border-emerald-500/10 font-mono text-sm text-zinc-900 dark:text-white break-all shadow-sm">
              <span className="flex-1 select-all">{showKey}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(showKey);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex-shrink-0 p-2 rounded-md hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors group/copy"
                title="Copy API Key"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4 text-zinc-400 group-hover/copy:text-zinc-600 dark:group-hover/copy:text-zinc-300" />
                )}
              </button>
            </div>
            {copied && <p className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-2 font-bold uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-1">Copied to clipboard!</p>}
          </div>
        )}
      </div>

      {/* API Keys List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-zinc-400" />
            Active Keys ({apiKeys.length})
          </h3>
        </div>

        {apiKeys.length === 0 ? (
          <div className="bg-white dark:bg-[#1F1F1F] rounded-xl border border-zinc-200 dark:border-white/5 p-12 text-center backdrop-blur-md">
            <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-[#181818] flex items-center justify-center mx-auto mb-4 border border-zinc-100 dark:border-white/5">
              <EyeOff className="w-6 h-6 text-zinc-300 dark:text-zinc-700" />
            </div>
            <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">No keys found</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="group flex items-center justify-between p-5 rounded-xl bg-white dark:bg-[#1F1F1F] border border-zinc-200 dark:border-white/5 hover:border-zinc-300 dark:hover:border-white/10 transition-all backdrop-blur-md"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h4 className="font-bold text-sm text-zinc-900 dark:text-white truncate tracking-tight">
                      {key.name}
                    </h4>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest whitespace-nowrap flex-shrink-0 ${key.status === 'active'
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500'
                        : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-500'
                      }`}>
                      {key.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="text-[10px] font-medium text-zinc-500 dark:text-zinc-500 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
                      Created {new Date(key.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <button
                  className="ml-4 p-2.5 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
                  onClick={() => handleDeleteKey(key.id)}
                  title="Delete API Key"
                  disabled={key.status !== 'active'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
