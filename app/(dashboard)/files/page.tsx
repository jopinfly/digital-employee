"use client";

import { useState, useEffect } from "react";
import { Upload, Trash2, File as FileIcon, ImageIcon, FileText, Loader2 } from "lucide-react";
import type { FileItem } from "@/types";

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/files")
      .then((r) => r.json())
      .then(setFiles)
      .finally(() => setLoading(false));
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/files", { method: "POST", body: fd });
    if (res.ok) {
      const newFile = await res.json();
      setFiles((prev) => [newFile, ...prev]);
    }
    setUploading(false);
    e.target.value = "";
  }

  async function handleDelete(id: string) {
    await fetch("/api/files", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }

  function getIcon(mimeType: string) {
    if (mimeType.startsWith("image/")) return <ImageIcon size={18} className="text-pink-400" />;
    if (mimeType.includes("pdf") || mimeType.includes("text")) return <FileText size={18} className="text-blue-400" />;
    return <FileIcon size={18} className="text-zinc-400" />;
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">文件管理</h1>
            <p className="text-zinc-500 text-sm mt-1">上传文件以在对话中引用分析</p>
          </div>
          <label className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-sm font-medium
                            hover:bg-indigo-500 active:scale-95 transition shadow-lg shadow-indigo-500/25 cursor-pointer
                            ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}>
            {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
            {uploading ? "上传中..." : "上传文件"}
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 size={20} className="animate-spin text-zinc-600" />
          </div>
        ) : files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 text-center">
            <FileIcon size={40} className="text-zinc-700 mb-3" />
            <p className="text-zinc-500 text-sm">还没有上传任何文件</p>
            <p className="text-zinc-700 text-xs mt-1">支持 PDF、图片、文本等格式（最大 10MB）</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.06] overflow-hidden">
            {files.map((file, i) => (
              <div
                key={file.id}
                className={`flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition
                            ${i < files.length - 1 ? "border-b border-white/[0.04]" : ""}`}
              >
                <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/8 flex items-center justify-center shrink-0">
                  {getIcon(file.mimeType)}
                </div>
                <div className="flex-1 min-w-0">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white hover:text-indigo-400 transition truncate block"
                  >
                    {file.name}
                  </a>
                  <p className="text-xs text-zinc-600 mt-0.5">
                    {formatSize(file.size)} · {new Date(file.createdAt).toLocaleDateString("zh-CN")}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(file.id)}
                  className="p-1.5 rounded-lg text-zinc-700 hover:text-red-400 hover:bg-red-500/10 transition"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
