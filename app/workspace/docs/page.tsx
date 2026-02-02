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
    <div className="relative group w-full max-w-full rounded-xl border border-zinc-700 dark:border-zinc-600 overflow-hidden">
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
      <div className="text-[10px] sm:text-xs text-zinc-400 px-3 sm:px-4 py-2 border-b border-zinc-700 dark:border-zinc-600 bg-zinc-800 font-mono">
        {language}
      </div>
      <pre className="bg-zinc-900 p-3 sm:p-4 overflow-x-auto text-[11px] sm:text-xs md:text-sm max-w-full">
        <code className="text-zinc-300 font-mono whitespace-pre">{code}</code>
      </pre>
    </div>
  );

  return (
    <div className="p-4 md:p-8 w-full max-w-full lg:max-w-[1600px] mx-auto space-y-8 md:space-y-12 pb-24 overflow-x-hidden">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-zinc-200 dark:border-white/5 bg-white dark:bg-[#1F1F1F] text-[9px] font-bold text-zinc-500 dark:text-zinc-400 mb-4 uppercase tracking-[0.2em]">
            <span className="w-1 h-1 rounded-full bg-blue-500 dark:bg-zinc-400 animate-pulse"></span>
            Documentation
          </div>
          <h1 className="text-xl md:text-2xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white mb-1 md:mb-2">
            Developer, <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-500">Guide.</span>
          </h1>
          <p className="text-xs md:text-sm lg:text-base text-zinc-500 dark:text-zinc-500 font-medium tracking-wide">
            Integrate Stacklyn prompts into your applications.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        {/* Main Content - appears first on mobile */}
        <div className="lg:col-span-8 space-y-8 lg:space-y-12 order-1">
          {/* Key Benefits */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#1F1F1F] border border-zinc-200 dark:border-white/5 backdrop-blur-md hover:border-zinc-300 dark:hover:border-white/10 transition-all">
              <Zap className="w-4 h-4 text-amber-500 mb-2 sm:mb-3" />
              <h3 className="text-[10px] sm:text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-widest mb-1">Updates</h3>
              <p className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Real-time updates</p>
            </div>
            <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#1F1F1F] border border-zinc-200 dark:border-white/5 backdrop-blur-md hover:border-zinc-300 dark:hover:border-white/10 transition-all">
              <Shield className="w-4 h-4 text-emerald-500 mb-2 sm:mb-3" />
              <h3 className="text-[10px] sm:text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-widest mb-1">Security</h3>
              <p className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Key authentication</p>
            </div>
            <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-[#1F1F1F] border border-zinc-200 dark:border-white/5 backdrop-blur-md hover:border-zinc-300 dark:hover:border-white/10 transition-all">
              <Code2 className="w-4 h-4 text-blue-500 mb-2 sm:mb-3" />
              <h3 className="text-[10px] sm:text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-widest mb-1">SDKs</h3>
              <p className="text-[9px] sm:text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Universal support</p>
            </div>
          </div>

          {/* Getting Started */}
          <section className="space-y-4 sm:space-y-6">
            <h2 className="text-[11px] sm:text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <Terminal className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-zinc-400" />
              Getting Started
            </h2>

            <div className="grid gap-3 sm:gap-4">
              <div className="flex items-center gap-4 sm:gap-6 p-3 sm:p-4 rounded-xl bg-white dark:bg-[#1F1F1F] border border-zinc-200 dark:border-white/5 backdrop-blur-md">
                <div className="text-[9px] sm:text-[10px] font-black text-zinc-200 dark:text-zinc-800 tracking-tighter">01</div>
                <div>
                  <h3 className="text-[10px] sm:text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-widest mb-0.5">Generate Keys</h3>
                  <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-500 font-medium tracking-tight">Create an API Key in settings.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 p-3 sm:p-4 rounded-xl bg-white dark:bg-[#1F1F1F] border border-zinc-200 dark:border-white/5 backdrop-blur-md">
                <div className="text-[9px] sm:text-[10px] font-black text-zinc-200 dark:text-zinc-800 tracking-tighter">02</div>
                <div>
                  <h3 className="text-[10px] sm:text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-widest mb-0.5">Project ID</h3>
                  <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-500 font-medium tracking-tight">Copy your unique project identifier.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 p-3 sm:p-4 rounded-xl bg-white dark:bg-[#1F1F1F] border border-zinc-200 dark:border-white/5 backdrop-blur-md">
                <div className="text-[9px] sm:text-[10px] font-black text-zinc-200 dark:text-zinc-800 tracking-tighter">03</div>
                <div>
                  <h3 className="text-[10px] sm:text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-widest mb-0.5">Production</h3>
                  <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-500 font-medium tracking-tight">Deploy your prompt to production.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-6 p-3 sm:p-4 rounded-xl bg-white dark:bg-[#1F1F1F] border border-zinc-200 dark:border-white/5 backdrop-blur-md">
                <div className="text-[9px] sm:text-[10px] font-black text-zinc-200 dark:text-zinc-800 tracking-tighter">04</div>
                <div>
                  <h3 className="text-[10px] sm:text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-widest mb-0.5">Integration</h3>
                  <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-500 font-medium tracking-tight">Fetch your prompt using our API.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Info - appears second on mobile, hidden on very small screens */}
        <div className="lg:col-span-4 space-y-4 sm:space-y-6 lg:space-y-8 order-2 hidden sm:block">
          <div className="bg-white dark:bg-[#1F1F1F] rounded-xl border border-zinc-200 dark:border-white/5 p-4 sm:p-6 backdrop-blur-md">
            <h3 className="text-[10px] sm:text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-widest mb-3 sm:mb-4">Best Practices</h3>
            <div className="space-y-4 sm:space-y-6">
              {[
                { title: "Caching", desc: "Cache responses for 5-15m" },
                { title: "Secrets", desc: "Use environment variables" },
                { title: "Fallbacks", desc: "Define hardcoded defaults" }
              ].map((bp, i) => (
                <div key={i} className="relative pl-3 sm:pl-4 border-l border-zinc-100 dark:border-white/5">
                  <h4 className="text-[9px] sm:text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-0.5 sm:mb-1">{bp.title}</h4>
                  <p className="text-[9px] sm:text-[10px] text-zinc-500 dark:text-zinc-500 font-medium uppercase tracking-wider">{bp.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-900 dark:bg-white rounded-xl p-4 sm:p-6 text-white dark:text-black">
            <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] mb-2">Need Help?</h3>
            <p className="text-[10px] sm:text-[11px] font-medium mb-3 sm:mb-4 opacity-60">Our engineering team is active 24/7 on support.</p>
            <a
              href="mailto:support@stacklyn.com"
              className="flex items-center justify-center w-full py-2 bg-white/10 dark:bg-black/5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-white/20 dark:hover:bg-black/10 transition-colors"
            >
              Contact Engineering
            </a>
          </div>
        </div>
      </div>

      {/* Full Width Documentation Sections */}
      <div className="space-y-10 sm:space-y-12 lg:space-y-24">
        {/* API Reference */}
        <section className="space-y-4 sm:space-y-6">
          <h2 className="text-[11px] sm:text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-[0.2em]">API Reference</h2>

          <div className="bg-white dark:bg-[#1F1F1F] rounded-xl border border-zinc-200 dark:border-white/5 p-4 sm:p-6 md:p-8 backdrop-blur-md space-y-6 sm:space-y-8">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded">GET</span>
              <code className="text-[11px] sm:text-xs font-mono text-zinc-600 dark:text-zinc-300 break-all">/v1/projects/:id/prompt</code>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12">
              <div className="lg:col-span-4 space-y-3 sm:space-y-4">
                <h4 className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Headers</h4>
                <div className="bg-zinc-50 dark:bg-[#181818] rounded-lg p-3 sm:p-4 border border-zinc-200 dark:border-white/5">
                  <code className="text-[10px] sm:text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                    Authorization: Bearer {'<key>'}
                  </code>
                </div>
              </div>
              <div className="lg:col-span-8 space-y-3 sm:space-y-4">
                <h4 className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Response Body</h4>
                <CodeBlock code={curlResponse} index={1} language="json" />
              </div>
            </div>
          </div>
        </section>

        {/* cURL Example */}
        <section className="space-y-3 sm:space-y-4">
          <h2 className="text-[11px] sm:text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-[0.2em]">cURL Integration</h2>
          <CodeBlock code={curlExample} index={0} language="bash" />
        </section>

        {/* Python Examples */}
        <section className="space-y-4 sm:space-y-6">
          <h2 className="text-[11px] sm:text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
            Python Integration
          </h2>

          <div className="space-y-8 sm:space-y-12">
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-zinc-400">Standard Request</h3>
              <CodeBlock code={pythonExample} index={2} language="python" />
            </div>

            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-zinc-400">OpenAI Provider</h3>
              <CodeBlock code={pythonWithOpenAI} index={3} language="python" />
            </div>
          </div>
        </section>

        {/* JavaScript Examples */}
        <section className="space-y-4 sm:space-y-6">
          <h2 className="text-[11px] sm:text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
            JavaScript / Node.js
          </h2>

          <div className="space-y-8 sm:space-y-12">
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-zinc-400">Fetch API</h3>
              <CodeBlock code={jsExample} index={4} language="javascript" />
            </div>
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-zinc-400">OpenAI Node</h3>
              <CodeBlock code={jsWithOpenAI} index={5} language="javascript" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
