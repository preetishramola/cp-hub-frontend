"use client";
import "./globals.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function Navbar() {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    const initial = saved || "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const username = localStorage.getItem("username");
    if (token && username) setUser({ username });
    else setUser(null);
  }, [path]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    setUser(null);
    router.push("/");
  };

  const navLinks = [
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/blogs", label: "Blogs" },
  ];

  return (
    <nav style={{
      borderBottom: "1px solid var(--border)",
      background: "var(--bg)",
      position: "sticky", top: 0, zIndex: 50,
      transition: "background 0.2s, border-color 0.2s"
    }}>
      <div style={{
        maxWidth: 1100, margin: "0 auto",
        padding: "0 24px", height: 56,
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <Link href="/" style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 18, fontWeight: 500,
          color: "var(--text)", textDecoration: "none",
          letterSpacing: "-0.03em"
        }}>
          cp<span style={{ color: "var(--accent)" }}>hub</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} style={{
              fontFamily: "'DM Mono', monospace", fontSize: 13,
              color: path === l.href ? "var(--accent)" : "var(--text-muted)",
              textDecoration: "none", transition: "color 0.15s"
            }}>{l.label}</Link>
          ))}

          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Link href="/dashboard" style={{
                fontFamily: "'DM Mono', monospace", fontSize: 13,
                color: path === "/dashboard" ? "var(--accent)" : "var(--text-muted)",
                textDecoration: "none"
              }}>Dashboard</Link>
              <Link href={`/profile/${user.username}`} style={{
                fontFamily: "'DM Mono', monospace", fontSize: 13,
                color: "var(--text)", textDecoration: "none"
              }}>@{user.username}</Link>
              <button onClick={logout} style={{
                fontFamily: "'DM Mono', monospace", fontSize: 12,
                background: "none", border: "1px solid var(--border)",
                color: "var(--text-muted)", padding: "4px 12px",
                cursor: "pointer", transition: "all 0.15s"
              }}>logout</button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 12 }}>
              <Link href="/login" style={{
                fontFamily: "'DM Mono', monospace", fontSize: 13,
                color: "var(--text-muted)", textDecoration: "none"
              }}>login</Link>
              <Link href="/signup" style={{
                fontFamily: "'DM Mono', monospace", fontSize: 13,
                background: "var(--accent)", color: theme === "light" ? "#fff" : "#0e0e0e",
                padding: "4px 14px", textDecoration: "none", fontWeight: 500
              }}>signup</Link>
            </div>
          )}

          {/* Theme toggle */}
          <button onClick={toggleTheme} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} style={{
            background: "none", border: "1px solid var(--border)",
            color: "var(--text-muted)", width: 32, height: 32,
            cursor: "pointer", fontSize: 15,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.15s", flexShrink: 0
          }}>
            {theme === "dark" ? "☀" : "☾"}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>cphub — competitive programming hub</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Lora:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{
          __html: `(function(){var t=localStorage.getItem('theme')||'dark';document.documentElement.setAttribute('data-theme',t);})();`
        }} />
      </head>
      <body>
        <Navbar />
        <main style={{ minHeight: "calc(100vh - 56px)" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
