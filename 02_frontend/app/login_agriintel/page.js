"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3001";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Login failed");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      router.push("/dashboard_agriintel");
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.loginCard}>
        <div style={styles.leftPanel}>
          <div style={styles.brandBox}>
            <div style={styles.brandIcon}>🐔</div>
            <div>
              <div style={styles.brandTitle}>AgriIntel</div>
              <div style={styles.brandSub}>Precision Poultry</div>
            </div>
          </div>

          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>
            Sign in to access your poultry farm management dashboard
          </p>

          {error ? <div style={styles.errorBox}>❌ {error}</div> : null}

          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Username</label>
              <input
                type="text"
                placeholder="Enter username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={styles.input}
              />
            </div>

            <button
              type="submit"
              style={{
                ...styles.loginBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div style={styles.footerText}>
              Don&apos;t have an account?{" "}
              <Link href="/signup_agriintel" style={styles.link}>
                Sign up
              </Link>
            </div>
          </form>
        </div>

        <div style={styles.rightPanel}>
          <div style={styles.rightContent}>
            <h2 style={styles.rightTitle}>Farm Intelligence Hub</h2>
            <p style={styles.rightText}>
              Manage farms, houses, batches, feeding, environment, incidents,
              and production in one place.
            </p>

            <div style={styles.featureFrame}>
              <div style={styles.featureItem}>
                <span style={styles.checkIcon}>✅</span>
                <span>Farm &amp; House Tracking</span>
              </div>

              <div style={styles.featureItem}>
                <span style={styles.checkIcon}>✅</span>
                <span>Feeding &amp; Environment Logs</span>
              </div>

              <div style={styles.featureItem}>
                <span style={styles.checkIcon}>✅</span>
                <span>Production &amp; Incident Records</span>
              </div>

              <div style={styles.featureItem}>
                <span style={styles.checkIcon}>✅</span>
                <span>Role-based User Access</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #f8f9ee 0%, #d8ecf5 100%)",
    padding: "24px",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  loginCard: {
    width: "100%",
    maxWidth: "1100px",
    minHeight: "620px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    background: "#ffffff",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
  },
  leftPanel: {
    padding: "48px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    background: "#ffffff",
  },
  rightPanel: {
    background: "linear-gradient(135deg, #f8df95 0%, #fccf55 100%)",
    color: "#000000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px",
  },
  rightContent: {
    maxWidth: "430px",
    width: "100%",
  },
  brandBox: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginBottom: 28,
  },
  brandIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    background: "#fee7aa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#000000",
    fontSize: 26,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: 800,
    color: "#000000",
    lineHeight: 1,
  },
  brandSub: {
    marginTop: 6,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: "#64748b",
    fontWeight: 700,
  },
  title: {
    fontSize: 40,
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 10px",
  },
  subtitle: {
    color: "#64748b",
    fontSize: 16,
    margin: "0 0 26px",
    lineHeight: 1.6,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: 700,
    color: "#334155",
  },
  input: {
    padding: "14px 16px",
    borderRadius: 12,
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    fontSize: 15,
    outline: "none",
  },
  loginBtn: {
    marginTop: 8,
    background: "#f8df95",
    color: "#000000",
    border: "none",
    borderRadius: 12,
    padding: "14px 18px",
    fontWeight: 700,
    fontSize: 16,
  },
  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: 14,
    borderRadius: 12,
    marginBottom: 18,
    fontWeight: 600,
  },
  footerText: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 14,
  },
  link: {
    color: "#000000",
    fontWeight: 700,
    textDecoration: "none",
  },
  rightTitle: {
    fontSize: 34,
    fontWeight: 800,
    margin: "0 0 14px",
  },
  rightText: {
    fontSize: 16,
    lineHeight: 1.7,
    opacity: 0.95,
    marginBottom: 28,
  },
  featureFrame: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    background: "rgba(255,255,255,0.16)",
    border: "1px solid rgba(255,255,255,0.38)",
    borderRadius: 24,
    padding: 22,
    boxShadow: "0 18px 40px rgba(0,0,0,0.14)",
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "rgba(255,255,255,0.18)",
    padding: "15px 16px",
    borderRadius: 14,
    fontWeight: 800,
    color: "#000000",
  },
  checkIcon: {
    fontSize: 18,
    lineHeight: 1,
  },
};