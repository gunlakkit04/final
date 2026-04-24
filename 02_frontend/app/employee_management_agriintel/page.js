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

function getRoleColor(role = "") {
  const r = String(role).toLowerCase();
  if (r.includes("admin")) {
    return { bg: "#dbeafe", color: "#1d4ed8", label: role };
  }
  if (r.includes("manager")) {
    return { bg: "#dcfce7", color: "#166534", label: role };
  }
  return { bg: "#f1f5f9", color: "#475569", label: role || "Staff" };
}

function getFarmName(farmId, farms) {
  const farm = farms.find((f) => Number(f.id) === Number(farmId));
  return farm ? farm.name : `Farm ID ${farmId}`;
}

export default function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    role: "Manager",
    farm_id: "",
  });

  async function loadEmployees() {
    try {
      setLoading(true);
      setError("");

      const [empRes, farmRes] = await Promise.all([
        fetch(`${API}/employee`, { cache: "no-store" }),
        fetch(`${API}/farm`, { cache: "no-store" }),
      ]);

      if (!empRes.ok) throw new Error("โหลดข้อมูลพนักงานไม่สำเร็จ");
      if (!farmRes.ok) throw new Error("โหลดข้อมูลฟาร์มไม่สำเร็จ");

      const empData = await empRes.json();
      const farmData = await farmRes.json();

      setEmployees(Array.isArray(empData) ? empData : []);
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
    loadEmployees();
  }, []);

  async function addEmployee() {
    try {
      setError("");
      setMessage("");

      const res = await fetch(`${API}/employee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          role: form.role,
          farm_id: Number(form.farm_id),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "เพิ่มข้อมูลพนักงานไม่สำเร็จ");
      }

      setMessage("เพิ่มข้อมูลพนักงานสำเร็จ");
      setForm((prev) => ({
        ...prev,
        name: "",
        phone: "",
        role: "Manager",
      }));

      await loadEmployees();
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    }
  }

  async function deleteEmployee(id) {
    const ok = window.confirm("ต้องการลบพนักงานคนนี้ใช่ไหม?");
    if (!ok) return;

    try {
      setError("");
      setMessage("");

      const res = await fetch(`${API}/employee/${id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "ลบข้อมูลพนักงานไม่สำเร็จ");
      }

      setMessage("ลบข้อมูลพนักงานสำเร็จ");
      await loadEmployees();
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    }
  }

  const stats = useMemo(() => {
    const total = employees.length;
    const managers = employees.filter((x) =>
      String(x.role || "").toLowerCase().includes("manager")
    ).length;
    const admins = employees.filter((x) =>
      String(x.role || "").toLowerCase().includes("admin")
    ).length;

    return { total, managers, admins };
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
            const active = item.href === "/employee_management_agriintel";
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
            <h1 style={styles.pageTitle}>Employee Management</h1>
            <p style={styles.pageSubtitle}>
              Chicken farm employee directory dashboard
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
            <div style={styles.kpiLabel}>Total Staff</div>
            <div style={styles.kpiValue}>{stats.total}</div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Managers</div>
            <div style={styles.kpiValue}>{stats.managers}</div>
          </div>

          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Admins</div>
            <div style={styles.kpiValue}>{stats.admins}</div>
          </div>
        </section>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>Add New Employee</h2>

          <div style={styles.formGrid}>
            <input
              type="text"
              placeholder="Employee Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              style={styles.input}
            />

            <input
              type="text"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              style={styles.input}
            />

            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              style={styles.input}
            >
              <option value="Manager">Manager</option>
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
            </select>

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
            onClick={addEmployee}
            style={styles.primaryBtn}
            disabled={!form.name || !form.role || !form.farm_id}
          >
            + Add Employee
          </button>
        </section>

        <section style={styles.card}>
          <div style={styles.tableHeader}>
            <h2 style={styles.sectionTitle}>Employee Records</h2>
            <span style={styles.badge}>{employees.length} records</span>
          </div>

          {loading ? (
            <div style={styles.loading}>Loading...</div>
          ) : employees.length === 0 ? (
            <div style={styles.loading}>No employee data found.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>Phone</th>
                    <th style={styles.th}>Farm</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {employees.map((emp) => {
                    const badge = getRoleColor(emp.role);
                    return (
                      <tr key={emp.id}>
                        <td style={styles.td}>{emp.id}</td>
                        <td style={styles.td}>
                          <div style={styles.nameCell}>
                            <div style={styles.avatarCircle}>
                              {String(emp.name || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={styles.nameText}>{emp.name}</div>
                              <div style={styles.subText}>Employee ID: {emp.id}</div>
                            </div>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.roleBadge,
                              background: badge.bg,
                              color: badge.color,
                            }}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td style={styles.td}>{emp.phone || "-"}</td>
                        <td style={styles.td}>{getFarmName(emp.farm_id, farms)}</td>
                        <td style={styles.td}>
                          <button
                            onClick={() => deleteEmployee(emp.id)}
                            style={styles.deleteBtn}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
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
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  sectionTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
    color: "#0f172a",
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
  loading: {
    padding: 20,
    color: "#64748b",
    fontWeight: 600,
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
    verticalAlign: "middle",
  },
  nameCell: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "#d8ecf5",
    color: "#0f5c2e",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 18,
    flexShrink: 0,
  },
  nameText: {
    fontWeight: 700,
    color: "#0f172a",
  },
  subText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
  roleBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
  },
  deleteBtn: {
    background: "#fee2e2",
    color: "#991b1b",
    border: "none",
    borderRadius: 10,
    padding: "8px 12px",
    cursor: "pointer",
    fontWeight: 700,
  },
};