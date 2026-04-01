"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createBlog, updateBlog, getBlog } from "@/lib/api";

export default function WriteBlogPage() {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("edit");
  const isEdit = !!editId;

  const [form, setForm] = useState({ title: "", content: "" });
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/login"); return; }
    if (isEdit) {
      getBlog(Number(editId)).then(r => setForm({ title: r.data.title, content: r.data.content }));
    }
  }, []);

  const submit = async () => {
    if (!form.title.trim() || !form.content.trim()) { setError("Title and content are required."); return; }
    setLoading(true); setError("");
    try {
      if (isEdit) {
        await updateBlog(Number(editId), form);
        router.push(`/blogs/${editId}`);
      } else {
        const res = await createBlog(form);
        router.push(`/blogs/${res.data.id}`);
      }
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to save blog");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40, borderBottom: "1px solid var(--border)", paddingBottom: 24 }}>
        <div>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 8 }}>
            {isEdit ? "EDITING" : "NEW POST"}
          </p>
          <h1 style={{ fontFamily: "'DM Mono', monospace", fontSize: 28, fontWeight: 500, color: "var(--text)", margin: 0 }}>
            {isEdit ? "Edit Blog" : "Write a Blog"}
          </h1>
        </div>
        <button onClick={() => setPreview(!preview)} style={{
          fontFamily: "'DM Mono', monospace", fontSize: 13,
          background: preview ? "var(--accent)" : "none",
          color: preview ? "#0e0e0e" : "var(--text-muted)",
          border: "1px solid var(--border)", padding: "8px 20px", cursor: "pointer"
        }}>{preview ? "✎ Edit" : "◉ Preview"}</button>
      </div>

      {/* Title */}
      <input
        value={form.title}
        onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
        placeholder="Title"
        style={{
          width: "100%", padding: "14px 0",
          background: "none", border: "none",
          borderBottom: "1px solid var(--border)",
          color: "var(--text)", fontFamily: "'DM Mono', monospace",
          fontSize: 24, fontWeight: 500, outline: "none",
          marginBottom: 24, display: "block"
        }}
      />

      {preview ? (
        <div className="prose-blog" style={{ minHeight: 400, padding: "24px 0" }}>
          {form.content ? (
            // Simple markdown preview without ReactMarkdown to avoid SSR issues on write page
            <pre style={{ fontFamily: "'Lora', serif", whiteSpace: "pre-wrap", color: "var(--text)", fontSize: 15, lineHeight: 1.8 }}>
              {form.content}
            </pre>
          ) : (
            <p style={{ color: "var(--text-muted)", fontFamily: "'DM Mono', monospace", fontSize: 14 }}>Nothing to preview yet.</p>
          )}
        </div>
      ) : (
        <textarea
          value={form.content}
          onChange={e => setForm(p => ({ ...p, content: e.target.value }))}
          placeholder={`Write your blog in markdown...\n\n# Heading\n**bold**, *italic*\n\`\`\`cpp\n// code block\n\`\`\``}
          rows={22}
          style={{
            width: "100%", padding: "16px",
            background: "var(--bg-2)", border: "1px solid var(--border)",
            color: "var(--text)", fontFamily: "'DM Mono', monospace",
            fontSize: 14, lineHeight: 1.8, resize: "vertical", outline: "none"
          }}
        />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24 }}>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--text-muted)", margin: 0 }}>
          Markdown supported
        </p>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {error && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--danger)" }}>{error}</span>}
          <button onClick={submit} disabled={loading} style={{
            padding: "10px 28px",
            background: "var(--accent)", color: "#0e0e0e",
            fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 500,
            border: "none", cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1
          }}>{loading ? "saving..." : isEdit ? "Update" : "Publish"}</button>
        </div>
      </div>
    </div>
  );
}
