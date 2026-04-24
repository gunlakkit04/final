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

export default function ProductionPage() {
  const [rows, setRows] = useState([]);
  const [batches, setBatches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    good: "",
    broken: "",
    weight: "",
    size: "L",
    batch_id: "",
    employee_id: "",
  });

  async function loadAll() {
    try {
      setLoading(true);
      setError("");

      const [productionRes, batchRes, employeeRes] = await Promise.all([
        fetch(`${API}/production`, { cache: "no-store" }),
        fetch(`${API}/batch`, { cache: "no-store" }),
        fetch(`${API}/employee`, { cache: "no-store" }),
      ]);

      if (!productionRes.ok) throw new Error("โหลดข้อมูล production ไม่สำเร็จ");
      if (!batchRes.ok) throw new Error("โหลดข้อมูล batch ไม่สำเร็จ");
      if (!employeeRes.ok) throw new Error("โหลดข้อมูล employee ไม่สำเร็จ");

      const productionData = await productionRes.json();
      const batchData = await batchRes.json();
      const employeeData = await employeeRes.json();

      const safeRows = Array.isArray(productionData) ? productionData : [];
      const safeBatches = Array.isArray(batchData) ? batchData : [];
      const safeEmployees = Array.isArray(employeeData) ? employeeData : [];

      setRows(safeRows);
      setBatches(safeBatches);
      setEmployees(safeEmployees);

      setForm((prev) => ({
        ...prev,
        batch_id:
          prev.batch_id || (safeBatches.length > 0 ? String(safeBatches[0].id) : ""),
        employee_id:
          prev.employee_id || (safeEmployees.length > 0 ? String(safeEmployees[0].id) : ""),
      }));
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function addProduction() {
    try {
      setError("");
      setMessage("");

      const res = await fetch(`${API}/production`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.date,
          good: Number(form.good || 0),
          broken: Number(form.broken || 0),
          weight: Number(form.weight || 0),
          size: form.size,
          batch_id: Number(form.batch_id),
          employee_id: Number(form.employee_id),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "เพิ่มข้อมูลไม่สำเร็จ");
      }

      setMessage("เพิ่มข้อมูลสำเร็จ");
      setForm((prev) => ({
        ...prev,
        good: "",
        broken: "",
        weight: "",
      }));
      await loadAll();
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    }
  }

  async function deleteProduction(id) {
    try {
      setError("");
      setMessage("");

      const res = await fetch(`${API}/production/${id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "ลบข้อมูลไม่สำเร็จ");
      }

      setMessage("ลบข้อมูลสำเร็จ");
      await loadAll();
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    }
  }

  const summary = useMemo(() => {
    return {
      good: rows.reduce((sum, item) => sum + Number(item.good || 0), 0),
      broken: rows.reduce((sum, item) => sum + Number(item.broken || 0), 0),
      weight: rows.reduce((sum, item) => sum + Number(item.weight || 0), 0),
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
            const active = item.href === "/production_management_agriintel";
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
            <h1 style={styles.pageTitle}>Production</h1>
            <p style={styles.pageSubtitle}>Daily egg collection and quality records</p>
          </div>
          <Link href="/dashboard_agriintel" style={styles.backBtn}>
            ← Back to Dashboard
          </Link>
        </header>

        {error ? <div style={styles.errorBox}>❌ {error}</div> : null}
        {message ? <div style={styles.successBox}>✅ {message}</div> : null}

        <section style={styles.kpiGrid}>
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>GOOD EGGS</div>
            <div style={{ ...styles.kpiValue, color: "#0f5c2e" }}>
              {summary.good.toLocaleString()}
            </div>
          </div>
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>BROKEN EGGS</div>
            <div style={{ ...styles.kpiValue, color: "#be123c" }}>
              {summary.broken.toLocaleString()}
            </div>
          </div>
          <div style={styles.kpiCard}>
            <div style={{ ...styles.kpiLabel }}>TOTAL WEIGHT</div>
            <div style={{ ...styles.kpiValue, color: "#b8860b" }}>
              {summary.weight.toFixed(2)} <span style={{ fontSize: 18 }}>kg</span>
            </div>
          </div>
        </section>

        <div style={styles.contentLayout}>
          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>Add New Record</h2>
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Good Eggs (Units)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.good}
                  onChange={(e) => setForm({ ...form, good: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Broken Eggs (Units)</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.broken}
                  onChange={(e) => setForm({ ...form, broken: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Weight (kg)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Egg Size</label>
                <select
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                  style={styles.input}
                >
                  <option value="S">Small (S)</option>
                  <option value="M">Medium (M)</option>
                  <option value="L">Large (L)</option>
                  <option value="XL">Extra Large (XL)</option>
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Batch</label>
                <select
                  value={form.batch_id}
                  onChange={(e) => setForm({ ...form, batch_id: e.target.value })}
                  style={styles.input}
                >
                  {batches.length === 0 ? (
                    <option value="">No batch found</option>
                  ) : (
                    batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        Batch {batch.id} ({batch.breed})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Employee</label>
                <select
                  value={form.employee_id}
                  onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
                  style={styles.input}
                >
                  {employees.length === 0 ? (
                    <option value="">No employee found</option>
                  ) : (
                    employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} (ID: {emp.id})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <button
              onClick={addProduction}
              style={styles.primaryBtn}
              disabled={!form.date || !form.batch_id || !form.employee_id}
            >
              + Save Production Record
            </button>
          </section>

          <section style={styles.tableCard}>
            <div style={styles.tableHeader}>
              <h2 style={styles.sectionTitle}>Production History</h2>
              <span style={styles.badge}>{rows.length} Records</span>
            </div>

            {loading ? (
              <div style={styles.loading}>Loading records...</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Good</th>
                      <th style={styles.th}>Broken</th>
                      <th style={styles.th}>Size</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id}>
                        <td style={styles.td}>
                          {row.date ? new Date(row.date).toLocaleDateString() : "-"}
                        </td>
                        <td style={{ ...styles.td, fontWeight: 700 }}>{row.good}</td>
                        <td style={{ ...styles.td, color: "#be123c" }}>{row.broken}</td>
                        <td style={styles.td}>
                          <span style={styles.sizeBadge}>{row.size}</span>
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => deleteProduction(row.id)}
                            style={styles.deleteBtn}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

const styles = {
  appShell: { display: "flex", minHeight: "100vh", background: "#eef5f9", color: "#1f2937", fontFamily: "Arial, sans-serif" },
  sidebar: { width: 300, background: "#d8ecf5", borderRight: "1px solid #c9dce4", padding: "20px 14px", position: "sticky", top: 0, height: "100vh", overflowY: "auto" },
  brandBox: { display: "flex", gap: 12, alignItems: "center", marginBottom: 10 },
  brandIcon: { width: 48, height: 48, borderRadius: 14, background: "#fee7aa", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24 },
  brandTitle: { fontSize: 28, fontWeight: 800, color: "#000000", lineHeight: 1 },
  brandSub: { marginTop: 4, fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", color: "#6b7280", fontWeight: 700 },
  navItem: { display: "flex", alignItems: "center", gap: 10, padding: "13px 14px", borderRadius: 12, color: "#334155", textDecoration: "none", marginBottom: 8, fontWeight: 600, fontSize: 15 },
  navItemActive: { background: "#f8df95", color: "#000000" },

  main: { flex: 1, padding: "28px 30px" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, gap: 16, flexWrap: "wrap" },
  pageTitle: { margin: 0, fontSize: 40, fontWeight: 800, color: "#0f172a" },
  pageSubtitle: { margin: "6px 0 0", color: "#64748b", fontSize: 15 },
  backBtn: { textDecoration: "none", color: "#000000", fontWeight: 700, background: "#e5f4ea", padding: "10px 14px", borderRadius: 10 },

  errorBox: { background: "#fee2e2", color: "#991b1b", padding: 14, borderRadius: 12, marginBottom: 16, fontWeight: 600 },
  successBox: { background: "#dcfce7", color: "#166534", padding: 14, borderRadius: 12, marginBottom: 16, fontWeight: 600 },

  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 18, marginBottom: 22 },
  kpiCard: { background: "#ffffff", borderRadius: 18, padding: 22, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" },
  kpiLabel: { color: "#64748b", fontWeight: 700, marginBottom: 10, fontSize: 13, letterSpacing: 0.5 },
  kpiValue: { fontSize: 32, fontWeight: 800, color: "#0f172a" },

  contentLayout: { display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 22, alignItems: "start" },
  card: { background: "#ffffff", borderRadius: 18, padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.06)" },
  tableCard: { background: "#ffffff", borderRadius: 18, padding: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.06)", minHeight: 400 },

  sectionTitle: { margin: "0 0 20px", fontSize: 24, fontWeight: 800, color: "#0f172a" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 },
  inputGroup: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 700, color: "#475569" },
  input: { padding: "12px", borderRadius: 10, border: "1px solid #cbd5e1", background: "#f8fafc", fontSize: 15, outline: "none" },
  primaryBtn: { width: "100%", background: "#000000", color: "#fff", border: "none", borderRadius: 12, padding: "14px", fontWeight: 700, cursor: "pointer", fontSize: 16 },

  tableHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15, gap: 12, flexWrap: "wrap" },
  badge: { background: "#e2e8f0", color: "#334155", borderRadius: 999, padding: "6px 12px", fontSize: 13, fontWeight: 700 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 10px", borderBottom: "2px solid #f1f5f9", color: "#64748b", fontSize: 12, textTransform: "uppercase" },
  td: { padding: "14px 10px", borderBottom: "1px solid #f1f5f9", fontSize: 15 },
  sizeBadge: { background: "#f1f5f9", padding: "4px 8px", borderRadius: 6, fontWeight: 800, color: "#0f5c2e" },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", fontSize: 18, opacity: 0.7 },
  loading: { padding: 40, textAlign: "center", color: "#64748b", fontWeight: 600 },
};