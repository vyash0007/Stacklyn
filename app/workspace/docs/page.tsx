'use client';

import { useState } from 'react';
import { Copy, Check, Terminal, Code2, Zap, Shield, BookOpen, ExternalLink } from 'lucide-react';

export default function DocsPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const curlExample = `curl -X GET "https://api.stacklyn.com/v1/projects/YOUR_PROJECT_ID/prompt" \\
  -H "Authorization: Bearer YOUR_API_KEY"`;

  const curlResponse = `{
  "system_prompt": "You are a helpful assistant that...",
  "prompt_name": "Customer Support Bot",
  "commit_message": "Updated tone to be more friendly",
  "updated_at": "2026-02-01T11:44:04.261Z"
}`;

  const pythonExample = `import requests

API_KEY = "your_api_key_here"
PROJECT_ID = "your_project_id"  # e.g., "ff84d29e"

response = requests.get(
    f"https://api.stacklyn.com/v1/projects/{PROJECT_ID}/prompt",
    headers={"Authorization": f"Bearer {API_KEY}"}
)

data = response.json()
system_prompt = data["system_prompt"]

# Use the prompt in your application
print(f"Current prompt: {system_prompt}")`;

  const pythonWithOpenAI = `import requests
import openai

# Fetch your latest production prompt from Stacklyn
API_KEY = "your_stacklyn_api_key"
PROJECT_ID = "your_project_id"

response = requests.get(
    f"https://api.stacklyn.com/v1/projects/{PROJECT_ID}/prompt",
    headers={"Authorization": f"Bearer {API_KEY}"}
)
prompt_data = response.json()

# Use it with OpenAI
client = openai.OpenAI(api_key="your_openai_key")

completion = client.chat.completions.create(
    model="gpt-4",
    messages=[
        {"role": "system", "content": prompt_data["system_prompt"]},
        {"role": "user", "content": "Hello!"}
    ]
)

print(completion.choices[0].message.content)`;

  const jsExample = `const API_KEY = "your_api_key_here";
const PROJECT_ID = "your_project_id";  // e.g., "ff84d29e"

const response = await fetch(
  \`https://api.stacklyn.com/v1/projects/\${PROJECT_ID}/prompt\`,
  {
    headers: {
      "Authorization": \`Bearer \${API_KEY}\`
    }
  }
);

const data = await response.json();
const systemPrompt = data.system_prompt;

// Use the prompt in your application
console.log("Current prompt:", systemPrompt);`;

  const jsWithOpenAI = `import OpenAI from 'openai';

// Fetch your latest production prompt from Stacklyn
const API_KEY = "your_stacklyn_api_key";
const PROJECT_ID = "your_project_id";

const promptResponse = await fetch(
  \`https://api.stacklyn.com/v1/projects/\${PROJECT_ID}/prompt\`,
  {
    headers: { "Authorization": \`Bearer \${API_KEY}\` }
  }
);
const promptData = await promptResponse.json();

// Use it with OpenAI
const openai = new OpenAI({ apiKey: "your_openai_key" });

const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [
    { role: "system", content: promptData.system_prompt },
    { role: "user", content: "Hello!" }
  ]
});

console.log(completion.choices[0].message.content);`;

  const nodeExample = `const https = require('https');

const API_KEY = "your_api_key_here";
const PROJECT_ID = "your_project_id";

const options = {
  hostname: 'api.stacklyn.com',
  path: \`/v1/projects/\${PROJECT_ID}/prompt\`,
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${API_KEY}\`
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const promptData = JSON.parse(data);
    console.log('System Prompt:', promptData.system_prompt);
  });
});

req.end();`;

  const codeBlocks = [
    { code: curlExample, index: 0 },
    { code: curlResponse, index: 1 },
    { code: pythonExample, index: 2 },
    { code: pythonWithOpenAI, index: 3 },
    { code: jsExample, index: 4 },
    { code: jsWithOpenAI, index: 5 },
    { code: nodeExample, index: 6 },
  ];

  const CodeBlock = ({ code, index, language }: { code: string; index: number; language: string }) => (
    <div className="relative group">
      <div className="absolute right-2 top-2 z-10">
        <button
          onClick={() => copyToClipboard(code, index)}
          className="p-2 rounded-md bg-zinc-700 hover:bg-zinc-600 transition-colors"
          title="Copy code"
        >
          {copiedIndex === index ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-zinc-300" />
          )}
        </button>
      </div>
      <div className="text-xs text-zinc-500 px-4 py-2 border-b border-zinc-700 bg-zinc-900 rounded-t-lg font-mono">
        {language}
      </div>
      <pre className="bg-zinc-900 p-4 rounded-b-lg overflow-x-auto text-sm">
        <code className="text-zinc-300 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-zinc-900 dark:text-white">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
              <BookOpen className="w-6 h-6 text-zinc-600 dark:text-zinc-300" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">API Documentation</h1>
          </div>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Integrate Stacklyn prompts directly into your applications. Update your prompts from our portal without touching your code.
          </p>
        </div>

        {/* Key Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <Zap className="w-5 h-5 text-yellow-500 mb-2" />
            <h3 className="font-semibold mb-1">Real-time Updates</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Change prompts instantly without redeploying</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <Shield className="w-5 h-5 text-green-500 mb-2" />
            <h3 className="font-semibold mb-1">Secure Access</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">API key authentication keeps your prompts safe</p>
          </div>
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <Code2 className="w-5 h-5 text-blue-500 mb-2" />
            <h3 className="font-semibold mb-1">Easy Integration</h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Works with any language or framework</p>
          </div>
        </div>

        {/* Getting Started */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Terminal className="w-6 h-6" />
            Getting Started
          </h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-sm">1</div>
              <div>
                <h3 className="font-semibold mb-1">Create an API Key</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  Go to <a href="/workspace/api-keys" className="text-blue-500 hover:underline">Settings → API Keys</a> and create a new key. Save it securely - you won't see it again!
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-sm">2</div>
              <div>
                <h3 className="font-semibold mb-1">Get Your Project ID</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  Find your Project ID on the project page (e.g., <code className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-xs font-mono">ff84d29e</code>)
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-sm">3</div>
              <div>
                <h3 className="font-semibold mb-1">Push a Prompt to Production</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  Make sure you have at least one prompt version pushed to production in your project.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-sm">4</div>
              <div>
                <h3 className="font-semibold mb-1">Fetch Your Prompt</h3>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                  Use the API endpoint below to get your production prompt in any application.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* API Reference */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">API Reference</h2>
          
          <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-bold rounded">GET</span>
              <code className="text-sm font-mono">/v1/projects/{'{project_id}'}/prompt</code>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Retrieves the current production prompt for the specified project.
            </p>
            
            <h4 className="font-semibold text-sm mb-2">Headers</h4>
            <div className="bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 mb-4">
              <code className="text-sm font-mono">
                <span className="text-blue-500">Authorization</span>: Bearer YOUR_API_KEY
              </code>
            </div>

            <h4 className="font-semibold text-sm mb-2">Response</h4>
            <CodeBlock code={curlResponse} index={1} language="json" />
          </div>
        </section>

        {/* cURL Example */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Terminal className="w-6 h-6" />
            cURL
          </h2>
          <CodeBlock code={curlExample} index={0} language="bash" />
        </section>

        {/* Python Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z"/>
            </svg>
            Python
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Basic Usage</h3>
              <CodeBlock code={pythonExample} index={2} language="python" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">With OpenAI</h3>
              <CodeBlock code={pythonWithOpenAI} index={3} language="python" />
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Coming Soon:</strong> <code className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 rounded font-mono">pip install stacklyn</code> - Our official Python SDK for even easier integration!
            </p>
          </div>
        </section>

        {/* JavaScript Examples */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"/>
            </svg>
            JavaScript / Node.js
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Fetch API (Browser / Node 18+)</h3>
              <CodeBlock code={jsExample} index={4} language="javascript" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">With OpenAI SDK</h3>
              <CodeBlock code={jsWithOpenAI} index={5} language="javascript" />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Node.js (Legacy)</h3>
              <CodeBlock code={nodeExample} index={6} language="javascript" />
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Coming Soon:</strong> <code className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-800 rounded font-mono">npm install stacklyn</code> - Our official JavaScript SDK for seamless integration!
            </p>
          </div>
        </section>

        {/* Error Handling */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Error Responses</h2>
          
          <div className="space-y-4">
            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-bold rounded">401</span>
                <span className="font-semibold">Unauthorized</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Invalid or missing API key</p>
              <code className="text-xs font-mono text-zinc-500">{`{ "error": "Unauthorized" }`}</code>
            </div>
            
            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-bold rounded">404</span>
                <span className="font-semibold">Not Found</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Project not found or no production prompt</p>
              <code className="text-xs font-mono text-zinc-500">{`{ "error": "Project not found" }`}</code>
            </div>
            
            <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-bold rounded">403</span>
                <span className="font-semibold">Forbidden</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">API key does not have access to this project</p>
              <code className="text-xs font-mono text-zinc-500">{`{ "error": "Access denied to this project" }`}</code>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Best Practices</h2>
          
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">Cache prompts appropriately</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Cache the prompt response for a reasonable time (e.g., 5-15 minutes) to reduce API calls.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">Store API keys securely</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Never expose API keys in client-side code. Use environment variables or secrets managers.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">Handle errors gracefully</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Always have a fallback prompt in case the API is temporarily unavailable.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">Use the updated_at field</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Compare timestamps to know if your cached prompt needs refreshing.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Support */}
        <section className="mb-12">
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Need Help?</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              Have questions or need assistance? We're here to help!
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="mailto:support@stacklyn.com"
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg font-medium text-sm hover:opacity-90 transition-opacity"
              >
                Contact Support
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
