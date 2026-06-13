"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PageItem { id: string; title: string; slug: string; status: string; updatedAt: string; }

export default function PostsPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const r = await fetch("/api/pages?type=post");
    setPosts(await r.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function createPost() {
    if (!newTitle || !newSlug) return;
    setCreating(true);
    const r = await fetch("/api/pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, slug: `blog/${newSlug}`, pageType: "post" }),
    });
    if (r.ok) {
      const { id } = await r.json();
      router.push(`/admin/builder/${id}`);
    } else { toast.error("Failed"); setCreating(false); }
  }

  async function deletePost(id: string) {
    await fetch(`/api/pages/${id}`, { method: "DELETE" });
    setDeleteId(null);
    toast.success("Deleted");
    load();
  }

  async function togglePublish(id: string) {
    const r = await fetch(`/api/pages/${id}/publish`, { method: "POST" });
    const { status } = await r.json();
    toast.success(status === "published" ? "Published" : "Unpublished");
    load();
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
        <button onClick={() => setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700">
          <Plus size={16} /> New Post
        </button>
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-semibold mb-4">New Blog Post</h2>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Title</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm" value={newTitle}
                  onChange={(e) => { setNewTitle(e.target.value); setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")); }}
                  placeholder="My first post" autoFocus />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Slug (blog/...)</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm font-mono" value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowNew(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={createPost} disabled={!newTitle || !newSlug || creating}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                {creating ? <Loader2 size={14} className="animate-spin" /> : null} Create & Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="animate-spin text-gray-400" /></div>
      ) : posts.length === 0 ? (
        <div className="text-center py-16 text-gray-400">No posts yet</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y">
          {posts.map((post) => (
            <div key={post.id} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{post.title}</p>
                <p className="text-xs text-gray-400">/{post.slug}</p>
              </div>
              <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium",
                post.status === "published" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600")}>
                {post.status}
              </span>
              <div className="flex gap-1">
                <button onClick={() => router.push(`/admin/builder/${post.id}`)} className="p-1.5 hover:bg-gray-100 rounded"><Edit size={14} /></button>
                <button onClick={() => togglePublish(post.id)} className="p-1.5 hover:bg-gray-100 rounded">
                  {post.status === "published" ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button onClick={() => setDeleteId(post.id)} className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-lg font-semibold mb-2">Delete post?</h2>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancel</button>
              <button onClick={() => deletePost(deleteId)} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
