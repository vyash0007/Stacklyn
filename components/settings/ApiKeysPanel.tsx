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
    <div className="space-y-6">
      {/* Create New Key Section */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-500" />
          Create New API Key
        </h3>
        
        <div className="flex gap-2 mb-4">
          <input
            className="flex-1 px-4 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Enter a name for this key (e.g., Production API, Integration Test)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddKey()}
            disabled={creating}
          />
          <button
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 whitespace-nowrap"
            onClick={handleAddKey}
            disabled={creating || !newKeyName.trim()}
          >
            {creating ? (
              <>
                <Zap className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Key
              </>
            )}
          </button>
        </div>

        {/* Display New Key Alert */}
        {showKey && (
          <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex gap-3 mb-3">
              <AlertCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-green-900 dark:text-green-300 mb-1">API Key Created Successfully</p>
                <p className="text-xs text-green-800 dark:text-green-400 mb-3">
                  Save this key now. You won't be able to see it again for security reasons.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 rounded-lg p-3 font-mono text-sm text-zinc-900 dark:text-white break-all">
              <span className="flex-1">{showKey}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(showKey);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex-shrink-0 p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                title="Copy API Key"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4 text-zinc-500" />
                )}
              </button>
            </div>
            {copied && <p className="text-xs text-green-600 dark:text-green-400 mt-2 text-center font-medium">Copied to clipboard!</p>}
          </div>
        )}
      </div>

      {/* API Keys List Section */}
      <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Your API Keys ({apiKeys.length})
        </h3>

        {apiKeys.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
            <EyeOff className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No API keys yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between p-4 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <EyeOff className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                    <h4 className="font-semibold text-sm text-zinc-900 dark:text-white truncate">
                      {key.name}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase whitespace-nowrap flex-shrink-0 ${
                      key.status === 'active' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                        : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    }`}>
                      {key.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Created {new Date(key.created_at).toLocaleDateString()} at {new Date(key.created_at).toLocaleTimeString()}
                  </p>
                </div>
                
                <button
                  className="ml-4 p-2 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex-shrink-0"
                  onClick={() => handleDeleteKey(key.id)}
                  title="Delete API Key"
                  disabled={key.status !== 'active'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
