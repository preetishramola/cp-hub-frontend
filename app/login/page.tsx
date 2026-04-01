"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await login(form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      localStorage.setItem("email", res.data.email);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "calc(100vh - 56px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <h1 style={{ fontFamily: "'DM Mono', monospace", fontSize: 24, fontWeight: 500, marginBottom: 8, color: "var(--text)" }}>Welcome back</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 40 }}>Sign in to your cp-hub account</p>

        <form onSubmit={handle} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Email", key: "email", type: "email" },
            { label: "Password", key: "password", type: "password" },
          ].map(f => (
            <div key={f.key}>
              <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, color: "var(--text-muted)", display: "block", marginBottom: 6 }}>{f.label}</label>
              <input
                type={f.type}
                value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                required
                style={{
                  width: "100%", padding: "10px 14px",
                  background: "var(--bg-2)", border: "1px solid var(--border)",
                  color: "var(--text)", fontFamily: "'DM Mono', monospace", fontSize: 14,
                  outline: "none", transition: "border-color 0.15s"
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
            {loading ? "signing in..." : "Sign in"}
          </button>
        </form>

        <p style={{ marginTop: 24, fontSize: 13, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>
          No account?{" "}
          <Link href="/signup" style={{ color: "var(--accent)", textDecoration: "none" }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
