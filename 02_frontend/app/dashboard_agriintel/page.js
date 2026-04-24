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
  { href: "/login_agriintel", label: "Logout", icon: "🔐" },
];

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function normalizeDate(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

function getTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

function getWeekDates() {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sun
  const mondayDiff = currentDay === 0 ? -6 : 1 - currentDay;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayDiff);
  monday.setHours(0, 0, 0, 0);

  const labels = ["M", "T", "W", "T", "F", "S", "S"];

  return labels.map((label, index) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + index);
    return {
      label,
      date: d.toISOString().slice(0, 10),
    };
  });
}

function buildWeeklyProduction(productions) {
  const weekDates = getWeekDates();

  return weekDates.map((item) => {
    const total = productions
      .filter((p) => normalizeDate(p.date || p.production_date) === item.date)
      .reduce((sum, p) => sum + safeNumber(p.good || p.egg_qty), 0);

    return {
      ...item,
      total,
    };
  });
}

export default function DashboardPage() {
  const router = useRouter();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [farms, setFarms] = useState([]);
  const [houses, setHouses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [productions, setProductions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [todayText, setTodayText] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userText = localStorage.getItem("user");

    if (!token) {
      router.replace("/login_agriintel");
      return;
    }

    try {
      if (userText) {
        setCurrentUser(JSON.parse(userText));
      }
    } catch {
      localStorage.removeItem("user");
    }

    const now = new Date();
    setTodayText(
      now.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    );

    setCheckingAuth(false);
  }, [router]);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [farmRes, houseRes, batchRes, productionRes] = await Promise.all([
        fetch(`${API}/farm`, { cache: "no-store" }),
        fetch(`${API}/house`, { cache: "no-store" }),
        fetch(`${API}/batch`, { cache: "no-store" }),
        fetch(`${API}/production`, { cache: "no-store" }),
      ]);

      if (!farmRes.ok) throw new Error("โหลดข้อมูลฟาร์มไม่สำเร็จ");
      if (!houseRes.ok) throw new Error("โหลดข้อมูลโรงเรือนไม่สำเร็จ");
      if (!batchRes.ok) throw new Error("โหลดข้อมูล batch ไม่สำเร็จ");
      if (!productionRes.ok) throw new Error("โหลดข้อมูล production ไม่สำเร็จ");

      const farmData = await farmRes.json();
      const houseData = await houseRes.json();
      const batchData = await batchRes.json();
      const productionData = await productionRes.json();

      setFarms(safeArray(farmData));
      setHouses(safeArray(houseData));
      setBatches(safeArray(batchData));
      setProductions(safeArray(productionData));
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!checkingAuth) {
      loadDashboard();
    }
  }, [checkingAuth, loadDashboard]);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.replace("/login_agriintel");
  }

  const weeklyProduction = useMemo(() => {
    return buildWeeklyProduction(productions);
  }, [productions]);

  const houseStatus = useMemo(() => {
    return houses.map((house) => {
      const relatedBatches = batches.filter(
        (b) => Number(b.house_id) === Number(house.id)
      );

      const activeBatches = relatedBatches.filter(
        (b) => String(b.status || "").toLowerCase() === "active"
      );

      const usedBatches = activeBatches.length > 0 ? activeBatches : relatedBatches;

      let percent = 0;
      if (usedBatches.length > 0) {
        const totalRatio = usedBatches.reduce((sum, batch) => {
          const initialQty = safeNumber(batch.initial_qty);
          const currentQty = safeNumber(batch.current_qty);

          if (initialQty <= 0) return sum;
          return sum + Math.min(100, Math.round((currentQty / initialQty) * 100));
        }, 0);

        percent = Math.round(totalRatio / usedBatches.length);
      }

      return {
        id: house.id,
        name: house.name || house.house_name || `House ${house.id}`,
        sub:
          activeBatches.length > 0
            ? `${activeBatches.length} active batch${activeBatches.length > 1 ? "es" : ""}`
            : relatedBatches.length > 0
            ? `${relatedBatches.length} total batch${relatedBatches.length > 1 ? "es" : ""}`
            : "No batch assigned",
        percent,
        activeBatches: activeBatches.length,
      };
    });
  }, [houses, batches]);

  const stats = useMemo(() => {
    const today = getTodayIso();

    const todaysEggs = productions
      .filter((p) => normalizeDate(p.date || p.production_date) === today)
      .reduce((sum, p) => sum + safeNumber(p.good || p.egg_qty), 0);

    const activeHouses =
      houseStatus.filter((h) => h.activeBatches > 0).length || houses.length;

    return {
      totalFarms: farms.length,
      activeHouses,
      totalBatches: batches.length,
      todaysEggs,
    };
  }, [farms, houses, batches, productions, houseStatus]);

  const alerts = useMemo(() => {
    const items = [];

    const inactiveBatches = batches.filter(
      (b) => String(b.status || "").toLowerCase() !== "active"
    ).length;

    const today = getTodayIso();
    const todayProductionRecords = productions.filter(
      (p) => normalizeDate(p.date || p.production_date) === today
    ).length;

    const weakHouses = houseStatus.filter((h) => h.percent > 0 && h.percent < 60);

    if (stats.todaysEggs === 0) {
      items.push({
        id: "eggs",
        color: "#e11d48",
        title: "No Egg Record Today",
        detail: "No production log found for today",
      });
    }

    if (inactiveBatches > 0) {
      items.push({
        id: "batch",
        color: "#f59e0b",
        title: `${inactiveBatches} Inactive Batch`,
        detail: "Some batch records are not active",
      });
    }

    if (todayProductionRecords > 0 && todayProductionRecords < stats.totalBatches) {
      items.push({
        id: "prod",
        color: "#0ea5e9",
        title: "Missing Production Logs",
        detail: "Some batches may not have daily production data",
      });
    }

    if (weakHouses.length > 0) {
      items.push({
        id: "house",
        color: "#f97316",
        title: "Low House Status",
        detail: `${weakHouses[0].name} is below 60% estimated status`,
      });
    }

    if (items.length === 0) {
      items.push({
        id: "normal",
        color: "#16a34a",
        title: "System Normal",
        detail: "No critical alerts right now",
      });
    }

    return items.slice(0, 3);
  }, [batches, productions, houseStatus, stats]);

  const maxWeekly = useMemo(() => {
    return Math.max(...weeklyProduction.map((x) => x.total), 1);
  }, [weeklyProduction]);

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
            const isLogout = item.label === "Logout";
            const active = item.href === "/dashboard_agriintel";

            if (isLogout) {
              return (
                <button
                  key={item.href}
                  onClick={handleLogout}
                  style={{
                    ...styles.navButton,
                    ...styles.navItem,
                  }}
                >
                  <span style={{ width: 24 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            }

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
        </nav>
      </aside>

      <main style={styles.main}>
        <header style={styles.topbar}>
          <div>
            <h1 style={styles.pageTitle}>Dashboard</h1>
            <p style={styles.pageSubtitle}>
              Welcome back, here is your farm performance overview.
            </p>
            <div style={styles.userLine}>
              Logged in as: {currentUser?.username || "User"}{" "}
              {currentUser?.role ? `(${currentUser.role})` : ""}
            </div>
          </div>

          <div style={styles.todayBtn}>🗓️ Today {todayText ? `• ${todayText}` : ""}</div>
        </header>

        {error ? <div style={styles.errorBox}>❌ {error}</div> : null}

        <section style={styles.kpiGrid}>
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>TOTAL FARMS</div>
            <div style={{ ...styles.kpiValue, color: "#000000" }}>
              {loading ? "--" : String(stats.totalFarms).padStart(2)}
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>ACTIVE HOUSES</div>
            <div style={{ ...styles.kpiValue, color: "#0b6aa8" }}>
              {loading ? "--" : stats.activeHouses}
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>TOTAL BATCHES</div>
            <div style={{ ...styles.kpiValue, color: "#b45309" }}>
              {loading ? "--" : stats.totalBatches}
            </div>
          </div>

          <div style={styles.kpiCard}>
            <div style={{ ...styles.kpiLabel, textTransform: "uppercase" }}>
              TODAY EGGS
            </div>
            <div style={{ ...styles.kpiValue, color: "#be123c" }}>
              {loading ? "--" : stats.todaysEggs.toLocaleString()}
            </div>
          </div>
        </section>

        <section style={styles.dashboardGrid}>
          <div style={styles.leftColumn}>
            <section style={styles.card}>
              <div style={styles.cardHeader}>
                <h2 style={styles.sectionTitle}>Weekly Production</h2>
                <span style={styles.liveBadge}>Live Update</span>
              </div>

              {loading ? (
                <div style={styles.loading}>Loading chart...</div>
              ) : (
                <div style={styles.chartArea}>
                  {weeklyProduction.map((item, index) => {
                    const isLast = index === weeklyProduction.length - 1;
                    const barHeight = 14 + Math.round((item.total / maxWeekly) * 96);

                    return (
                      <div key={`${item.day}-${index}`} style={styles.chartItem}>
                        <div style={styles.barTrack}>
                          <div
                            style={{
                              ...styles.barFill,
                              height: `${barHeight}px`,
                              background: isLast ? "#fccf55" : "#cbd5e1",
                            }}
                          />
                        </div>
                        <div style={styles.chartLabel}>{item.day}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section style={styles.card}>
              <h2 style={styles.sectionTitle}>Active Houses Status</h2>

              {loading ? (
                <div style={styles.loading}>Loading houses...</div>
              ) : houseStatus.length === 0 ? (
                <div style={styles.loading}>No house data found.</div>
              ) : (
                <div style={styles.houseList}>
                  {houseStatus.map((house) => (
                    <div key={house.id} style={styles.houseRow}>
                      <div style={styles.houseInfo}>
                        <div style={styles.houseName}>{house.name}</div>
                        <div style={styles.houseSub}>{house.sub}</div>
                      </div>

                      <div style={styles.houseProgressWrap}>
                        <div style={styles.houseProgressTrack}>
                          <div
                            style={{
                              ...styles.houseProgressFill,
                              width: `${house.percent}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div style={styles.detailLink}>{house.percent}%</div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div style={styles.rightColumn}>
            <section style={styles.sideCard}>
              <h2 style={styles.sideTitle}>System Alerts</h2>

              <div style={styles.alertList}>
                {alerts.map((alert, index) => (
                  <div
                    key={alert.id}
                    style={{
                      ...styles.alertItem,
                      borderBottom:
                        index !== alerts.length - 1 ? "1px solid #e5e7eb" : "none",
                    }}
                  >
                    <div style={styles.alertTop}>
                      <span
                        style={{
                          ...styles.alertDot,
                          background: alert.color,
                        }}
                      />
                      <span style={styles.alertTitle}>{alert.title}</span>
                    </div>
                    <div style={styles.alertDetail}>{alert.detail}</div>
                  </div>
                ))}
              </div>
            </section>

            <section style={styles.quickCard}>
              <h2 style={styles.quickTitle}>Quick Reports</h2>
              <p style={styles.quickText}>
                Generate daily egg production reports instantly.
              </p>

              <button
                type="button"
                style={styles.quickBtn}
                onClick={() => window.alert("Download PDF feature coming soon")}
              >
                Download PDF
              </button>
            </section>
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
    color: "#000000 ",
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
  todayBtn: {
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
    textTransform: "uppercase",
  },
  kpiValue: {
    fontSize: 32,
    fontWeight: 800,
    color: "#0f172a",
  },
  dashboardGrid: {
    display: "grid",
    gridTemplateColumns: "1.4fr 0.35fr",
    gap: 18,
    alignItems: "start",
  },
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  card: {
    background: "#ffffff",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
  },
  sideCard: {
    background: "#ffffff",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    margin: 0,
    fontSize: 22,
    fontWeight: 800,
    color: "#0f172a",
  },
  liveBadge: {
    background: "#e2e8f0",
    color: "#334155",
    borderRadius: 999,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 700,
  },
  loading: {
    padding: 20,
    color: "#64748b",
    fontWeight: 600,
  },
  chartArea: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 18,
    alignItems: "end",
    height: 150,
    paddingTop: 12,
  },
  chartItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    height: "100%",
  },
  barTrack: {
    width: "100%",
    maxWidth: 90,
    height: 110,
    background: "transparent",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  barFill: {
    width: "88%",
    borderRadius: "8px 8px 0 0",
    minHeight: 10,
  },
  chartLabel: {
    fontSize: 12,
    color: "#94a3b8",
    fontWeight: 700,
  },
  houseList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    marginTop: 16,
  },
  houseRow: {
    display: "grid",
    gridTemplateColumns: "0.55fr 1fr auto",
    alignItems: "center",
    gap: 14,
    background: "#f8fafc",
    borderRadius: 14,
    padding: "14px 12px",
  },
  houseInfo: {
    minWidth: 0,
  },
  houseName: {
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 4,
  },
  houseSub: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: 700,
  },
  houseProgressWrap: {
    width: "100%",
  },
  houseProgressTrack: {
    width: "100%",
    height: 8,
    borderRadius: 999,
    background: "#e2e8f0",
    overflow: "hidden",
  },
  houseProgressFill: {
    height: "100%",
    borderRadius: 999,
    background: "#fccf55",
  },
  detailLink: {
    color: "#000000",
    fontWeight: 700,
    fontSize: 14,
    whiteSpace: "nowrap",
  },
  sideTitle: {
    margin: "0 0 18px 0",
    fontSize: 18,
    fontWeight: 800,
    color: "#0f172a",
  },
  alertList: {
    display: "flex",
    flexDirection: "column",
  },
  alertItem: {
    padding: "14px 0",
  },
  alertTop: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
  },
  alertTitle: {
    fontWeight: 800,
    color: "#0f172a",
    fontSize: 15,
  },
  alertDetail: {
    color: "#94a3b8",
    fontWeight: 700,
    fontSize: 13,
    marginLeft: 18,
  },
  quickCard: {
    background: "#ddb64b",
    color: "#fff",
    borderRadius: 18,
    padding: 20,
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
  },
  quickTitle: {
    margin: "0 0 12px 0",
    fontSize: 18,
    fontWeight: 800,
  },
  quickText: {
    margin: "0 0 16px 0",
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    lineHeight: 1.6,
  },
  quickBtn: {
    width: "100%",
    background: "#ffffff",
    color: "#0f5c2e",
    border: "none",
    borderRadius: 12,
    padding: "12px 14px",
    fontWeight: 800,
    cursor: "pointer",
  },
};