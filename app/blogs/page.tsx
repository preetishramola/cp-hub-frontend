"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAllBlogs, toggleUpvote } from "@/lib/api";

function BlogCard({ blog, onUpvote }: { blog: any; onUpvote: (id: number) => void }) {
  return (
    <div style={{
      borderBottom: "1px solid var(--border)", padding: "28px 0",
      display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "start"
    }}>
      <div>
        <div style={{ marginBottom: 10 }}>
          <Link href={`/profile/${blog.authorUsername}`} style={{
            fontFamily: "'DM Mono', monospace", fontSize: 12,
            color: "var(--text-muted)", textDecoration: "none"
          }}>@{blog.authorUsername}</Link>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--border)", margin: "0 8px" }}>·</span>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>
            {new Date(blog.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>
        <Link href={`/blogs/${blog.id}`} style={{ textDecoration: "none" }}>
          <h2 style={{
            fontFamily: "'DM Mono', monospace", fontSize: 20, fontWeight: 500,
            color: "var(--text)", margin: "0 0 10px", lineHeight: 1.3,
            transition: "color 0.15s"
          }}>{blog.title}</h2>
        </Link>
        <p style={{
          color: "var(--text-muted)", fontSize: 14, margin: 0,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden"
        }}>
          {blog.content.replace(/[#*`]/g, "").slice(0, 160)}...
        </p>
      </div>

      {/* Upvote */}
      <button onClick={() => onUpvote(blog.id)} style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
        background: "none", border: "1px solid",
        borderColor: blog.upvotedByMe ? "var(--accent)" : "var(--border)",
        color: blog.upvotedByMe ? "var(--accent)" : "var(--text-muted)",
        padding: "8px 12px", cursor: "pointer", minWidth: 48,
        fontFamily: "'DM Mono', monospace", transition: "all 0.15s"
      }}>
        <span style={{ fontSize: 16 }}>▲</span>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{blog.upvoteCount}</span>
      </button>
    </div>
  );
}

export default function BlogFeedPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isLoggedIn = typeof window !== "undefined" && !!localStorage.getItem("token");

  const load = () => getAllBlogs().then(r => { setBlogs(r.data); setLoading(false); });

  useEffect(() => { load(); }, []);

  const handleUpvote = async (id: number) => {
    if (!isLoggedIn) { window.location.href = "/login"; return; }
    await toggleUpvote(id);
    load();
  };

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40, borderBottom: "1px solid var(--border)", paddingBottom: 32 }}>
        <div>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 8 }}>COMMUNITY</p>
          <h1 style={{ fontFamily: "'DM Mono', monospace", fontSize: 32, fontWeight: 500, color: "var(--text)", margin: 0 }}>Blogs</h1>
        </div>
        <Link href="/blogs/write" style={{
          fontFamily: "'DM Mono', monospace", fontSize: 13,
          background: "var(--accent)", color: "#0e0e0e",
          padding: "9px 20px", textDecoration: "none", fontWeight: 500
        }}>+ Write</Link>
      </div>

      {loading ? (
        <p style={{ fontFamily: "'DM Mono', monospace", color: "var(--text-muted)" }}>loading...</p>
      ) : blogs.length === 0 ? (
        <p style={{ fontFamily: "'DM Mono', monospace", color: "var(--text-muted)" }}>No blogs yet. Be the first to write one.</p>
      ) : (
        blogs.map(b => <BlogCard key={b.id} blog={b} onUpvote={handleUpvote} />)
      )}
    </div>
  );
}
