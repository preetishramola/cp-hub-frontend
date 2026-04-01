"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPublicProfile, getBlogsByUser } from "@/lib/api";

const PLATFORM_COLOR: Record<string, string> = {
  CODEFORCES: "#e8c547",
  LEETCODE: "#f89f1b",
  CODECHEF: "#5ce08a",
};

export default function PublicProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState<any>(null);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    Promise.all([
      getPublicProfile(username as string),
      getBlogsByUser(username as string),
    ]).then(([profileRes, blogsRes]) => {
      setProfile(profileRes.data);
      setBlogs(blogsRes.data);
    }).catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <div style={{ padding: 80, textAlign: "center", fontFamily: "'DM Mono', monospace", color: "var(--text-muted)" }}>loading...</div>;
  if (notFound) return <div style={{ padding: 80, textAlign: "center", fontFamily: "'DM Mono', monospace", color: "var(--danger)" }}>User not found.</div>;

  const handles = [
    { platform: "CODEFORCES", handle: profile.codeforcesHandle },
    { platform: "LEETCODE", handle: profile.leetcodeHandle },
    { platform: "CODECHEF", handle: profile.codechefHandle },
  ].filter(h => h.handle);

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px" }}>
      {/* Profile header */}
      <div style={{ borderBottom: "1px solid var(--border)", paddingBottom: 40, marginBottom: 40 }}>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 16 }}>PROFILE</p>
        <h1 style={{ fontFamily: "'DM Mono', monospace", fontSize: 36, fontWeight: 500, color: "var(--text)", marginBottom: 6 }}>
          {profile.name || profile.username}
        </h1>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 15, color: "var(--text-muted)", marginBottom: 24 }}>@{profile.username}</p>

        {/* CP handles */}
        {handles.length > 0 && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {handles.map(h => (
              <span key={h.platform} style={{
                fontFamily: "'DM Mono', monospace", fontSize: 12,
                border: `1px solid ${PLATFORM_COLOR[h.platform]}40`,
                color: PLATFORM_COLOR[h.platform],
                padding: "4px 12px",
              }}>
                {h.platform.toLowerCase()} · {h.handle}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Blogs by this user */}
      <div>
        <h2 style={{ fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 500, color: "var(--text)", marginBottom: 24 }}>
          {blogs.length} blog{blogs.length !== 1 ? "s" : ""}
        </h2>

        {blogs.length === 0 ? (
          <p style={{ fontFamily: "'DM Mono', monospace", color: "var(--text-muted)", fontSize: 14 }}>No blogs yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {blogs.map(b => (
              <div key={b.id} style={{
                borderBottom: "1px solid var(--border)", padding: "20px 0",
                display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24
              }}>
                <div style={{ flex: 1 }}>
                  <Link href={`/blogs/${b.id}`} style={{
                    fontFamily: "'DM Mono', monospace", fontSize: 17, fontWeight: 500,
                    color: "var(--text)", textDecoration: "none", display: "block", marginBottom: 6
                  }}>{b.title}</Link>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--text-muted)" }}>
                    {new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
                <span style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 13,
                  color: b.upvoteCount > 0 ? "var(--accent)" : "var(--text-muted)",
                  flexShrink: 0
                }}>▲ {b.upvoteCount}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
