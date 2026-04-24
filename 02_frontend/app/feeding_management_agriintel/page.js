"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

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

function extractArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.rows)) return payload.rows;
  return [];
}

function normalizeFeeding(item) {
  return {
    id: item.feed_id ?? item.id ?? item.feeding_id ?? "",
    feed_date: item.feed_date ?? item.date ?? "",
    feed_name: item.feed_name ?? item.name ?? "",
    feed_amount: Number(item.feed_amount ?? item.amount ?? 0),
    water_amount: Number(item.water_amount ?? item.water ?? 0),
    batch_id: String(item.batch_id ?? item.batchId ?? ""),
    employee_id: String(item.employee_id ?? item.employeeId ?? ""),
    batch_label:
      item.batch_label ??
      item.batch_breed ??
      item.breed ??
      item.batch_name ??
      "",
    employee_name:
      item.employee_name ??
      item.employee ??
      item.name_employee ??
      item.staff_name ??
      "",
  };
}

function normalizeBatch(item) {
  const id = item.batch_id ?? item.id ?? "";
  const breed = item.breed ?? item.batch_name ?? `Batch ${id}`;
  const house = item.house_name ? ` / ${item.house_name}` : "";
  return {
    id: String(id),
    label: `${breed}${house}`,
  };
}

function normalizeEmployee(item) {
  return {
    id: String(item.employee_id ?? item.id ?? ""),
    name: item.name ?? item.employee_name ?? item.full_name ?? `Employee ${item.employee_id ?? item.id ?? ""}`,
  };
}

