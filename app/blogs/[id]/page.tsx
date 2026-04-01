"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { getBlog, toggleUpvote, addComment, deleteComment, deleteBlog } from "@/lib/api";

function Comment({ comment, blogId, currentUser, onReload, depth = 0 }: any) {
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitReply = async () => {
    if (!replyText.trim()) return;
    setSubmitting(true);
    try {
      await addComment(blogId, { content: replyText, parentId: comment.id });
      setReplyText(""); setReplying(false); onReload();
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ marginLeft: depth > 0 ? 24 : 0, borderLeft: depth > 0 ? "2px solid var(--border)" : "none", paddingLeft: depth > 0 ? 16 : 0 }}>
      <div style={{ padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link href={`/profile/${comment.authorUsername}`} style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--accent)", textDecoration: "none" }}>
              @{comment.authorUsername}
            </Link>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text-muted)" }}>
              {new Date(comment.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {currentUser && (
              <button onClick={() => setReplying(!replying)} style={{
                fontFamily: "'DM Mono', monospace", fontSize: 11,
                background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer"
              }}>reply</button>
            )}
            {currentUser === comment.authorUsername && (
              <button onClick={async () => { await deleteComment(comment.id); onReload(); }} style={{
                fontFamily: "'DM Mono', monospace", fontSize: 11,
                background: "none", border: "none", color: "var(--danger)", cursor: "pointer"
              }}>delete</button>
            )}
          </div>
        </div>
        <p style={{ color: "var(--text)", fontSize: 14, margin: 0, lineHeight: 1.7 }}>{comment.content}</p>

        {replying && (
          <div style={{ marginTop: 12 }}>
            <textarea
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              rows={2}
              style={{
                width: "100%", padding: "8px 12px",
                background: "var(--bg-2)", border: "1px solid var(--border)",
                color: "var(--text)", fontFamily: "'Lora', serif", fontSize: 14,
                resize: "vertical", outline: "none"
              }}
            />
            <button onClick={submitReply} disabled={submitting} style={{
              marginTop: 8, padding: "6px 16px",
              background: "var(--accent)", color: "#0e0e0e",
              fontFamily: "'DM Mono', monospace", fontSize: 12, border: "none", cursor: "pointer"
            }}>{submitting ? "..." : "Reply"}</button>
          </div>
        )}
      </div>

      {comment.replies?.map((r: any) => (
        <Comment key={r.id} comment={r} blogId={blogId} currentUser={currentUser} onReload={onReload} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function BlogDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const currentUser = typeof window !== "undefined" ? localStorage.getItem("username") : null;

  const load = async () => {
    const res = await getBlog(Number(id));
    setBlog(res.data);
    setLoading(false);
  };

  useEffect(() => { load(); }, [id]);

  const handleUpvote = async () => {
    if (!currentUser) { router.push("/login"); return; }
    await toggleUpvote(Number(id));
    load();
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try { await addComment(Number(id), { content: commentText }); setCommentText(""); load(); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this blog?")) return;
    await deleteBlog(Number(id));
    router.push("/blogs");
  };

  if (loading) return <div style={{ padding: 80, textAlign: "center", fontFamily: "'DM Mono', monospace", color: "var(--text-muted)" }}>loading...</div>;
  if (!blog) return <div style={{ padding: 80, textAlign: "center", fontFamily: "'DM Mono', monospace", color: "var(--danger)" }}>Blog not found.</div>;

  return (
    <div style={{ maxWidth: 740, margin: "0 auto", padding: "48px 24px" }}>
      {/* Back */}
      <Link href="/blogs" style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--text-muted)", textDecoration: "none", display: "block", marginBottom: 40 }}>← back to blogs</Link>

      {/* Header */}
      <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 28, marginBottom: 40 }}>
        <h1 style={{ fontFamily: "'DM Mono', monospace", fontSize: 32, fontWeight: 500, color: "var(--text)", marginBottom: 16, lineHeight: 1.2 }}>{blog.title}</h1>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Link href={`/profile/${blog.authorUsername}`} style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "var(--accent)", textDecoration: "none" }}>@{blog.authorUsername}</Link>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>
              {new Date(blog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={handleUpvote} style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "none", border: "1px solid",
              borderColor: blog.upvotedByMe ? "var(--accent)" : "var(--border)",
              color: blog.upvotedByMe ? "var(--accent)" : "var(--text-muted)",
              padding: "6px 14px", cursor: "pointer",
              fontFamily: "'DM Mono', monospace", fontSize: 13
            }}>▲ {blog.upvoteCount}</button>
            {currentUser === blog.authorUsername && (
              <>
                <Link href={`/blogs/write?edit=${blog.id}`} style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--text-muted)", textDecoration: "none", border: "1px solid var(--border)", padding: "6px 14px" }}>edit</Link>
                <button onClick={handleDelete} style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, background: "none", border: "1px solid var(--border)", color: "var(--danger)", padding: "6px 14px", cursor: "pointer" }}>delete</button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="prose-blog" style={{ marginBottom: 64 }}>
        <ReactMarkdown>{blog.content}</ReactMarkdown>
      </div>

      {/* Comments */}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 40 }}>
        <h3 style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 500, color: "var(--text)", marginBottom: 24 }}>
          {blog.comments?.length || 0} comments
        </h3>

        {currentUser && (
          <div style={{ marginBottom: 32 }}>
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              style={{
                width: "100%", padding: "12px 16px",
                background: "var(--bg-2)", border: "1px solid var(--border)",
                color: "var(--text)", fontFamily: "'Lora', serif", fontSize: 14,
                resize: "vertical", outline: "none", display: "block"
              }}
            />
            <button onClick={handleComment} disabled={submitting} style={{
              marginTop: 10, padding: "9px 24px",
              background: "var(--accent)", color: "#0e0e0e",
              fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500,
              border: "none", cursor: "pointer"
            }}>{submitting ? "posting..." : "Post comment"}</button>
          </div>
        )}

        {!currentUser && (
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "var(--text-muted)", marginBottom: 32 }}>
            <Link href="/login" style={{ color: "var(--accent)" }}>Sign in</Link> to leave a comment.
          </p>
        )}

        {blog.comments?.map((c: any) => (
          <Comment key={c.id} comment={c} blogId={blog.id} currentUser={currentUser} onReload={load} />
        ))}
      </div>
    </div>
  );
}
