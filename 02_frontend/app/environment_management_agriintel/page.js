"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_HOST || "http://localhost:3001";

const sidebarItems = [
  { href: "/dashboard_agriintel", label: "Dashboard", icon: "📊" },
  { href: "/farm_management_agriintel", label: "Farm Management", icon: "🚜" },
  { href: "/house_management_agriintel", label: "House Management", icon: "🏠" },
  { href: "/batch_management_agriintel", label: "Batch Management", icon: "🧱" },
  { href: "/employee_management_agriintel", label: "Employee Management", icon: "👨‍🌾" },
  { href: "/production_management_agriintel", label: "Production Management", icon: "🥚" },
  { href: "/feeding_management_agriintel", label: "Feeding Management", icon: "🌾" },
  { href: "/environment_management_agriintel", label: "Environment Management", icon: "🌡️" },
  { href: "/incident_management_agriintel", label: "Incident Management", icon: "⚠️" },
];

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("th-TH");
}

function getLightText(light) {
  return toNumber(light) > 300 ? "ON" : "OFF";
}

function getAmmoniaText(ammonia) {
  const v = toNumber(ammonia);
  if (v >= 60) return "High";
  if (v >= 30) return "Medium";
  return "Normal";
}

export default function EnvironmentSensorPage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userText = localStorage.getItem("user");

    if (!token) {
      router.replace("/login_agriintel");
      return;
    }

    try {
      if (userText) setCurrentUser(JSON.parse(userText));
    } catch {
      localStorage.removeItem("user");
    }

    setCheckingAuth(false);
  }, [router]);

  const loadData = useCallback(async () => {
    try {
      setError("");
      const res = await fetch(`${API}/environment`, { cache: "no-store" });

      if (!res.ok) {
        throw new Error("โหลดข้อมูล environment ไม่สำเร็จ");
      }

      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (checkingAuth) return;

    loadData();
    const timer = setInterval(loadData, 5000);
    return () => clearInterval(timer);
  }, [checkingAuth, loadData]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login_agriintel");
  }

  const latest = rows[0] || null;

  const summary = useMemo(() => {
    if (!latest) {
      return {
        temperature: 0,
        humidity: 0,
        light: 0,
        ammonia: 0,
        house: "-",
        employee: "-",
        recordedAt: "-",
        lightText: "-",
        cleaningText: "-",
        ammoniaText: "-",
      };
    }

    return {
      temperature: toNumber(latest.temperature),
      humidity: toNumber(latest.humidity),
      light: toNumber(latest.light),
      ammonia: toNumber(latest.ammonia),
      house: latest.house_name || `House ID ${latest.house_id}`,
      employee: latest.employee_name || `Employee ID ${latest.employee_id}`,
      recordedAt: formatDateTime(latest.recorded_at),
      lightText: latest.light_status ? "ON" : getLightText(latest.light),
      cleaningText: latest.cleaning ? "Done" : "Not Yet",
      ammoniaText: getAmmoniaText(latest.ammonia),
    };
  }, [latest]);

  if (checkingAuth) {
    return (
      <main style={styles.loadingPage}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingTitle}>Checking login...</div>
          <div style={styles.loadingText}>กำลังตรวจสอบสิทธิ์การเข้าใช้งาน</div>
        </div>
      </main>
    );
  }

  return (
    <div style={styles.appShell}>
      <aside style={styles.sidebar}>
        <div style={styles.brandBox}>
          <div style={styles.brandIcon}>🐔</div>
          <div>
            <div style={styles.brandTitle}>AgriIntel</div>
            <div style={styles.brandSub}>Precision Poultry</div>
          </div>
        </div>

        <nav style={{ marginTop: 24 }}>
          {sidebarItems.map((item) => {
            const active = item.href === "/environment_management_agriintel";

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  ...styles.navItem,
                  ...(active ? styles.navItemActive : {}),
                }}
              >
                <span style={{ width: 24 }}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}

          <button onClick={handleLogout} style={{ ...styles.navButton, ...styles.navItem }}>
            <span style={{ width: 24 }}>🔐</span>
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      <main style={styles.main}>
        <header style={styles.topbar}>
          <div>
            <h1 style={styles.pageTitle}>Environment Management</h1>
            <p style={styles.pageSubtitle}>
              แสดงค่าจากเซ็นเซอร์ล่าสุดแบบเรียลไทม์จากระบบ IoT
            </p>
            <div style={styles.userLine}>
              Logged in as: {currentUser?.username || "User"}{" "}
              {currentUser?.role ? `(${currentUser.role})` : ""}
            </div>
          </div>

          <Link href="/dashboard_agriintel" style={styles.backBtn}>
            ← Back to Dashboard
          </Link>
        </header>

        {error ? <div style={styles.errorBox}>❌ {error}</div> : null}

        <section style={styles.kpiGrid}>
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Temperature</div>
            <div style={styles.kpiValue}>{loading ? "--" : `${summary.temperature.toFixed(1)} °C`}</div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Humidity</div>
            <div style={styles.kpiValue}>{loading ? "--" : `${summary.humidity.toFixed(1)} %`}</div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Light</div>
            <div style={styles.kpiValue}>{loading ? "--" : summary.light}</div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Ammonia</div>
            <div style={styles.kpiValue}>{loading ? "--" : summary.ammonia}</div>
          </div>
        </section>

        <section style={styles.infoGrid}>
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Latest Sensor Status</h2>

            {loading ? (
              <div style={styles.loading}>Loading latest sensor data...</div>
            ) : !latest ? (
              <div style={styles.loading}>No sensor data found.</div>
            ) : (
              <div style={styles.infoList}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Recorded At</span>
                  <span style={styles.infoValue}>{summary.recordedAt}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>House</span>
                  <span style={styles.infoValue}>{summary.house}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Employee</span>
                  <span style={styles.infoValue}>{summary.employee}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Light Status</span>
                  <span style={styles.infoValue}>{summary.lightText}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Cleaning</span>
                  <span style={styles.infoValue}>{summary.cleaningText}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Ammonia Level</span>
                  <span style={styles.infoValue}>{summary.ammoniaText}</span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Detail</span>
                  <span style={styles.infoValue}>{latest.detail || "-"}</span>
                </div>
              </div>
            )}
          </div>

          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Live Sensor Overview</h2>

            {loading ? (
              <div style={styles.loading}>Loading...</div>
            ) : !latest ? (
              <div style={styles.loading}>No sensor data found.</div>
            ) : (
              <div style={styles.sensorBlocks}>
                <div style={styles.sensorBlock}>
                  <div style={styles.sensorTitle}>🌡 Temperature</div>
                  <div style={styles.sensorBig}>{summary.temperature.toFixed(1)} °C</div>
                </div>

                <div style={styles.sensorBlock}>
                  <div style={styles.sensorTitle}>💧 Humidity</div>
                  <div style={styles.sensorBig}>{summary.humidity.toFixed(1)} %</div>
                </div>

                <div style={styles.sensorBlock}>
                  <div style={styles.sensorTitle}>💡 Light</div>
                  <div style={styles.sensorBig}>{summary.light}</div>
                </div>

                <div style={styles.sensorBlock}>
                  <div style={styles.sensorTitle}>🧪 Ammonia</div>
                  <div style={styles.sensorBig}>{summary.ammonia}</div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

const styles = {
  loadingPage: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#eef5f9",
    fontFamily: "Arial, Helvetica, sans-serif",
    padding: "24px",
  },
  loadingCard: {
    background: "#ffffff",
    borderRadius: 20,
    padding: 32,
    textAlign: "center",
    minWidth: 320,
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: 800,
    marginBottom: 10,
    color: "#0f172a",
  },
  loadingText: {
    color: "#64748b",
    fontSize: 15,
  },
  appShell: {
    display: "flex",
    minHeight: "100vh",
    background: "#eef5f9",
    color: "#1f2937",
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  sidebar: {
    width: 300,
    background: "#d8ecf5",
    borderRight: "1px solid #c9dce4",
    padding: "20px 14px",
    position: "sticky",
    top: 0,
    height: "100vh",
    overflowY: "auto",
  },
  brandBox: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    background: "#fee7aa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 24,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: "#000000",
    lineHeight: 1,
  },
  brandSub: {
    marginTop: 4,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: "uppercase",
    color: "#6b7280",
    fontWeight: 700,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "13px 14px",
    borderRadius: 12,
    color: "#334155",
    textDecoration: "none",
    marginBottom: 8,
    fontWeight: 600,
    fontSize: 15,
  },
  navItemActive: {
    background: "#f8df95",
    color: "#000000",
  },
  navButton: {
    width: "100%",
    border: "none",
    background: "transparent",
    textAlign: "left",
    cursor: "pointer",
  },
  main: {
    flex: 1,
    padding: "28px 24px",
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 22,
    flexWrap: "wrap",
  },
  pageTitle: {
    margin: 0,
    fontSize: 40,
    fontWeight: 800,
    color: "#0f172a",
  },
  pageSubtitle: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: 15,
  },
  userLine: {
    marginTop: 10,
    color: "#64748b",
    fontSize: 14,
    fontWeight: 700,
  },
  backBtn: {
    textDecoration: "none",
    color: "#000000",
    fontWeight: 700,
    background: "#e5f4ea",
    padding: "10px 14px",
    borderRadius: 10,
    fontSize: 14,
  },
  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    fontWeight: 600,
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 16,
    marginBottom: 18,
  },
  kpiCard: {
    background: "#ffffff",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
  },
  kpiLabel: {
    color: "#64748b",
    fontWeight: 700,
    marginBottom: 12,
    fontSize: 13,
  },
  kpiValue: {
    fontSize: 32,
    fontWeight: 800,
    color: "#0f172a",
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 18,
  },
  card: {
    background: "#ffffff",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
  },
  sectionTitle: {
    margin: "0 0 18px 0",
    fontSize: 24,
    fontWeight: 800,
    color: "#0f172a",
  },
  loading: {
    padding: 16,
    color: "#64748b",
    fontWeight: 600,
  },
  infoList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    padding: "12px 0",
    borderBottom: "1px solid #e5e7eb",
  },
  infoLabel: {
    color: "#64748b",
    fontWeight: 700,
  },
  infoValue: {
    color: "#0f172a",
    fontWeight: 700,
    textAlign: "right",
  },
  sensorBlocks: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },
  sensorBlock: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    padding: 18,
  },
  sensorTitle: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: 700,
    marginBottom: 10,
  },
  sensorBig: {
    fontSize: 28,
    fontWeight: 800,
    color: "#0f172a",
  },
};