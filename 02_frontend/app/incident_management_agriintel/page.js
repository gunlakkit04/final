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

function normalizeIncident(item) {
  return {
    id: item.incident_id ?? item.id ?? "",
    incident_date: item.incident_date ?? item.date ?? "",
    incident_type: item.incident_type ?? item.type ?? "",
    detail: item.detail ?? "",
    qty_affected: Number(item.qty_affected ?? item.qty ?? 0),
    batch_id: String(item.batch_id ?? ""),
    employee_id: String(item.employee_id ?? ""),
    batch_label: item.batch_label ?? item.breed ?? "",
    employee_name: item.employee_name ?? "",
  };
}

function normalizeBatch(item) {
  return {
    id: String(item.batch_id ?? item.id ?? ""),
    label: item.breed ?? `Batch ${item.batch_id ?? item.id ?? ""}`,
  };
}

function normalizeEmployee(item) {
  return {
    id: String(item.employee_id ?? item.id ?? ""),
    name: item.name ?? item.employee_name ?? `Employee ${item.employee_id ?? item.id ?? ""}`,
  };
}

export default function IncidentManagementPage() {
  const [rows, setRows] = useState([]);
  const [batches, setBatches] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    incident_date: "",
    incident_type: "",
    detail: "",
    qty_affected: "",
    batch_id: "",
    employee_id: "",
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [incidentRes, batchRes, employeeRes] = await Promise.all([
        fetch(`${API}/incident`, { cache: "no-store" }),
        fetch(`${API}/batch`, { cache: "no-store" }),
        fetch(`${API}/employee`, { cache: "no-store" }),
      ]);

      if (!incidentRes.ok) throw new Error("โหลดข้อมูล incident ไม่สำเร็จ");
      if (!batchRes.ok) throw new Error("โหลดข้อมูล batch ไม่สำเร็จ");
      if (!employeeRes.ok) throw new Error("โหลดข้อมูล employee ไม่สำเร็จ");

      const incidentData = await incidentRes.json();
      const batchData = await batchRes.json();
      const employeeData = await employeeRes.json();

      setRows(extractArray(incidentData).map(normalizeIncident));
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

  async function addIncident() {
    try {
      setError("");
      setMessage("");

      if (!form.incident_date || !form.incident_type || !form.batch_id || !form.employee_id) {
        throw new Error("กรุณากรอก incident date, incident type, batch และ employee ให้ครบ");
      }

      setSubmitting(true);

      const payload = {
        incident_date: form.incident_date,
        incident_type: form.incident_type,
        detail: form.detail,
        qty_affected: Number(form.qty_affected || 0),
        batch_id: Number(form.batch_id),
        employee_id: Number(form.employee_id),
      };

      const res = await fetch(`${API}/incident`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "เพิ่มข้อมูล incident ไม่สำเร็จ");
      }

      setMessage("เพิ่มข้อมูล incident สำเร็จ");
      setForm({
        incident_date: "",
        incident_type: "",
        detail: "",
        qty_affected: "",
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

  async function deleteIncident(id) {
    const ok = window.confirm("ต้องการลบข้อมูล incident นี้ใช่ไหม?");
    if (!ok) return;

    try {
      setError("");
      setMessage("");

      const res = await fetch(`${API}/incident/${id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "ลบข้อมูล incident ไม่สำเร็จ");
      }

      setMessage("ลบข้อมูล incident สำเร็จ");
      await loadData();
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    }
  }

  const summary = useMemo(() => {
    const totalAffected = rows.reduce((sum, row) => sum + Number(row.qty_affected || 0), 0);
    const typeCount = new Set(rows.map((row) => row.incident_type).filter(Boolean)).size;
    const batchCount = new Set(rows.map((row) => row.batch_id).filter(Boolean)).size;

    return {
      totalRecords: rows.length,
      totalAffected,
      typeCount,
      batchCount,
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
            const active = item.href === "/incident_management_agriintel";
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
            <h1 style={styles.pageTitle}>Incident Management</h1>
            <p style={styles.pageSubtitle}>
              Track disease, equipment issues, and affected quantity by batch
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
            <div style={styles.kpiLabel}>Affected Qty</div>
            <div style={styles.kpiValue}>{summary.totalAffected}</div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Incident Types</div>
            <div style={styles.kpiValue}>{summary.typeCount}</div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Related Batches</div>
            <div style={styles.kpiValue}>{summary.batchCount}</div>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Add Incident Record</h2>

          <div style={styles.formGrid}>
            <input
              type="date"
              value={form.incident_date}
              onChange={(e) => setForm({ ...form, incident_date: e.target.value })}
              style={styles.input}
            />

            <input
              type="text"
              placeholder="Incident Type"
              value={form.incident_type}
              onChange={(e) => setForm({ ...form, incident_type: e.target.value })}
              style={styles.input}
            />

            <input
              type="number"
              placeholder="Affected Quantity"
              value={form.qty_affected}
              onChange={(e) => setForm({ ...form, qty_affected: e.target.value })}
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

            <textarea
              placeholder="Detail"
              value={form.detail}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
              style={styles.textarea}
            />
          </div>

          <button onClick={addIncident} style={styles.primaryBtn} disabled={submitting}>
            {submitting ? "Saving..." : "+ Add Incident Record"}
          </button>
        </section>

        <section style={styles.card}>
          <div style={styles.tableHeader}>
            <h2 style={styles.sectionTitle}>Incident Records</h2>
            <span style={styles.badge}>{rows.length} records</span>
          </div>

          {loading ? (
            <div style={styles.loading}>Loading...</div>
          ) : rows.length === 0 ? (
            <div style={styles.loading}>No incident data found.</div>
          ) : (
            <div style={styles.recordGrid}>
              {rows.map((item, index) => (
                <div key={item.id || `${item.incident_date}-${index}`} style={styles.recordCard}>
                  <div
                    style={{
                      ...styles.recordAccent,
                      background: index % 2 === 0 ? "#991b1b" : "#b8860b",
                    }}
                  />

                  <div style={styles.recordCardTop}>
                    <div>
                      <div style={styles.smallLabel}>INCIDENT ID</div>
                      <div style={styles.recordName}>{item.incident_type || "-"}</div>
                    </div>

                    <div style={styles.cardActions}>
                      <div style={styles.recordIcon}>⚠️</div>
                      <button
                        onClick={() => deleteIncident(item.id)}
                        style={styles.deleteAction}
                        title="Delete Incident"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>📅 Incident Date</span>
                    <span style={styles.infoValue}>{item.incident_date || "-"}</span>
                  </div>

                  <div style={styles.infoRow}>
                    <span style={styles.infoLabel}>🔢 Affected Qty</span>
                    <span style={styles.infoValue}>{item.qty_affected}</span>
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

                  <div style={styles.detailBox}>
                    <div style={styles.detailTitle}>Detail</div>
                    <div style={styles.detailText}>{item.detail || "-"}</div>
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
                    <span style={styles.viewLink}>Incident Log</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={styles.tableCard}>
          <div style={styles.tableHeader}>
            <h2 style={styles.sectionTitle}>Incident Table</h2>
          </div>

          {loading ? (
            <div style={styles.loading}>Loading...</div>
          ) : rows.length === 0 ? (
            <div style={styles.loading}>No incident data found.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Detail</th>
                    <th style={styles.th}>Qty Affected</th>
                    <th style={styles.th}>Batch</th>
                    <th style={styles.th}>Employee</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item, index) => (
                    <tr key={item.id || `row-${index}`}>
                      <td style={styles.td}>{item.id}</td>
                      <td style={styles.td}>{item.incident_date || "-"}</td>
                      <td style={styles.td}>{item.incident_type || "-"}</td>
                      <td style={styles.td}>{item.detail || "-"}</td>
                      <td style={styles.td}>{item.qty_affected}</td>
                      <td style={styles.td}>
                        {item.batch_label || batchMap[item.batch_id] || item.batch_id || "-"}
                      </td>
                      <td style={styles.td}>
                        {item.employee_name || employeeMap[item.employee_id] || item.employee_id || "-"}
                      </td>
                      <td style={styles.td}>
                        <button
                          onClick={() => deleteIncident(item.id)}
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
    color: "#030303",
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
  textarea: {
    width: "100%",
    minHeight: 96,
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "#f8fafc",
    fontSize: 15,
    outline: "none",
    resize: "vertical",
    gridColumn: "1 / -1",
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
  recordGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
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
  detailBox: {
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    marginBottom: 14,
  },
  detailTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#64748b",
    marginBottom: 6,
    textTransform: "uppercase",
  },
  detailText: {
    fontSize: 14,
    color: "#0f172a",
    lineHeight: 1.5,
  },
  progressTrack: {
    width: "100%",
    height: 12,
    background: "#fee2e2",
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 18,
    marginTop: 10,
  },
  progressFill: {
    height: "100%",
    background: "#991b1b",
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
    color: "#991b1b",
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
    verticalAlign: "top",
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