export default function FeedingManagementPage() {
  const [rows, setRows] = useState([]);
  const [batches, setBatches] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    feed_date: "",
    feed_name: "",
    feed_amount: "",
    water_amount: "",
    batch_id: "",
    employee_id: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [feedingRes, batchRes, employeeRes] = await Promise.all([
        fetch(`${API}/feeding`, { cache: "no-store" }),
        fetch(`${API}/batch`, { cache: "no-store" }),
        fetch(`${API}/employee`, { cache: "no-store" }),
      ]);

      if (!feedingRes.ok) throw new Error("โหลดข้อมูลการให้อาหารไม่สำเร็จ");
      if (!batchRes.ok) throw new Error("โหลดข้อมูล batch ไม่สำเร็จ");
      if (!employeeRes.ok) throw new Error("โหลดข้อมูลพนักงานไม่สำเร็จ");

      const feedingData = await feedingRes.json();
      const batchData = await batchRes.json();
      const employeeData = await employeeRes.json();

      setRows(extractArray(feedingData).map(normalizeFeeding));
      setBatches(extractArray(batchData).map(normalizeBatch));
      setEmployees(extractArray(employeeData).map(normalizeEmployee));
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function addFeeding() {
    try {
      setError("");
      setMessage("");

      if (
        !form.feed_date ||
        !form.feed_name ||
        !form.feed_amount ||
        !form.water_amount ||
        !form.batch_id ||
        !form.employee_id
      ) {
        throw new Error("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      }

      setSubmitting(true);

      const payload = {
        feed_date: form.feed_date,
        feed_name: form.feed_name,
        feed_amount: Number(form.feed_amount),
        water_amount: Number(form.water_amount),
        batch_id: Number(form.batch_id),
        employee_id: Number(form.employee_id),
      };

      const res = await fetch(`${API}/feeding`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "เพิ่มข้อมูลการให้อาหารไม่สำเร็จ");
      }

      setMessage("เพิ่มข้อมูลการให้อาหารสำเร็จ");
      setForm({
        feed_date: "",
        feed_name: "",
        feed_amount: "",
        water_amount: "",
        batch_id: "",
        employee_id: "",
      });

      await loadData();
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteFeeding(id) {
    const ok = window.confirm("ต้องการลบข้อมูลการให้อาหารนี้ใช่ไหม?");
    if (!ok) return;

    try {
      setError("");
      setMessage("");

      const res = await fetch(`${API}/feeding/${id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "ลบข้อมูลการให้อาหารไม่สำเร็จ");
      }

      setMessage("ลบข้อมูลการให้อาหารสำเร็จ");
      await loadData();
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    }
  }

  const summary = useMemo(() => {
    const totalFeed = rows.reduce((sum, row) => sum + Number(row.feed_amount || 0), 0);
    const totalWater = rows.reduce((sum, row) => sum + Number(row.water_amount || 0), 0);
    const totalBatches = new Set(rows.map((row) => row.batch_id)).size;

    return {
      totalRecords: rows.length,
      totalFeed: totalFeed.toFixed(2),
      totalWater: totalWater.toFixed(2),
      totalBatches,
    };
  }, [rows]);

  const batchMap = useMemo(() => {
    return Object.fromEntries(batches.map((item) => [item.id, item.label]));
  }, [batches]);

  const employeeMap = useMemo(() => {
    return Object.fromEntries(employees.map((item) => [item.id, item.name]));
  }, [employees]);

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
            const active = item.href === "/feeding_management_agriintel";
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
            <h1 style={styles.pageTitle}>Feeding Management</h1>
            <p style={styles.pageSubtitle}>
              Track feed and water usage for each poultry batch
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
            <div style={styles.kpiLabel}>Total Records</div>
            <div style={styles.kpiValue}>{summary.totalRecords}</div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Total Feed Amount</div>
            <div style={styles.kpiValue}>{summary.totalFeed}</div>
            <div style={styles.kpiUnit}>kg</div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Total Water Amount</div>
            <div style={styles.kpiValue}>{summary.totalWater}</div>
            <div style={styles.kpiUnit}>liters</div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Related Batches</div>
            <div style={styles.kpiValue}>{summary.totalBatches}</div>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Add Feeding Record</h2>

          <div style={styles.formGrid}>
            <input
              type="date"
              value={form.feed_date}
              onChange={(e) => setForm({ ...form, feed_date: e.target.value })}
              style={styles.input}
            />

            <input
              type="text"
              placeholder="Feed Name"
              value={form.feed_name}
              onChange={(e) => setForm({ ...form, feed_name: e.target.value })}
              style={styles.input}
            />

            <input
              type="number"
              step="0.01"
              placeholder="Feed Amount"
              value={form.feed_amount}
              onChange={(e) => setForm({ ...form, feed_amount: e.target.value })}
              style={styles.input}
            />

            <input
              type="number"
              step="0.01"
              placeholder="Water Amount"
              value={form.water_amount}
              onChange={(e) => setForm({ ...form, water_amount: e.target.value })}
              style={styles.input}
            />

            <select
              value={form.batch_id}
              onChange={(e) => setForm({ ...form, batch_id: e.target.value })}
              style={styles.input}
            >
              <option value="">Select Batch</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.label}
                </option>
              ))}
            </select>

            <select
              value={form.employee_id}
              onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
              style={styles.input}
            >
              <option value="">Select Employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          <button onClick={addFeeding} style={styles.primaryBtn} disabled={submitting}>
            {submitting ? "Saving..." : "+ Add Feeding Record"}
          </button>
        </section>

        <section style={styles.card}>
          <div style={styles.tableHeader}>
            <h2 style={styles.sectionTitle}>Feeding Records</h2>
            <span style={styles.badge}>{rows.length} records</span>
          </div>

          {loading ? (
            <div style={styles.loading}>Loading...</div>
          ) : rows.length === 0 ? (
            <div style={styles.loading}>No feeding data found.</div>
          ) : (
            <div style={styles.recordGrid}>
              {rows.map((item, index) => (
                <div key={item.id || `${item.feed_date}-${index}`} style={styles.recordCard}>
                  <div
                    style={{
                      ...styles.recordAccent,
                      background: index % 2 === 0 ? "#0f5c2e" : "#b8860b",
                    }}
                  />

                  <div style={styles.recordCardTop}>
                    <div>
                      <div style={styles.smallLabel}>FEEDING ID</div>
                      <div style={styles.recordName}>{item.feed_name || "-"}</div>
                    </div>

                    <div style={styles.cardActions}>
                      <div style={styles.recordIcon}>🌾</div>
                      <button
                        onClick={() => deleteFeeding(item.id)}
                        style={styles.deleteAction}
                        title="Delete Feeding"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>📅 Feed Date</span>
                    <span style={styles.infoValue}>{item.feed_date || "-"}</span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>🧺 Feed Amount</span>
                    <span style={styles.infoValue}>{item.feed_amount} kg</span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>💧 Water Amount</span>
                    <span style={styles.infoValue}>{item.water_amount} liters</span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>🧱 Batch</span>
                    <span style={styles.infoValue}>
                      {item.batch_label || batchMap[item.batch_id] || item.batch_id || "-"}
                    </span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>👨‍🌾 Employee</span>
                    <span style={styles.infoValue}>
                      {item.employee_name || employeeMap[item.employee_id] || item.employee_id || "-"}
                    </span>
                  </div>

                  <div style={styles.progressTrack}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${72 + (index % 3) * 8}%`,
                      }}
                    />
                  </div>

                  <div style={styles.recordFooter}>
                    <span style={styles.footerMuted}>Record ID: {item.id}</span>
                    <span style={styles.viewLink}>Feeding Log</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h2 style={styles.sectionTitle}>Feeding Table</h2>
          </div>

          {loading ? (
            <div style={styles.loading}>Loading...</div>
          ) : rows.length === 0 ? (
            <div style={styles.loading}>No feeding data found.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Feed Date</th>
                    <th style={styles.th}>Feed Name</th>
                    <th style={styles.th}>Feed Amount</th>
                    <th style={styles.th}>Water Amount</th>
                    <th style={styles.th}>Batch</th>
                    <th style={styles.th}>Employee</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item, index) => (
                    <tr key={item.id || `row-${index}`}>
                      <td style={styles.td}>{item.id}</td>
                      <td style={styles.td}>{item.feed_date || "-"}</td>
                      <td style={styles.td}>{item.feed_name || "-"}</td>
                      <td style={styles.td}>{item.feed_amount} kg</td>
                      <td style={styles.td}>{item.water_amount} liters</td>
                      <td style={styles.td}>
                        {item.batch_label || batchMap[item.batch_id] || item.batch_id || "-"}
                      </td>
                      <td style={styles.td}>
                        {item.employee_name || employeeMap[item.employee_id] || item.employee_id || "-"}
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => deleteFeeding(item.id)}
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
    lineHeight: 1.1,
  },
  kpiUnit: {
    marginTop: 6,
    color: "#64748b",
    fontWeight: 600,
    fontSize: 13,
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
    outline: "none",
  },
  primaryBtn: {
    background: "#000000",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "12px 18px",
    fontWeight: 700,
    cursor: "pointer",
    opacity: 1,
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
  recordGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 18,
  },
  recordCard: {
    position: "relative",
    background: "#fdfdfd",
    borderRadius: 22,
    padding: 22,
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    overflow: "hidden",
  },
  recordAccent: {
    position: "absolute",
    left: 0,
    top: 0,
    width: 8,
    height: "100%",
  },
  recordCardTop: {
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
  recordName: {
    fontSize: 22,
    fontWeight: 800,
    color: "#0f172a",
  },
  recordIcon: {
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
  recordFooter: {
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