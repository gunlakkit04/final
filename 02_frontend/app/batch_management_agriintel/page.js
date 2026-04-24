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

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-GB");
}

function getStatusMeta(status = "") {
  const s = String(status).toLowerCase();

  if (s === "active") {
    return {
      label: "Active",
      bg: "#dcfce7",
      color: "#166534",
      border: "#bbf7d0",
    };
  }

  if (s === "inactive") {
    return {
      label: "Completed",
      bg: "#e2e8f0",
      color: "#475569",
      border: "#cbd5e1",
    };
  }

  if (s === "quarantine") {
    return {
      label: "Quarantine",
      bg: "#fef3c7",
      color: "#92400e",
      border: "#fde68a",
    };
  }

  return {
    label: status || "Unknown",
    bg: "#fee2e2",
    color: "#991b1b",
    border: "#fecaca",
  };
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
    initial_qty: "",
    house_id: "",
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    id: null,
    breed: "",
    start_date: "",
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

      const safeHouses = Array.isArray(houseData) ? houseData : [];
      const safeBatches = Array.isArray(batchData) ? batchData : [];

      const houseMap = new Map(safeHouses.map((h) => [Number(h.id), h.name]));

      const enrichedBatches = safeBatches.map((batch) => ({
        ...batch,
        house_name:
          batch.house_name ||
          houseMap.get(Number(batch.house_id)) ||
          `House ID ${batch.house_id}`,
      }));

      setHouses(safeHouses);
      setBatches(enrichedBatches);

      if (safeHouses.length > 0 && !form.house_id) {
        setForm((prev) => ({
          ...prev,
          house_id: String(safeHouses[0].id),
        }));
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

      if (!form.breed.trim()) {
        throw new Error("กรุณากรอกสายพันธุ์");
      }

      if (!form.start_date) {
        throw new Error("กรุณาเลือกวันที่รับเข้า");
      }

      if (!form.initial_qty || toNumber(form.initial_qty) <= 0) {
        throw new Error("กรุณากรอกจำนวนเริ่มต้นให้มากกว่า 0");
      }

      if (!form.house_id) {
        throw new Error("กรุณาเลือกโรงเรือน");
      }

      const initialQty = toNumber(form.initial_qty);

      const res = await fetch(`${API}/batch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          breed: form.breed.trim(),
          start_date: form.start_date,
          end_date: null,
          status: "active",
          initial_qty: initialQty,
          current_qty: initialQty,
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
        initial_qty: "",
      }));

      await loadData();
    } catch (err) {
      setError(err.message || "เกิดข้อผิดพลาด");
    }
  }

  function openEdit(batch) {
    setError("");
    setMessage("");
    setEditForm({
      id: batch.id,
      breed: batch.breed || "",
      start_date: batch.start_date ? String(batch.start_date).slice(0, 10) : "",
      end_date: batch.end_date ? String(batch.end_date).slice(0, 10) : "",
      status: batch.status || "active",
      initial_qty: String(batch.initial_qty ?? ""),
      current_qty: String(batch.current_qty ?? ""),
      house_id: String(batch.house_id ?? ""),
    });
    setEditOpen(true);
  }

  function closeEdit() {
    setEditOpen(false);
    setEditForm({
      id: null,
      breed: "",
      start_date: "",
      end_date: "",
      status: "active",
      initial_qty: "",
      current_qty: "",
      house_id: "",
    });
  }

  async function saveEdit() {
    try {
      setError("");
      setMessage("");

      if (!editForm.id) {
        throw new Error("ไม่พบ batch ที่ต้องการแก้ไข");
      }

      if (!editForm.breed.trim()) {
        throw new Error("กรุณากรอกสายพันธุ์");
      }

      if (!editForm.start_date) {
        throw new Error("กรุณาเลือก start date");
      }

      if (!editForm.house_id) {
        throw new Error("กรุณาเลือกโรงเรือน");
      }

      const res = await fetch(`${API}/batch/${editForm.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          breed: editForm.breed.trim(),
          start_date: editForm.start_date,
          end_date: editForm.end_date || null,
          status: editForm.status,
          initial_qty: toNumber(editForm.initial_qty),
          current_qty: toNumber(editForm.current_qty),
          house_id: Number(editForm.house_id),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 404 || res.status === 405) {
          throw new Error("Backend ยังไม่มี PUT /batch/:id สำหรับบันทึกการแก้ไข");
        }
        throw new Error(data?.error || "บันทึกการแก้ไขไม่สำเร็จ");
      }

      setMessage("แก้ไข Batch สำเร็จ");
      closeEdit();
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
    const active = batches.filter(
      (b) => String(b.status || "").toLowerCase() === "active"
    ).length;

    const completed = batches.filter(
      (b) => String(b.status || "").toLowerCase() === "inactive"
    ).length;

    const totalPopulation = batches.reduce(
      (sum, b) => sum + toNumber(b.current_qty),
      0
    );

    return { active, completed, totalPopulation };
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
              เพิ่มรุ่นไก่ใหม่ให้เรียบง่าย และแก้ไขรายละเอียดภายหลังได้
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
            <div style={styles.kpiLabel}>Active Batches</div>
            <div style={styles.kpiValue}>{stats.active}</div>
          </div>
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Completed</div>
            <div style={styles.kpiValue}>{stats.completed}</div>
          </div>
          <div style={styles.kpiCard}>
            <div style={styles.kpiLabel}>Total Population</div>
            <div style={styles.kpiValue}>{stats.totalPopulation.toLocaleString()}</div>
          </div>
        </section>

        <section style={styles.formCard}>
          <div style={styles.sectionHead}>
            <div>
              <h2 style={styles.sectionTitle}>Add New Batch</h2>
              <p style={styles.sectionDesc}>
                ตอนรับไก่เข้า กรอกแค่ข้อมูลหลักก่อน ระบบจะตั้ง Current Qty เท่ากับ
                Initial Qty และสถานะเป็น Active ให้อัตโนมัติ
              </p>
            </div>
            <span style={styles.badge}>Simple create</span>
          </div>

          <div style={styles.formGrid}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Breed</label>
              <input
                type="text"
                placeholder="เช่น Hy-Line Brown"
                value={form.breed}
                onChange={(e) => setForm({ ...form, breed: e.target.value })}
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Start Date</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Initial Qty</label>
              <input
                type="number"
                min="1"
                placeholder="จำนวนไก่ที่รับเข้า"
                value={form.initial_qty}
                onChange={(e) => setForm({ ...form, initial_qty: e.target.value })}
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>House</label>
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
          </div>

          <div style={styles.noteRow}>
            <span style={styles.noteChip}>Status: active</span>
            <span style={styles.noteChip}>
              Current Qty: {form.initial_qty || 0}
            </span>
            <span style={styles.noteChip}>End Date: ยังไม่ต้องกรอก</span>
          </div>

          <button
            onClick={addBatch}
            style={styles.addBtn}
            disabled={!form.breed || !form.start_date || !form.initial_qty || !form.house_id}
          >
            + Add Batch
          </button>
        </section>

        <section style={styles.tableCard}>
          <div style={styles.sectionHead}>
            <div>
              <h2 style={styles.sectionTitle}>Batch Records</h2>
              <p style={styles.sectionDesc}>
                จัดการรุ่นไก่ที่มีอยู่ และแก้ไขข้อมูลภายหลังด้วยปุ่ม Edit
              </p>
            </div>
            <span style={styles.badge}>{batches.length} records</span>
          </div>

          {loading ? (
            <div style={styles.loading}>Loading batch data...</div>
          ) : batches.length === 0 ? (
            <div style={styles.loading}>No batch data found.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Breed</th>
                    <th style={styles.th}>House</th>
                    <th style={styles.th}>Start Date</th>
                    <th style={styles.th}>End Date</th>
                    <th style={styles.th}>Initial Qty</th>
                    <th style={styles.th}>Current Qty</th>
                    <th style={styles.th}>Status</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch) => {
                    const statusMeta = getStatusMeta(batch.status);

                    return (
                      <tr key={batch.id}>
                        <td style={styles.td}>#{batch.id}</td>
                        <td style={styles.tdStrong}>{batch.breed || "-"}</td>
                        <td style={styles.td}>{batch.house_name || "-"}</td>
                        <td style={styles.td}>{formatDate(batch.start_date)}</td>
                        <td style={styles.td}>{formatDate(batch.end_date)}</td>
                        <td style={styles.td}>{toNumber(batch.initial_qty).toLocaleString()}</td>
                        <td style={styles.td}>{toNumber(batch.current_qty).toLocaleString()}</td>
                        <td style={styles.td}>
                          <span
                            style={{
                              ...styles.statusPill,
                              background: statusMeta.bg,
                              color: statusMeta.color,
                              borderColor: statusMeta.border,
                            }}
                          >
                            {statusMeta.label}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.actionRow}>
                            <button
                              onClick={() => openEdit(batch)}
                              style={styles.editBtn}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => deleteBatch(batch.id)}
                              style={styles.deleteBtn}
                            >
                              Delete
                            </button>
                          </div>
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

      {editOpen ? (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHead}>
              <div>
                <h3 style={styles.modalTitle}>Edit Batch #{editForm.id}</h3>
                <p style={styles.modalDesc}>แก้ไขข้อมูลรุ่นไก่</p>
              </div>
              <button onClick={closeEdit} style={styles.closeBtn}>
                ✕
              </button>
            </div>

            <div style={styles.editGrid}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Breed</label>
                <input
                  type="text"
                  value={editForm.breed}
                  onChange={(e) =>
                    setEditForm({ ...editForm, breed: e.target.value })
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>House</label>
                <select
                  value={editForm.house_id}
                  onChange={(e) =>
                    setEditForm({ ...editForm, house_id: e.target.value })
                  }
                  style={styles.input}
                >
                  {houses.map((house) => (
                    <option key={house.id} value={house.id}>
                      {house.name} (ID: {house.id})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Start Date</label>
                <input
                  type="date"
                  value={editForm.start_date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, start_date: e.target.value })
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>End Date</label>
                <input
                  type="date"
                  value={editForm.end_date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, end_date: e.target.value })
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm({ ...editForm, status: e.target.value })
                  }
                  style={styles.input}
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                  <option value="quarantine">quarantine</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Initial Qty</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.initial_qty}
                  onChange={(e) =>
                    setEditForm({ ...editForm, initial_qty: e.target.value })
                  }
                  style={styles.input}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Current Qty</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.current_qty}
                  onChange={(e) =>
                    setEditForm({ ...editForm, current_qty: e.target.value })
                  }
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.modalActions}>
              <button onClick={closeEdit} style={styles.cancelBtn}>
                Cancel
              </button>
              <button onClick={saveEdit} style={styles.saveBtn}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      ) : null}
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
    background: "#fee7aa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#000000",
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
    maxWidth: 700,
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
  formCard: {
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
  },
  sectionHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 18,
    flexWrap: "wrap",
  },
  sectionTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
    color: "#0f172a",
  },
  sectionDesc: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: 14,
    lineHeight: 1.6,
    maxWidth: 720,
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
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
    marginBottom: 14,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    fontSize: 13,
    color: "#475569",
    fontWeight: 700,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid #d1d5db",
    background: "#f8fafc",
    fontSize: 14,
    outline: "none",
  },
  noteRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  noteChip: {
    background: "#f1f5f9",
    color: "#475569",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 13,
    fontWeight: 700,
  },
  addBtn: {
    background: "#000000",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "12px 18px",
    fontWeight: 700,
    cursor: "pointer",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 980,
  },
  th: {
    textAlign: "left",
    padding: "12px 10px",
    borderBottom: "1px solid #e5e7eb",
    color: "#64748b",
    fontSize: 13,
    textTransform: "uppercase",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "14px 10px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 14,
    verticalAlign: "middle",
  },
  tdStrong: {
    padding: "14px 10px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 14,
    fontWeight: 700,
  },
  statusPill: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "6px 10px",
    fontSize: 12,
    fontWeight: 700,
    border: "1px solid",
  },
  actionRow: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },
  editBtn: {
    background: "#e0f2fe",
    color: "#075985",
    border: "none",
    borderRadius: 10,
    padding: "8px 12px",
    cursor: "pointer",
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
  loading: {
    padding: 40,
    textAlign: "center",
    color: "#64748b",
    fontWeight: 600,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 1000,
  },
  modalCard: {
    width: "100%",
    maxWidth: 860,
    background: "#ffffff",
    borderRadius: 20,
    padding: 22,
    boxShadow: "0 20px 40px rgba(0,0,0,0.18)",
  },
  modalHead: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 18,
  },
  modalTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
    color: "#0f172a",
  },
  modalDesc: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: 14,
  },
  closeBtn: {
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    borderRadius: 10,
    width: 36,
    height: 36,
    cursor: "pointer",
    fontWeight: 700,
  },
  editGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 14,
    marginBottom: 18,
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap",
  },
  cancelBtn: {
    background: "#f1f5f9",
    color: "#475569",
    border: "none",
    borderRadius: 12,
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 700,
  },
  saveBtn: {
    background: "#0f5c2e",
    color: "#fff",
    border: "none",
    borderRadius: 12,
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 700,
  },
};