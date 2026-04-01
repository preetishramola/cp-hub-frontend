"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getLeaderboard } from "@/lib/api";

const TABS = [
  { key: "global", label: "Global" },
  { key: "codeforces", label: "Codeforces" },
  { key: "leetcode", label: "LeetCode" },
  { key: "codechef", label: "CodeChef" },
];

export default function LeaderboardPage() {
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState("global");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard().then(r => { setData(r.data); setLoading(false); });
  }, []);

  const entries: any[] = data?.[tab] || [];

  const getScore = (e: any) => {
    if (tab === "global") return e.combinedScore;
    if (tab === "codeforces") return e.cfScore;
    if (tab === "leetcode") return e.lcScore;
    return e.ccScore;
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ marginBottom: 40, borderBottom: "1px solid var(--border)", paddingBottom: 32 }}>
        <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 8 }}>RANKINGS</p>
        <h1 style={{ fontFamily: "'DM Mono', monospace", fontSize: 32, fontWeight: 500, color: "var(--text)", margin: 0 }}>Leaderboard</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 32, borderBottom: "1px solid var(--border)" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            fontFamily: "'DM Mono', monospace", fontSize: 13,
            padding: "10px 24px", background: "none", border: "none",
            borderBottom: tab === t.key ? "2px solid var(--accent)" : "2px solid transparent",
            color: tab === t.key ? "var(--accent)" : "var(--text-muted)",
            cursor: "pointer", marginBottom: -1, transition: "color 0.15s"
          }}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <p style={{ fontFamily: "'DM Mono', monospace", color: "var(--text-muted)" }}>loading...</p>
      ) : (
        <div style={{ border: "1px solid var(--border)" }}>
          {/* Table header */}
          <div style={{
            display: "grid", gridTemplateColumns: "60px 1fr 140px 140px 140px",
            padding: "12px 24px", borderBottom: "1px solid var(--border)",
            background: "var(--bg-2)"
          }}>
            {["RANK", "USER", "RATING", "SOLVED", "SCORE"].map(h => (
              <span key={h} style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.08em" }}>{h}</span>
            ))}
          </div>

          {entries.length === 0 && (
            <div style={{ padding: "48px 24px", textAlign: "center", fontFamily: "'DM Mono', monospace", color: "var(--text-muted)" }}>
              No data yet for this platform.
            </div>
          )}

          {entries.map((e: any, i: number) => (
            <div key={e.userId} style={{
              display: "grid", gridTemplateColumns: "60px 1fr 140px 140px 140px",
              padding: "16px 24px",
              borderBottom: i < entries.length - 1 ? "1px solid var(--border)" : "none",
              background: i % 2 === 0 ? "var(--bg)" : "var(--bg-2)",
              transition: "background 0.1s"
            }}>
              <span style={{
                fontFamily: "'DM Mono', monospace", fontSize: 16, fontWeight: 500,
                color: e.rank <= 3 ? "var(--accent)" : "var(--text-muted)"
              }}>#{e.rank}</span>

              <div>
                <Link href={`/profile/${e.username}`} style={{
                  fontFamily: "'DM Mono', monospace", fontSize: 14,
                  color: "var(--text)", textDecoration: "none",
                }}>@{e.username}</Link>
                {e.name && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--text-muted)", marginLeft: 8 }}>{e.name}</span>}
              </div>

              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "var(--text)" }}>
                {tab === "codeforces" ? (e.cfRating ?? "—") :
                 tab === "leetcode"   ? (e.lcGlobalRank ? `#${e.lcGlobalRank}` : "—") :
                 tab === "codechef"   ? (e.ccRating ?? "—") :
                 "—"}
              </span>

              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "var(--text)" }}>
                {tab === "codeforces" ? (e.cfSolved ?? "—") :
                 tab === "leetcode"   ? (e.lcSolved ?? "—") :
                 tab === "codechef"   ? (e.ccSolved ?? "—") :
                 ((e.cfSolved || 0) + (e.lcSolved || 0) + (e.ccSolved || 0)) || "—"}
              </span>

              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "var(--accent)", fontWeight: 500 }}>
                {getScore(e).toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
