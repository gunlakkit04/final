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
  { href: "/production_management_agriintel", label: "Production", icon: "🥚" },
  { href: "/login_agriintel", label: "Logout", icon: "🔐" },
];

function getStatusMeta(status = "") {
  const s = String(status).toLowerCase();
  if (s.includes("active")) {
    return { label: "ACTIVE / PEAK", bg: "#dcfce7", color: "#166534", dot: "#16a34a" };
  }
  if (s.includes("inactive")) {
    return { label: "COMPLETED", bg: "#e2e8f0", color: "#475569", dot: "#94a3b8" };
  }
  if (s.includes("quarantine")) {
    return { label: "QUARANTINE", bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" };
  }
  return { label: status || "UNKNOWN", bg: "#fee2e2", color: "#991b1b", dot: "#dc2626" };
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString();
}

function getHouseCode(houseId) {
  return `H${String(houseId).padStart(2, "0")}`;
}

function calcPerformance(initialQty, currentQty) {
  const init = Number(initialQty || 0);
  const curr = Number(currentQty || 0);
  if (!init) return "Standard";
  const ratio = curr / init;
  if (ratio >= 0.95) return "High Yield";
  if (ratio >= 0.85) return "Standard";
  return "Critical";
}

function getTelemetry(status) {
  const s = String(status).toLowerCase();
  if (s.includes("active")) return { label: "Live Feed", color: "#f59e0b" };
  if (s.includes("inactive")) return { label: "Standby", color: "#cbd5e1" };
  if (s.includes("quarantine")) return { label: "Restricted", color: "#f59e0b" };
  return { label: "Attention", color: "#dc2626" };
}

export default function BatchManagementPage() {
  const [batches, setBatches] = useState([]);
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    breed: "",
    start_date: new Date().toISOString().slice(0, 10),
    end_date: "",
    status: "active",
    initial_qty: "",
    current_qty: "",
    house_id: "",
  });

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [batchRes, houseRes] = await Promise.all([
        fetch(`${API}/batch`, { cache: "no-store" }),
        fetch(`${API}/house`, { cache: "no-store" }),
      ]);

      if (!batchRes.ok) throw new Error("โหลดข้อมูล batch ไม่สำเร็จ");
      if (!houseRes.ok) throw new Error("โหลดข้อมูล house ไม่สำเร็จ");

      const batchData = await batchRes.json();
      const houseData = await houseRes.json();

      setBatches(Array.isArray(batchData) ? batchData : []);
      setHouses(Array.isArray(houseData) ? houseData : []);

      if (Array.isArray(houseData) && houseData.length > 0 && !form.house_id) {
        setForm((prev) => ({ ...prev, house_id: String(houseData[0].id) }));
      }
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function addBatch() {
    try {
      setError("");
      setMessage("");

      const res = await fetch(`${API}/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          breed: form.breed,
          start_date: form.start_date,
          end_date: form.end_date || null,
          status: form.status,
          initial_qty: Number(form.initial_qty || 0),
          current_qty: Number(form.current_qty || 0),
          house_id: Number(form.house_id),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "เพิ่มข้อมูล batch ไม่สำเร็จ");
      }

      setMessage("เพิ่ม Batch สำเร็จ");
      setForm((prev) => ({
        ...prev,
        breed: "",
        end_date: "",
        initial_qty: "",
        current_qty: "",
      }));

      await loadData();
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    }
  }

  async function deleteBatch(id) {
    const ok = window.confirm("ต้องการลบ batch นี้ใช่ไหม?");
    if (!ok) return;

    try {
      setError("");
      setMessage("");

      const res = await fetch(`${API}/batch/${id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "ลบข้อมูล batch ไม่สำเร็จ");
      }

      setMessage("ลบ Batch สำเร็จ");
      await loadData();
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    }
  }

  const stats = useMemo(() => {
    const active = batches.filter((b) =>
      String(b.status || "").toLowerCase().includes("active")
    ).length;

    const totalPopulation = batches.reduce(
      (sum, b) => sum + Number(b.current_qty || 0),
      0
    );

    return { active, totalPopulation };
  }, [batches]);

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
            const active = item.href === "/batch_management_agriintel";
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
            <h1 style={styles.pageTitle}>Batch Management</h1>
            <p style={styles.pageSubtitle}>
              Orchestrate your poultry cycles with high-precision telemetry and genetic performance tracking.
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
            <div style={styles.kpiLabel}>Total Batches</div>
            <div style={styles.kpiValue}>{batches.length}</div>
          </div>
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Active Units</div>
            <div style={styles.kpiValue}>{stats.active}</div>
          </div>
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Total Population</div>
            <div style={styles.kpiValue}>{stats.totalPopulation.toLocaleString()}</div>
          </div>
        </section>

        <section style={styles.formCard}>
          <div style={styles.tableHeader}>
            <h2 style={styles.sectionTitle}>Add New Batch</h2>
            <span style={styles.badge}>Create record</span>
          </div>

          <div style={styles.formGrid}>
            <input
              type="text"
              placeholder="Breed"
              value={form.breed}
              onChange={(e) => setForm({ ...form, breed: e.target.value })}
              style={styles.input}
            />

            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              style={styles.input}
            />

            <input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              style={styles.input}
            />

            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              style={styles.input}
            >
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="quarantine">quarantine</option>
            </select>

            <input
              type="number"
              placeholder="Initial Qty"
              value={form.initial_qty}
              onChange={(e) => setForm({ ...form, initial_qty: e.target.value })}
              style={styles.input}
            />

            <input
              type="number"
              placeholder="Current Qty"
              value={form.current_qty}
              onChange={(e) => setForm({ ...form, current_qty: e.target.value })}
              style={styles.input}
            />

            <select
              value={form.house_id}
              onChange={(e) => setForm({ ...form, house_id: e.target.value })}
              style={styles.input}
            >
              {houses.length === 0 ? (
                <option value="">No house found</option>
              ) : (
                houses.map((house) => (
                  <option key={house.id} value={house.id}>
                    {house.name} (ID: {house.id})
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            onClick={addBatch}
            style={styles.addBtn}
            disabled={!form.breed || !form.start_date || !form.status || !form.house_id}
          >
            + Add Batch
          </button>
        </section>

        <section style={styles.card}>
          <div style={styles.tableHeader}>
            <h2 style={styles.sectionTitle}>Flock Batches</h2>
            <span style={styles.badge}>{batches.length} records</span>
          </div>

          {loading ? (
            <div style={styles.loading}>Loading flock data...</div>
          ) : batches.length === 0 ? (
            <div style={styles.loading}>No batch data found.</div>
          ) : (
            <div style={styles.batchGrid}>
              {batches.map((batch) => {
                const meta = getStatusMeta(batch.status);
                const perf = calcPerformance(batch.initial_qty, batch.current_qty);
                const tele = getTelemetry(batch.status);
                const ratio =
                  Number(batch.initial_qty || 0) > 0
                    ? Math.min((Number(batch.current_qty || 0) / Number(batch.initial_qty || 1)) * 100, 100)
                    : 0;

                return (
                  <div key={batch.id} style={styles.batchCard}>
                    <div style={{ ...styles.batchAccent, background: meta.dot }} />

                    <div style={styles.batchCardTop}>
                      <div>
                        <div style={styles.smallLabel}>BATCH {batch.id}</div>
                        <div style={styles.batchTitle}>House {getHouseCode(batch.house_id)}</div>
                      </div>

                      <div style={styles.cardRight}>
                        <div style={{ ...styles.statusTag, background: meta.bg, color: meta.color }}>
                          <span style={{ ...styles.statusDot, background: meta.dot }} />
                          {meta.label}
                        </div>
                        <button
                          onClick={() => deleteBatch(batch.id)}
                          style={styles.deleteBtn}
                          title="Delete Batch"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div style={styles.statsRow}>
                      <div style={styles.statItem}>
                        <span style={styles.statLabel}>Current Population</span>
                        <span style={styles.statValue}>{Number(batch.current_qty || 0).toLocaleString()}</span>
                      </div>
                      <div style={styles.statItem}>
                        <span style={styles.statLabel}>Performance</span>
                        <span
                          style={{
                            ...styles.statValue,
                            color: perf === "Critical" ? "#dc2626" : "#0f5c2e",
                          }}
                        >
                          {perf}
                        </span>
                      </div>
                    </div>

                    <div style={styles.infoList}>
                      <div style={styles.infoLine}>
                        <span>📅 Start Date:</span>
                        <strong>{formatDate(batch.start_date)}</strong>
                      </div>
                      <div style={styles.infoLine}>
                        <span>📅 End Date:</span>
                        <strong>{formatDate(batch.end_date)}</strong>
                      </div>
                      <div style={styles.infoLine}>
                        <span>📡 Telemetry:</span>
                        <span style={{ color: tele.color, fontWeight: 700 }}>● {tele.label}</span>
                      </div>
                    </div>

                    <div style={styles.progressTrack}>
                      <div
                        style={{
                          ...styles.progressFill,
                          width: `${ratio}%`,
                          background: meta.dot,
                        }}
                      />
                    </div>

                    <div style={styles.batchFooter}>
                      <button style={styles.actionBtn}>Edit</button>
                      <button style={styles.viewLink}>Performance Report →</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h2 style={styles.sectionTitle}>Detailed Records</h2>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>House</th>
                  <th style={styles.th}>Breed</th>
                  <th style={styles.th}>Initial</th>
                  <th style={styles.th}>Current</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.id}>
                    <td style={styles.td}>#{b.id}</td>
                    <td style={styles.td}>{getHouseCode(b.house_id)}</td>
                    <td style={styles.td}>{b.breed || "-"}</td>
                    <td style={styles.td}>{b.initial_qty}</td>
                    <td style={styles.td}>{b.current_qty}</td>
                    <td style={styles.td}>
                      <span style={{ color: getStatusMeta(b.status).color, fontWeight: 700 }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        onClick={() => deleteBatch(b.id)}
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
    fontFamily: "Arial, sans-serif",
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
    background: "#0f5c2e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 24,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: 800,
    color: "#0b3d1d",
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
    background: "#0f5c2e",
    color: "#fff",
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
    maxWidth: 700,
  },
  backBtn: {
    textDecoration: "none",
    color: "#0f5c2e",
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
  formCard: {
    background: "#ffffff",
    borderRadius: 18,
    padding: 22,
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    marginBottom: 22,
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
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    gap: 12,
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
    fontSize: 14,
  },
  addBtn: {
    background: "#0f5c2e",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "12px 18px",
    fontWeight: 700,
    cursor: "pointer",
  },
  batchGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 20,
  },
  batchCard: {
    position: "relative",
    background: "#fdfdfd",
    borderRadius: 22,
    padding: 22,
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  batchAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 8,
    height: "100%",
  },
  batchCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    gap: 12,
  },
  cardRight: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },
  smallLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: "#94a3b8",
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  batchTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#0f172a",
  },
  statusTag: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 700,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
  },
  statsRow: {
    display: "flex",
    gap: 20,
    background: "#f8fafc",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    display: "block",
    fontSize: 11,
    color: "#64748b",
    fontWeight: 700,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 800,
    color: "#0f172a",
  },
  infoList: {
    marginBottom: 16,
  },
  infoLine: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    fontSize: 14,
    padding: "4px 0",
  },
  progressTrack: {
    width: "100%",
    height: 10,
    background: "#e2e8f0",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  batchFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  actionBtn: {
    background: "#f1f5f9",
    border: "none",
    padding: "8px 16px",
    borderRadius: 8,
    fontWeight: 700,
    cursor: "pointer",
    color: "#475569",
  },
  viewLink: {
    fontSize: 14,
    color: "#166534",
    fontWeight: 700,
    cursor: "pointer",
    border: "none",
    background: "none",
  },
  deleteBtn: {
    border: "none",
    background: "#fee2e2",
    color: "#991b1b",
    borderRadius: 10,
    padding: "8px 10px",
    cursor: "pointer",
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
  loading: {
    padding: 40,
    textAlign: "center",
    color: "#64748b",
    fontWeight: 600,
  },
};