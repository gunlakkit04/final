"use client";

import Link from "next/link";
import { useMemo } from "react";

const sidebarItems = [
  { href: "/dashboard_agriintel", label: "Dashboard", icon: "📊" },
  { href: "/farm_management_agriintel", label: "Farm Management", icon: "🚜" },
  { href: "/house_management_agriintel", label: "House Management", icon: "🏠" },
  { href: "/batch_management_agriintel", label: "Batch Management", icon: "🧱" },
  { href: "/employee_management_agriintel", label: "Employee Management", icon: "👨‍🌾" },
  { href: "/production_management_agriintel", label: "Production", icon: "🥚" },
  { href: "/login_agriintel", label: "Logout", icon: "🔐" },
];

export default function DashboardPage() {
  // ข้อมูลจำลองสำหรับหน้า Dashboard
  const kpis = [
    { title: "Total Farms", value: "04", color: "#0f5c2e" },
    { title: "Active Houses", value: "28", color: "#0369a1" },
    { title: "Total Batches", value: "12", color: "#b45309" },
    { title: "Today's Eggs", value: "12,450", color: "#be123c" },
  ];

  const recentAlerts = [
    { id: 1, title: "Low Water Level", house: "House 02", time: "10m ago", status: "Critical" },
    { id: 2, title: "Temp Spike", house: "House 05", time: "1h ago", status: "Warning" },
  ];

  return (
    <div style={styles.appShell}>
      {/* SIDEBAR - สไตล์เดียวกับที่คุณชอบ */}
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
            const active = item.href === "/dashboard_agriintel";
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

      {/* MAIN CONTENT */}
      <main style={styles.main}>
        <header style={styles.topbar}>
          <div>
            <h1 style={styles.pageTitle}>Dashboard</h1>
            <p style={styles.pageSubtitle}>
              Welcome back, here is your farm's performance overview.
            </p>
          </div>
          <div style={styles.topbarActions}>
            <button style={styles.backBtn}>📅 Today</button>
          </div>
        </header>

        {/* KPI GRID - ขนาดเท่ากับ House Management */}
        <section style={styles.kpiGrid}>
          {kpis.map((kpi) => (
            <div key={kpi.title} style={styles.kpiCard}>
              <div style={styles.kpiLabel}>{kpi.title}</div>
              <div style={{ ...styles.kpiValue, color: kpi.color }}>{kpi.value}</div>
            </div>
          ))}
        </section>

        <div style={styles.contentLayout}>
          {/* LEFT COLUMN - Production Trends */}
          <div style={styles.leftCol}>
            <section style={styles.card}>
              <div style={styles.tableHeader}>
                <h2 style={styles.sectionTitle}>Weekly Production</h2>
                <span style={styles.badge}>Live Update</span>
              </div>
              
              {/* Placeholder สำหรับ Chart - ใช้ UI สไตล์ House Card */}
              <div style={styles.chartContainer}>
                {[60, 80, 45, 90, 70, 85, 95].map((val, i) => (
                  <div key={i} style={styles.barWrapper}>
                    <div style={{ ...styles.bar, height: `${val}%`, background: i === 6 ? "#0f5c2e" : "#cbd5e1" }}></div>
                    <span style={styles.barLabel}>{['M','T','W','T','F','S','S'][i]}</span>
                  </div>
                ))}
              </div>
            </section>

            <section style={styles.card}>
              <div style={styles.tableHeader}>
                <h2 style={styles.sectionTitle}>Active Houses Status</h2>
              </div>
              <div style={styles.houseList}>
                {[1, 2].map((id) => (
                  <div key={id} style={styles.miniHouseItem}>
                    <div style={styles.miniHouseInfo}>
                      <span style={styles.houseNameText}>House {id < 10 ? `0${id}` : id}</span>
                      <span style={styles.footerMuted}>North Valley Cluster</span>
                    </div>
                    <div style={styles.miniProgressTrack}>
                      <div style={{ ...styles.progressFill, width: id === 1 ? '85%' : '60%' }}></div>
                    </div>
                    <span style={styles.viewLink}>Details →</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN - Alerts & Actions */}
          <div style={styles.rightCol}>
            <section style={styles.card}>
              <div style={styles.tableHeader}>
                <h2 style={styles.sectionTitle}>System Alerts</h2>
              </div>
              <div style={{ display: 'grid', gap: 12 }}>
                {recentAlerts.map(alert => (
                  <div key={alert.id} style={styles.alertItem}>
                    <div style={{ ...styles.batchDot, background: alert.status === 'Critical' ? '#be123c' : '#f59e0b' }}></div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{alert.title}</div>
                      <div style={styles.footerMuted}>{alert.house} • {alert.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ ...styles.card, background: '#0f5c2e', color: '#fff' }}>
              <h2 style={{ ...styles.sectionTitle, color: '#fff', fontSize: 18 }}>Quick Reports</h2>
              <p style={{ fontSize: 13, opacity: 0.8, marginBottom: 16 }}>Generate daily egg production reports instantly.</p>
              <button style={styles.whiteBtn}>Download PDF</button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  // ดึงค่ามาจากโค้ดที่คุณให้มาเพื่อให้ UI "ตรงกัน" 100%
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
  brandBox: { display: "flex", gap: 12, alignItems: "center", marginBottom: 10 },
  brandIcon: { width: 48, height: 48, borderRadius: 14, background: "#0f5c2e", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24 },
  brandTitle: { fontSize: 28, fontWeight: 800, color: "#0b3d1d", lineHeight: 1 },
  brandSub: { marginTop: 4, fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: "#6b7280", fontWeight: 700 },
  
  navItem: { display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", borderRadius: 12, color: "#334155", textDecoration: "none", marginBottom: 8, fontWeight: 600, fontSize: 15 },
  navItemActive: { background: "#0f5c2e", color: "#fff" },

  main: { flex: 1, padding: "28px 30px" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  pageTitle: { margin: 0, fontSize: 40, fontWeight: 800, color: "#0f172a" },
  pageSubtitle: { margin: "6px 0 0", color: "#64748b", fontSize: 15 },
  backBtn: { textDecoration: "none", color: "#0f5c2e", fontWeight: 700, background: "#e5f4ea", padding: "10px 14px", borderRadius: 10, border: 'none', cursor: 'pointer' },

  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18, marginBottom: 22 },
  kpiCard: { background: "#ffffff", borderRadius: 18, padding: 22, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" },
  kpiLabel: { color: "#64748b", fontWeight: 700, marginBottom: 10, fontSize: 14, textTransform: 'uppercase' },
  kpiValue: { fontSize: 32, fontWeight: 800, color: "#0f172a" },

  contentLayout: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: 22 },
  leftCol: { display: 'grid', gap: 22 },
  rightCol: { display: 'grid', gap: 22, alignContent: 'start' },

  card: { background: "#ffffff", borderRadius: 18, padding: 22, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" },
  tableHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  sectionTitle: { margin: 0, fontSize: 20, fontWeight: 800, color: "#0f172a" },
  badge: { background: "#e2e8f0", color: "#334155", borderRadius: 999, padding: "6px 12px", fontSize: 12, fontWeight: 700 },

  // สไตล์เพิ่มเติมสำหรับ Dashboard Elements
  chartContainer: { height: 180, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 10px' },
  barWrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 },
  bar: { width: '60%', borderRadius: '6px 6px 0 0', minHeight: 10 },
  barLabel: { fontSize: 12, fontWeight: 700, color: '#94a3b8' },

  houseList: { display: 'grid', gap: 12 },
  miniHouseItem: { display: 'flex', alignItems: 'center', gap: 15, padding: '12px', background: '#f8fafc', borderRadius: 12 },
  miniHouseInfo: { width: 150 },
  houseNameText: { display: 'block', fontWeight: 700, fontSize: 15 },
  miniProgressTrack: { flex: 1, height: 8, background: '#e2e8f0', borderRadius: 99 },
  progressFill: { height: '100%', background: '#0f5c2e', borderRadius: 99 },
  
  footerMuted: { fontSize: 12, color: "#94a3b8", fontWeight: 600 },
  viewLink: { fontSize: 13, color: "#166534", fontWeight: 700, textDecoration: 'none' },

  alertItem: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px', borderBottom: '1px solid #f1f5f9' },
  batchDot: { width: 8, height: 8, borderRadius: "50%" },

  whiteBtn: { background: '#fff', color: '#0f5c2e', border: 'none', padding: '10px', borderRadius: 10, fontWeight: 700, cursor: 'pointer', width: '100%' }
};