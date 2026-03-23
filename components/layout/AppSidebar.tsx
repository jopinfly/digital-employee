"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import {
  Home, MessageSquare, Files, Settings, LogOut,
  ChevronLeft, ChevronRight, Plus, Trash2,
  ShieldCheck, Bot,
} from "lucide-react";
import type { SessionUser, ConversationSummary } from "@/types";

interface Props {
  user: SessionUser;
  conversations: ConversationSummary[];
}

export function AppSidebar({ user, conversations: initialConvs }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [conversations, setConversations] = useState(initialConvs);

  async function handleDeleteConv(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await fetch("/api/conversations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (pathname === `/chat/${id}`) router.push("/");
  }

  const navItems = [
    { href: "/", icon: Home, label: "首页" },
    { href: "/files", icon: Files, label: "文件" },
    ...(user.role === "ADMIN"
      ? [{ href: "/admin", icon: ShieldCheck, label: "用户管理" }]
      : []),
  ];

  return (
    <aside
      className={`relative flex flex-col bg-[#111114] border-r border-white/[0.06] transition-all duration-300
                  ${collapsed ? "w-[60px]" : "w-[260px]"} shrink-0`}
    >
      {/* Header */}
      <div className={`flex items-center h-14 px-3 border-b border-white/[0.06] ${collapsed ? "justify-center" : "gap-2"}`}>
        {!collapsed && (
          <>
            <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shrink-0">
              <Bot size={14} className="text-white" />
            </div>
            <span className="font-semibold text-white text-sm truncate flex-1">数字员工</span>
          </>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/8 transition"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* New chat button */}
      <div className={`px-2 py-2 border-b border-white/[0.06]`}>
        <Link
          href="/chat/new"
          className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30
                      text-indigo-400 hover:bg-indigo-600/30 transition text-sm font-medium
                      ${collapsed ? "justify-center px-2" : ""}`}
        >
          <Plus size={15} />
          {!collapsed && <span>新对话</span>}
        </Link>
      </div>

      {/* Nav items */}
      <nav className="px-2 py-2 border-b border-white/[0.06] space-y-0.5">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition
                          ${collapsed ? "justify-center px-2" : ""}
                          ${active
                  ? "bg-white/10 text-white"
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
                }`}
            >
              <Icon size={16} />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Conversations list */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {conversations.length > 0 && (
            <>
              <p className="px-3 text-xs text-zinc-600 mb-1.5 font-medium">历史对话</p>
              <div className="space-y-0.5">
                {conversations.map((conv) => {
                  const active = pathname === `/chat/${conv.id}`;
                  return (
                    <Link
                      key={conv.id}
                      href={`/chat/${conv.id}`}
                      className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition
                                  ${active
                          ? "bg-white/10 text-white"
                          : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
                        }`}
                    >
                      <MessageSquare size={13} className="shrink-0" />
                      <span className="flex-1 truncate">{conv.title}</span>
                      <button
                        onClick={(e) => handleDeleteConv(conv.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-zinc-600 hover:text-red-400 transition"
                      >
                        <Trash2 size={12} />
                      </button>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Footer - user info */}
      <div className={`border-t border-white/[0.06] px-2 py-2 ${collapsed ? "flex justify-center" : ""}`}>
        {!collapsed ? (
          <div className="flex items-center gap-2 px-2 py-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-semibold text-white shrink-0">
              {(user.name ?? user.email)[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white truncate">{user.name ?? "用户"}</p>
              <p className="text-xs text-zinc-600 truncate">{user.email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition"
              title="退出登录"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </aside>
  );
}
