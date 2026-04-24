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

export default function HousePage() {
  const [houses, setHouses] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    farm_id: "",
  });

  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      const [houseRes, farmRes] = await Promise.all([
        fetch(`${API}/house`, { cache: "no-store" }),
        fetch(`${API}/farm`, { cache: "no-store" }),
      ]);

      if (!houseRes.ok) throw new Error("โหลดข้อมูลโรงเรือนไม่สำเร็จ");
      if (!farmRes.ok) throw new Error("โหลดข้อมูลฟาร์มไม่สำเร็จ");

      const houseData = await houseRes.json();
      const farmData = await farmRes.json();

      setHouses(Array.isArray(houseData) ? houseData : []);
      setFarms(Array.isArray(farmData) ? farmData : []);

      if (Array.isArray(farmData) && farmData.length > 0 && !form.farm_id) {
        setForm((prev) => ({ ...prev, farm_id: String(farmData[0].id) }));
      }
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function addHouse() {
    try {
      setError("");
      setMessage("");

      const res = await fetch(`${API}/house`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          farm_id: Number(form.farm_id),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "เพิ่มข้อมูล house ไม่สำเร็จ");
      }

      setMessage("เพิ่ม House สำเร็จ");
      setForm((prev) => ({
        ...prev,
        name: "",
      }));

      await loadAll();
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    }
  }

  async function deleteHouse(id) {
    const ok = window.confirm("ต้องการลบ house นี้ใช่ไหม?");
    if (!ok) return;

    try {
      setError("");
      setMessage("");

      const res = await fetch(`${API}/house/${id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "ลบข้อมูล house ไม่สำเร็จ");
      }

      setMessage("ลบ House สำเร็จ");
      await loadAll();
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    }
  }

  const stats = useMemo(() => {
    return {
      total: houses.length,
      farms: new Set(houses.map((h) => h.farm_id)).size,
      named: houses.filter((h) => h.name && String(h.name).trim() !== "").length,
    };
  }, [houses]);

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
            const active = item.href === "/house_management_agriintel";
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
            <h1 style={styles.pageTitle}>House Management</h1>
            <p style={styles.pageSubtitle}>
              Chicken house management dashboard
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
            <div style={styles.kpiLabel}>Total Houses</div>
            <div style={styles.kpiValue}>{stats.total}</div>
          </div>
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Linked Farms</div>
            <div style={styles.kpiValue}>{stats.farms}</div>
          </div>
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Named Houses</div>
            <div style={styles.kpiValue}>{stats.named}</div>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Add House</h2>

          <div style={styles.formGrid}>
            <input
              type="text"
              placeholder="House Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={styles.input}
            />

            <select
              value={form.farm_id}
              onChange={(e) => setForm({ ...form, farm_id: e.target.value })}
              style={styles.input}
            >
              {farms.length === 0 ? (
                <option value="">No farm found</option>
              ) : (
                farms.map((farm) => (
                  <option key={farm.id} value={farm.id}>
                    {farm.name} (ID: {farm.id})
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            onClick={addHouse}
            style={styles.primaryBtn}
            disabled={!form.name || !form.farm_id}
          >
            + Add House
          </button>
        </section>

        <section style={styles.card}>
          <div style={styles.tableHeader}>
            <h2 style={styles.sectionTitle}>House Records</h2>
            <span style={styles.badge}>{houses.length} records</span>
          </div>

          {loading ? (
            <div style={styles.loading}>Loading...</div>
          ) : houses.length === 0 ? (
            <div style={styles.loading}>No house data found.</div>
          ) : (
            <div style={styles.houseGrid}>
              {houses.map((house, index) => (
                <div key={house.id} style={styles.houseCard}>
                  <div
                    style={{
                      ...styles.houseAccent,
                      background: index % 2 === 0 ? "#0f5c2e" : "#b8860b",
                    }}
                  />

                  <div style={styles.houseCardTop}>
                    <div>
                      <div style={styles.houseSmallLabel}>HOUSE ID</div>
                      <div style={styles.houseName}>{house.name}</div>
                    </div>

                    <div style={styles.cardActions}>
                      <button
                        onClick={() => deleteHouse(house.id)}
                        style={styles.deleteAction}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div style={styles.capacityBox}>
                    <span>🏠 Farm</span>
                    <strong>{house.farm_name || `Farm ID ${house.farm_id}`}</strong>
                  </div>

                  <div style={styles.batchRow}>
                    <span style={styles.batchDot}></span>
                    <span style={styles.batchText}>
                      Linked Farm ID: {house.farm_id}
                    </span>
                  </div>

                  <div style={styles.progressTrack}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${70 + (index % 3) * 8}%`,
                      }}
                    />
                  </div>

                  <div style={styles.houseFooter}>
                    <span style={styles.footerMuted}>House ID: {house.id}</span>
                    <span style={styles.viewLink}>View Analytics →</span>
                  </div>
                </div>
              ))}
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
    color: "#000000",
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
  sectionTitle: {
    margin: "0 0 18px",
    fontSize: 24,
    fontWeight: 800,
    color: "#0f172a",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
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
  houseGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 18,
  },
  houseCard: {
    position: "relative",
    background: "#fdfdfd",
    borderRadius: 22,
    padding: 22,
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  houseAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 8,
    height: "100%",
  },
  houseCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 18,
  },
  houseSmallLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#94a3b8",
    marginBottom: 8,
    letterSpacing: 0.8,
  },
  houseName: {
    fontSize: 22,
    fontWeight: 800,
    color: "#0f172a",
  },
  cardActions: {
    display: "flex",
    gap: 8,
  },
  deleteAction: {
    border: "none",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 10,
    padding: "8px 10px",
    cursor: "pointer",
  },
  capacityBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#eef5f9",
    borderRadius: 14,
    padding: "14px 16px",
    marginBottom: 16,
    color: "#334155",
  },
  batchRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  batchDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#f59e0b",
    display: "inline-block",
  },
  batchText: {
    color: "#166534",
    fontWeight: 700,
    fontSize: 14,
  },
  progressTrack: {
    width: "100%",
    height: 12,
    background: "#dbeafe",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 18,
  },
  progressFill: {
    height: "100%",
    background: "#0f5c2e",
    borderRadius: 999,
  },
  houseFooter: {
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
};