"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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

export default function FarmManagementPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    location: "",
    phone: "",
  });

  async function loadFarm() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${API}/farm`, { cache: "no-store" });
      if (!res.ok) throw new Error("โหลดข้อมูลฟาร์มไม่สำเร็จ");

      const data = await res.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadFarm();
  }, []);

  async function addFarm() {
    try {
      setError("");
      setMessage("");

      const res = await fetch(`${API}/farm`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "เพิ่มข้อมูลฟาร์มไม่สำเร็จ");
      }

      setMessage("เพิ่มข้อมูลฟาร์มสำเร็จ");
      setForm({
        name: "",
        location: "",
        phone: "",
      });

      await loadFarm();
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    }
  }

  async function deleteFarm(id) {
    const ok = window.confirm("ต้องการลบฟาร์มนี้ใช่ไหม?");
    if (!ok) return;

    try {
      setError("");
      setMessage("");

      const res = await fetch(`${API}/farm/${id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "ลบข้อมูลฟาร์มไม่สำเร็จ");
      }

      setMessage("ลบข้อมูลฟาร์มสำเร็จ");
      await loadFarm();
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    }
  }

  const summary = useMemo(() => {
    return {
      total: rows.length,
      withPhone: rows.filter((x) => x.phone && String(x.phone).trim() !== "").length,
      withLocation: rows.filter((x) => x.location && String(x.location).trim() !== "").length,
    };
  }, [rows]);

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
            const active = item.href === "/farm_management_agriintel";
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
            <h1 style={styles.pageTitle}>Farm Management</h1>
            <p style={styles.pageSubtitle}>
              Manage farm information and operational locations
            </p>
          </div>

          <Link href="/dashboard_agriintel" style={styles.backBtn}>
            ← Back to Dashboard
          </Link>
        </header>

        {error ? <div style={styles.errorBox}>❌ {error}</div> : null}
        {message ? <div style={styles.successBox}>✅ {message}</div> : null}

        <section style={styles.kpiGrid}>
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Total Farms</div>
            <div style={styles.kpiValue}>{summary.total}</div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>With Phone</div>
            <div style={styles.kpiValue}>{summary.withPhone}</div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>With Location</div>
            <div style={styles.kpiValue}>{summary.withLocation}</div>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Add New Farm</h2>

          <div style={styles.formGrid}>
            <input
              type="text"
              placeholder="Farm Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              style={styles.input}
            />
          </div>

          <button onClick={addFarm} style={styles.primaryBtn}>
            + Add Farm
          </button>
        </section>

        <section style={styles.card}>
          <div style={styles.tableHeader}>
            <h2 style={styles.sectionTitle}>Farm Records</h2>
            <span style={styles.badge}>{rows.length} records</span>
          </div>

          {loading ? (
            <div style={styles.loading}>Loading...</div>
          ) : rows.length === 0 ? (
            <div style={styles.loading}>No farm data found.</div>
          ) : (
            <div style={styles.farmGrid}>
              {rows.map((farm, index) => (
                <div key={farm.id} style={styles.farmCard}>
                  <div
                    style={{
                      ...styles.farmAccent,
                      background: index % 2 === 0 ? "#0f5c2e" : "#b8860b",
                    }}
                  />

                  <div style={styles.farmCardTop}>
                    <div>
                      <div style={styles.smallLabel}>FARM ID</div>
                      <div style={styles.farmName}>{farm.name}</div>
                    </div>

                    <div style={styles.cardActions}>
                      <div style={styles.farmIcon}>🚜</div>
                      <button
                        onClick={() => deleteFarm(farm.id)}
                        style={styles.deleteAction}
                        title="Delete Farm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>📍 Location</span>
                    <span style={styles.infoValue}>{farm.location || "-"}</span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>📞 Phone</span>
                    <span style={styles.infoValue}>{farm.phone || "-"}</span>
                  </div>

                  <div style={styles.progressTrack}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${70 + (index % 3) * 8}%`,
                      }}
                    />
                  </div>

                  <div style={styles.farmFooter}>
                    <span style={styles.footerMuted}>Farm ID: {farm.id}</span>
                    <span style={styles.viewLink}>View Details →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h2 style={styles.sectionTitle}>Farm Table</h2>
          </div>

          {loading ? (
            <div style={styles.loading}>Loading...</div>
          ) : rows.length === 0 ? (
            <div style={styles.loading}>No farm data found.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Farm Name</th>
                    <th style={styles.th}>Location</th>
                    <th style={styles.th}>Phone</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((farm) => (
                    <tr key={farm.id}>
                      <td style={styles.td}>{farm.id}</td>
                      <td style={styles.td}>{farm.name}</td>
                      <td style={styles.td}>{farm.location || "-"}</td>
                      <td style={styles.td}>{farm.phone || "-"}</td>
                      <td style={styles.td}>
                        <button
                          onClick={() => deleteFarm(farm.id)}
                          style={styles.tableDeleteBtn}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const styles = {
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
  main: {
    flex: 1,
    padding: "28px 30px",
  },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    marginBottom: 24,
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
  backBtn: {
    textDecoration: "none",
    color: "#000000",
    fontWeight: 700,
    background: "#e5f4ea",
    padding: "10px 14px",
    borderRadius: 10,
  },
  errorBox: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    fontWeight: 600,
  },
  successBox: {
    background: "#dcfce7",
    color: "#166534",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    fontWeight: 600,
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 18,
    marginBottom: 22,
  },
  kpiCard: {
    background: "#ffffff",
    borderRadius: 18,
    padding: 22,
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
  },
  kpiLabel: {
    color: "#64748b",
    fontWeight: 700,
    marginBottom: 10,
  },
  kpiValue: {
    fontSize: 32,
    fontWeight: 800,
    color: "#0f172a",
  },
  card: {
    background: "#ffffff",
    borderRadius: 18,
    padding: 22,
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    marginBottom: 22,
  },
  tableCard: {
    background: "#ffffff",
    borderRadius: 18,
    padding: 22,
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    marginBottom: 22,
  },
  sectionTitle: {
    margin: "0 0 18px",
    fontSize: 24,
    fontWeight: 800,
    color: "#0f172a",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
    marginBottom: 16,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "#f8fafc",
    fontSize: 15,
  },
  primaryBtn: {
    background: "#000000",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "12px 18px",
    fontWeight: 700,
    cursor: "pointer",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  badge: {
    background: "#e2e8f0",
    color: "#334155",
    borderRadius: 999,
    padding: "6px 12px",
    fontSize: 13,
    fontWeight: 700,
  },
  loading: {
    padding: 20,
    color: "#64748b",
    fontWeight: 600,
  },
  farmGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 18,
  },
  farmCard: {
    position: "relative",
    background: "#fdfdfd",
    borderRadius: 22,
    padding: 22,
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  farmAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 8,
    height: "100%",
  },
  farmCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 18,
  },
  cardActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  smallLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#94a3b8",
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  farmName: {
    fontSize: 22,
    fontWeight: 800,
    color: "#0f172a",
  },
  farmIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    background: "#eef5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
  },
  deleteAction: {
    border: "none",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 10,
    padding: "8px 10px",
    cursor: "pointer",
    fontWeight: 700,
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  infoLabel: {
    color: "#64748b",
    fontWeight: 600,
  },
  infoValue: {
    color: "#0f172a",
    fontWeight: 700,
    textAlign: "right",
  },
  progressTrack: {
    width: "100%",
    height: 12,
    background: "#dbeafe",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 18,
    marginTop: 10,
  },
  progressFill: {
    height: "100%",
    background: "#0f5c2e",
    borderRadius: 999,
  },
  farmFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  footerMuted: {
    fontSize: 13,
    color: "#94a3b8",
    fontWeight: 600,
  },
  viewLink: {
    fontSize: 14,
    color: "#166534",
    fontWeight: 700,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px 10px",
    borderBottom: "1px solid #e5e7eb",
    color: "#64748b",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  td: {
    padding: "14px 10px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 15,
  },
  tableDeleteBtn: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "none",
    borderRadius: 10,
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: 700,
  },
};