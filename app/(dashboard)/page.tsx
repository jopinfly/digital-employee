import { auth } from "@/auth";
import Link from "next/link";
import {
  Bot, Search, FileText, Code2, BarChart3,
  Sparkles, MessageSquare, Globe, Calculator, Zap,
} from "lucide-react";

const AGENTS = [
  {
    id: "general",
    icon: Sparkles,
    title: "通用助手",
    description: "回答问题、头脑风暴、帮你解决各类工作难题",
    color: "from-indigo-500 to-purple-600",
    glow: "shadow-indigo-500/20",
    href: "/chat/new?agent=general",
  },
  {
    id: "search",
    icon: Globe,
    title: "联网搜索",
    description: "实时获取最新信息，结合网络搜索结果给出精准回答",
    color: "from-cyan-500 to-blue-600",
    glow: "shadow-cyan-500/20",
    href: "/chat/new?agent=search",
  },
  {
    id: "document",
    icon: FileText,
    title: "文档分析",
    description: "上传文档，快速提取关键信息，智能摘要与分析",
    color: "from-emerald-500 to-teal-600",
    glow: "shadow-emerald-500/20",
    href: "/chat/new?agent=document",
  },
  {
    id: "code",
    icon: Code2,
    title: "代码助手",
    description: "代码生成、审查、重构，多语言支持",
    color: "from-orange-500 to-red-600",
    glow: "shadow-orange-500/20",
    href: "/chat/new?agent=code",
  },
  {
    id: "data",
    icon: BarChart3,
    title: "数据分析",
    description: "数据洞察、报表生成、趋势分析与可视化建议",
    color: "from-pink-500 to-rose-600",
    glow: "shadow-pink-500/20",
    href: "/chat/new?agent=data",
  },
  {
    id: "calculator",
    icon: Calculator,
    title: "计算推理",
    description: "复杂数学计算、逻辑推理、财务模型",
    color: "from-yellow-500 to-amber-600",
    glow: "shadow-yellow-500/20",
    href: "/chat/new?agent=calculator",
  },
];

export default async function DashboardPage() {
  const session = await auth();
  const name = session?.user?.name?.split(" ")[0] ?? "员工";

  return (
    <div className="h-full flex flex-col overflow-auto">
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-4">
            <Zap size={12} />
            AI 驱动的数字员工平台
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            你好，{name}
            <span className="gradient-text"> 👋</span>
          </h1>
          <p className="text-zinc-400 text-lg">今天想让我帮你做什么？</p>
        </div>

        {/* Quick search / prompt */}
        <Link
          href="/chat/new"
          className="block w-full mb-10 group"
        >
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-white/5 border border-white/10
                          hover:bg-white/8 hover:border-white/20 transition cursor-text shadow-lg shadow-black/30">
            <Search size={18} className="text-zinc-500" />
            <span className="text-zinc-500 text-sm flex-1">输入任务或问题，开始对话...</span>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs text-zinc-600 bg-white/5 border border-white/10">
              ⌘K
            </kbd>
          </div>
        </Link>

        {/* Agent cards */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Bot size={16} className="text-zinc-500" />
            <h2 className="text-sm font-medium text-zinc-400">选择 AI 助手</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {AGENTS.map((agent) => {
              const Icon = agent.icon;
              return (
                <Link
                  key={agent.id}
                  href={agent.href}
                  className={`group relative p-5 rounded-2xl bg-white/[0.03] border border-white/8
                              hover:bg-white/[0.06] hover:border-white/15 transition-all duration-200
                              hover:shadow-xl hover:${agent.glow} cursor-pointer`}
                >
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${agent.color}
                                shadow-lg mb-3 group-hover:scale-110 transition-transform duration-200`}
                  >
                    <Icon size={20} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1">{agent.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{agent.description}</p>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MessageSquare size={14} className="text-zinc-500" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent tip */}
        <div className="mt-10 flex items-start gap-3 px-4 py-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-zinc-600 text-xs">
          <Sparkles size={14} className="text-indigo-500/60 mt-0.5 shrink-0" />
          <span>
            支持 GPT-4o、Claude 3.5、Gemini 1.5 Pro、DeepSeek 等多种模型，可在对话中随时切换。
            开启 <strong className="text-zinc-400">Agent 模式</strong> 可让 AI 自主搜索网络、调用工具完成复杂任务。
          </span>
        </div>
      </div>
    </div>
  );
}
