"use client";

import { useState } from "react";
import type { AdminUser, UserRole } from "@/types";
import { Plus, UserCheck, UserX, ShieldCheck, User, Loader2, X } from "lucide-react";

interface Props {
  initialUsers: AdminUser[];
}

interface CreateForm {
  email: string;
  name: string;
  password: string;
  role: UserRole;
}

export function UserManagement({ initialUsers }: Props) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState<CreateForm>({
    email: "",
    name: "",
    password: "",
    role: "USER",
  });

  async function handleToggleActive(user: AdminUser) {
    setLoading(user.id);
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, isActive: !user.isActive }),
    });
    setLoading(null);
    if (res.ok) {
      const updated = await res.json();
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading("create");
    setError("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(null);
    if (res.ok) {
      const newUser = await res.json();
      setUsers((prev) => [newUser, ...prev]);
      setShowCreate(false);
      setForm({ email: "", name: "", password: "", role: "USER" });
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "创建失败");
    }
  }

  return (
    <div>
      {/* Header actions */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-zinc-500">共 {users.length} 个账号</p>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium
                     hover:bg-indigo-500 active:scale-95 transition shadow-lg shadow-indigo-500/25"
        >
          <Plus size={15} />
          新增账号
        </button>
      </div>

      {/* Create dialog */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass rounded-2xl p-6 shadow-2xl animate-slide-up">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">新增账号</h3>
              <button
                onClick={() => { setShowCreate(false); setError(""); }}
                className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/8 transition"
              >
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">姓名</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="张三"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600
                             focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">邮箱</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="zhangsan@company.com"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600
                             focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">初始密码</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="至少 8 位"
                  required
                  minLength={8}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-zinc-600
                             focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">角色</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white
                             focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition text-sm"
                >
                  <option value="USER" className="bg-zinc-900">普通用户</option>
                  <option value="ADMIN" className="bg-zinc-900">管理员</option>
                </select>
              </div>
              {error && (
                <div className="px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setError(""); }}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-zinc-400 text-sm hover:bg-white/5 transition"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading === "create"}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-medium
                             hover:bg-indigo-500 disabled:opacity-60 transition flex items-center justify-center gap-2"
                >
                  {loading === "create" ? <Loader2 size={15} className="animate-spin" /> : null}
                  创建账号
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Users table */}
      <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] bg-white/[0.02]">
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">用户</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">角色</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">状态</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-zinc-500">创建时间</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-zinc-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-semibold text-white shrink-0">
                      {(user.name ?? user.email)[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white font-medium">{user.name ?? "—"}</p>
                      <p className="text-zinc-500 text-xs">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium
                                ${user.role === "ADMIN"
                        ? "bg-purple-500/15 text-purple-400"
                        : "bg-zinc-700/50 text-zinc-400"
                      }`}
                  >
                    {user.role === "ADMIN" ? <ShieldCheck size={11} /> : <User size={11} />}
                    {user.role === "ADMIN" ? "管理员" : "用户"}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium
                                ${user.isActive
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-red-500/15 text-red-400"
                      }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-emerald-400" : "bg-red-400"}`} />
                    {user.isActive ? "正常" : "已禁用"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-zinc-500 text-xs">
                  {new Date(user.createdAt).toLocaleDateString("zh-CN")}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <button
                    onClick={() => handleToggleActive(user)}
                    disabled={loading === user.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition
                                ${user.isActive
                        ? "text-red-400 hover:bg-red-500/10"
                        : "text-emerald-400 hover:bg-emerald-500/10"
                      } disabled:opacity-50`}
                  >
                    {loading === user.id ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : user.isActive ? (
                      <UserX size={13} />
                    ) : (
                      <UserCheck size={13} />
                    )}
                    {user.isActive ? "禁用" : "启用"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
