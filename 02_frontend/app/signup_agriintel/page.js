"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3001";

export default function SignupPage() {
  const router = useRouter();

  const [farms, setFarms] = useState([]);
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    role: "staff",
    name: "",
    phone: "",
    position: "Staff",
    farm_id: "",
  });

  useEffect(() => {
    loadFarms();
  }, []);

  async function loadFarms() {
    try {
      setLoadingFarms(true);
      setError("");

      const res = await fetch(`${API}/farm`, { cache: "no-store" });
      if (!res.ok) throw new Error("โหลดรายชื่อฟาร์มไม่สำเร็จ");

      const data = await res.json();
      setFarms(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoadingFarms(false);
    }
  }

  async function handleSignup(e) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      if (
        !form.username.trim() ||
        !form.password ||
        !form.confirmPassword ||
        !form.role ||
        !form.name.trim() ||
        !form.position.trim() ||
        !form.farm_id
      ) {
        throw new Error("กรุณากรอกข้อมูลให้ครบ");
      }

      if (form.password !== form.confirmPassword) {
        throw new Error("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      }

      const res = await fetch(`${API}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
          role: form.role,
          name: form.name.trim(),
          phone: form.phone.trim(),
          position: form.position.trim(),
          farm_id: Number(form.farm_id),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "สมัครสมาชิกไม่สำเร็จ");
      }

      setMessage("สมัครสมาชิกสำเร็จ กำลังพาไปหน้า Login...");

      setForm({
        username: "",
        password: "",
        confirmPassword: "",
        role: "staff",
        name: "",
        phone: "",
        position: "Staff",
        farm_id: "",
      });

      setTimeout(() => {
        router.push("/login_agriintel");
      }, 1200);
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.leftPanel}>
          <div style={styles.brandBox}>
            <div style={styles.brandIcon}>🐔</div>
            <div>
              <div style={styles.brandTitle}>AgriIntel</div>
              <div style={styles.brandSub}>Precision Poultry</div>
            </div>
          </div>

          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>
            Register a user account and create employee info automatically
          </p>

          {error ? <div style={styles.errorBox}>❌ {error}</div> : null}
          {message ? <div style={styles.successBox}>✅ {message}</div> : null}

          <form onSubmit={handleSignup} style={styles.form}>
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

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({ ...form, confirmPassword: e.target.value })
                }
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Name</label>
              <input
                type="text"
                placeholder="Enter full name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Phone</label>
              <input
                type="text"
                placeholder="Enter phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Position</label>
              <select
                value={form.position}
                onChange={(e) =>
                  setForm({ ...form, position: e.target.value })
                }
                style={styles.input}
              >
                <option value="Staff">Staff</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                style={styles.input}
              >
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Farm</label>
              <select
                value={form.farm_id}
                onChange={(e) => setForm({ ...form, farm_id: e.target.value })}
                style={styles.input}
                disabled={loadingFarms}
              >
                <option value="">
                  {loadingFarms ? "Loading farms..." : "Select farm"}
                </option>
                {farms.map((farm) => (
                  <option key={farm.id} value={farm.id}>
                    {farm.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              style={{
                ...styles.primaryBtn,
                opacity: submitting ? 0.7 : 1,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
              disabled={submitting}
            >
              {submitting ? "Creating account..." : "Sign Up"}
            </button>
          </form>

          <div style={styles.footerText}>
            Already have an account?{" "}
            <Link href="/login_agriintel" style={styles.link}>
              Sign in
            </Link>
          </div>
        </div>

        <div style={styles.rightPanel}>
          <div style={styles.rightContent}>
            <h2 style={styles.rightTitle}>User Registration</h2>
            <p style={styles.rightText}>
              Create user account and employee profile in one step
            </p>

            <div style={styles.featureFrame}>
              <div style={styles.featureItem}>
                <span style={styles.checkIcon}>✅</span>
                <span>No employee dropdown</span>
              </div>

              <div style={styles.featureItem}>
                <span style={styles.checkIcon}>✅</span>
                <span>Create employee automatically</span>
              </div>

              <div style={styles.featureItem}>
                <span style={styles.checkIcon}>✅</span>
                <span>Choose role and position</span>
              </div>

              <div style={styles.featureItem}>
                <span style={styles.checkIcon}>✅</span>
                <span>Ready for login immediately</span>
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
    background: "linear-gradient(135deg, #eef5f9 0%, #d8ecf5 100%)",
    padding: "24px",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "1100px",
    minHeight: "720px",
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
  primaryBtn: {
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
  successBox: {
    background: "#dcfce7",
    color: "#000000",
    padding: 14,
    borderRadius: 12,
    marginBottom: 18,
    fontWeight: 600,
  },
  footerText: {
    marginTop: 20,
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