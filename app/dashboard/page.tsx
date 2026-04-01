"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyStats, refreshStats, getMyProfile, updateMyProfile } from "@/lib/api";

const PLATFORM_COLOR: Record<string, string> = {
  CODEFORCES: "#e8c547",
  LEETCODE:   "#f89f1b",
  CODECHEF:   "#5ce08a",
};

function StatCard({ stat, onRefresh }: { stat: any; onRefresh: () => void }) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try { await refreshStats(stat.platform); onRefresh(); }
    catch (e: any) { alert("Refresh failed: " + (e.response?.data?.error || e.message)); }
    finally { setRefreshing(false); }
  };

  return (
    <div style={{ border: "1px solid var(--border)", padding: "28px 32px", background: "var(--bg-2)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: PLATFORM_COLOR[stat.platform] || "var(--accent)", letterSpacing: "0.1em" }}>
          {stat.platform}
        </span>
        <button onClick={handleRefresh} disabled={refreshing} style={{
          fontFamily: "'DM Mono', monospace", fontSize: 11,
          background: "none", border: "1px solid var(--border)",
          color: "var(--text-muted)", padding: "3px 10px", cursor: "pointer"
        }}>{refreshing ? "..." : "refresh"}</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
            {stat.platform === "LEETCODE" ? "GLOBAL RANK" : "RATING"}
          </p>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 32, fontWeight: 500, color: "var(--text)", margin: 0 }}>
            {stat.rating ?? (stat.globalRank ? `#${stat.globalRank}` : "—")}
          </p>
          {stat.rank && <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{stat.rank}</p>}
        </div>
        <div>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>SOLVED</p>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 32, fontWeight: 500, color: "var(--text)", margin: 0 }}>
            {stat.problemsSolved ?? "—"}
          </p>
        </div>
      </div>

      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text-muted)", marginTop: 20, marginBottom: 0 }}>
        @{stat.handle} · {stat.lastFetched ? `updated ${new Date(stat.lastFetched).toLocaleTimeString()}` : ""}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ codeforcesHandle: "", leetcodeHandle: "", codechefHandle: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const loadDashboard = async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    try {
      const profileRes = await getMyProfile();
      const p = profileRes.data;
      setProfile(p);
      setEditForm({
        codeforcesHandle: p.codeforcesHandle || "",
        leetcodeHandle:   p.leetcodeHandle   || "",
        codechefHandle:   p.codechefHandle   || "",
      });

      // Only call stats API if at least one handle is set
      const hasHandle = p.codeforcesHandle || p.leetcodeHandle || p.codechefHandle;
      if (hasHandle) {
        try {
          const statsRes = await getMyStats();
          // Filter out any null/error entries just in case
          setStats(Array.isArray(statsRes.data) ? statsRes.data : []);
        } catch {
          // Stats failed but profile loaded fine — just show empty
          setStats([]);
        }
      } else {
        setStats([]);
      }
    } catch {
      // Profile fetch failed = bad token
      router.push("/login");
      return;
    }

    setLoading(false);
  };

  useEffect(() => { loadDashboard(); }, []);

  const saveHandles = async () => {
    setSaving(true); setSaveError("");
    try {
      await updateMyProfile(editForm);
      await loadDashboard();
      setEditing(false);
    } catch (e: any) {
      setSaveError(e.response?.data?.error || "Failed to save");
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div style={{ padding: 80, textAlign: "center", fontFamily: "'DM Mono', monospace", color: "var(--text-muted)" }}>
      loading...
    </div>
  );

  const handleCount = [profile?.codeforcesHandle, profile?.leetcodeHandle, profile?.codechefHandle].filter(Boolean).length;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48, borderBottom: "1px solid var(--border)", paddingBottom: 32 }}>
        <div>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--accent)", letterSpacing: "0.1em", marginBottom: 8 }}>DASHBOARD</p>
          <h1 style={{ fontFamily: "'DM Mono', monospace", fontSize: 32, fontWeight: 500, color: "var(--text)", margin: 0 }}>
            {profile?.name || profile?.username}
          </h1>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "var(--text-muted)", marginTop: 6 }}>
            @{profile?.username} · {handleCount} platform{handleCount !== 1 ? "s" : ""} connected
          </p>
        </div>
        <button onClick={() => { setEditing(!editing); setSaveError(""); }} style={{
          fontFamily: "'DM Mono', monospace", fontSize: 13,
          background: editing ? "var(--accent)" : "none",
          color: editing ? "#0e0e0e" : "var(--text-muted)",
          border: "1px solid var(--border)", padding: "8px 20px", cursor: "pointer"
        }}>
          {editing ? "cancel" : "edit handles"}
        </button>
      </div>

      {/* Edit handles */}
      {editing && (
        <div style={{ border: "1px solid var(--border)", padding: "28px 32px", marginBottom: 32, background: "var(--bg-2)" }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--text-muted)", marginBottom: 20, letterSpacing: "0.08em" }}>
            CP HANDLES — enter only your username, not the full URL. Leave blank to skip a platform.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {[
              { label: "Codeforces", key: "codeforcesHandle", placeholder: "e.g. tourist" },
              { label: "LeetCode",   key: "leetcodeHandle",   placeholder: "e.g. neal_wu" },
              { label: "CodeChef",   key: "codechefHandle",   placeholder: "e.g. gennady" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                  {f.label}
                </label>
                <input
                  value={(editForm as any)[f.key]}
                  onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{
                    width: "100%", padding: "8px 12px",
                    background: "var(--bg)", border: "1px solid var(--border)",
                    color: "var(--text)", fontFamily: "'DM Mono', monospace",
                    fontSize: 14, outline: "none"
                  }}
                />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 20 }}>
            <button onClick={saveHandles} disabled={saving} style={{
              padding: "9px 24px", background: "var(--accent)", color: "#0e0e0e",
              fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500,
              border: "none", cursor: saving ? "not-allowed" : "pointer",
              opacity: saving ? 0.7 : 1
            }}>{saving ? "saving..." : "Save"}</button>
            {saveError && <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--danger)" }}>{saveError}</span>}
          </div>
        </div>
      )}

      {/* Stats */}
      {stats.length > 0 ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {stats.map(s => <StatCard key={s.platform} stat={s} onRefresh={loadDashboard} />)}
        </div>
      ) : (
        <div style={{ border: "1px solid var(--border)", padding: "56px 48px", textAlign: "center", background: "var(--bg-2)" }}>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, color: "var(--text)", marginBottom: 12, fontWeight: 500 }}>
            No stats yet
          </p>
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "var(--text-muted)", marginBottom: 28 }}>
            Connect your Codeforces, LeetCode, or CodeChef handles to start tracking.
          </p>
          <button onClick={() => setEditing(true)} style={{
            padding: "10px 28px", background: "var(--accent)", color: "#0e0e0e",
            fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 500,
            border: "none", cursor: "pointer"
          }}>Add handles</button>
        </div>
      )}
    </div>
  );
}
