"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signup } from "@/lib/api";

const FIELDS = [
  { label: "Full Name", key: "name", type: "text", required: true },
  { label: "Username", key: "username", type: "text", required: true },
  { label: "Email", key: "email", type: "email", required: true },
  { label: "Password", key: "password", type: "password", required: true },
  { label: "Codeforces Handle", key: "codeforcesHandle", type: "text", required: false },
  { label: "LeetCode Handle", key: "leetcodeHandle", type: "text", required: false },
  { label: "CodeChef Handle", key: "codechefHandle", type: "text", required: false },
];

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState<Record<string, string>>({
    name: "", username: "", email: "", password: "",
    codeforcesHandle: "", leetcodeHandle: "", codechefHandle: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await signup(form as any);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("email", res.data.email);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Signup failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        <h1 style={{ fontFamily: "'DM Mono', monospace", fontSize: 24, fontWeight: 500, marginBottom: 8, color: "var(--text)" }}>Create account</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 40 }}>
          CP handles are optional — you can add them later from your dashboard.
        </p>

        <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Divider before optional handles */}
          {FIELDS.map((f, i) => (
            <div key={f.key}>
              {i === 4 && (
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginBottom: 2 }}>
                  <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em" }}>
                    CP HANDLES — OPTIONAL
                  </span>
                </div>
              )}
              <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>
                {f.label}
              </label>
              <input
                type={f.type}
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                required={f.required}
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "var(--bg-2)", border: "1px solid var(--border)",
                  color: "var(--text)", fontFamily: "'DM Mono', monospace", fontSize: 14,
                  outline: "none"
                }}
              />
            </div>
          ))}

          {error && <p style={{ color: "var(--danger)", fontSize: 13, fontFamily: "'DM Mono', monospace" }}>{error}</p>}

          <button type="submit" disabled={loading} style={{
            marginTop: 8, padding: "11px",
            background: "var(--accent)", color: "#0e0e0e",
            fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 500,
            border: "none", cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1
          }}>
            {loading ? "creating account..." : "Create account"}
          </button>
        </form>

        <p style={{ marginTop: 24, fontSize: 13, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--accent)", textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
