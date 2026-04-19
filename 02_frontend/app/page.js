import Link from "next/link";

const menus = [
  { href: "/dashboard_agriintel", label: "Dashboard", desc: "ภาพรวมข้อมูลทั้งหมดของระบบ", icon: "📊" },
  { href: "/farm_management_agriintel", label: "Farm Management", desc: "จัดการข้อมูลฟาร์ม", icon: "🌾" },
  { href: "/house_management_agriintel", label: "House Management", desc: "จัดการข้อมูลโรงเรือน", icon: "🏠" },
  { href: "/batch_management_agriintel", label: "Batch Management", desc: "จัดการข้อมูลรุ่นการเลี้ยง", icon: "🐔" },
  { href: "/employee_management_agriintel", label: "Employee Management", desc: "จัดการข้อมูลพนักงาน", icon: "👨‍🌾" },
  { href: "/production_management_agriintel", label: "Production Management", desc: "ติดตามผลผลิตและการผลิต", icon: "🥚" },
  { href: "/login_agriintel", label: "Login", desc: "เข้าสู่ระบบเพื่อใช้งาน", icon: "🔐" },
  { href: "/verdant_layer", label: "Verdant Layer", desc: "ระบบย่อยเพิ่มเติม", icon: "🌿" },
];

export default function HomePage() {
  return (
    <main style={styles.page}>
      <div style={styles.overlay} />

      <section style={styles.container}>
        <div style={styles.heroCard}>
          <div style={styles.heroLeft}>
            <span style={styles.badge}>AgriIntel System</span>
            <h1 style={styles.title}>AgriIntel Farm Management</h1>
            <p style={styles.subtitle}>
              ระบบจัดการฟาร์มอัจฉริยะสำหรับดูแลข้อมูลฟาร์ม โรงเรือน รุ่นการเลี้ยง
              พนักงาน และผลผลิตในที่เดียว
            </p>

            <div style={styles.actionRow}>
              <Link href="/login_agriintel" style={styles.primaryButton}>
                เข้าใช้งานระบบ
              </Link>
              <Link href="/dashboard_agriintel" style={styles.secondaryButton}>
                ไปที่ Dashboard
              </Link>
            </div>
          </div>

          <div style={styles.heroRight}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>8</div>
              <div style={styles.statLabel}>Main Modules</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>100%</div>
              <div style={styles.statLabel}>Ready to Manage</div>
            </div>
          </div>
        </div>

        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>เมนูหลัก</h2>
          <p style={styles.sectionText}>เลือกหน้าที่ต้องการเข้าใช้งาน</p>
        </div>

        <div style={styles.grid}>
          {menus.map((menu) => (
            <Link key={menu.href} href={menu.href} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.iconWrap}>{menu.icon}</div>
                <span style={styles.openText}>Open →</span>
              </div>

              <h3 style={styles.cardTitle}>{menu.label}</h3>
              <p style={styles.cardDesc}>{menu.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    position: "relative",
    background: "linear-gradient(135deg, #0f172a 0%, #1e293b 45%, #14532d 100%)",
    fontFamily: "Arial, sans-serif",
    padding: "32px 20px",
    overflow: "hidden",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(circle at top left, rgba(34,197,94,0.18), transparent 28%), radial-gradient(circle at bottom right, rgba(59,130,246,0.14), transparent 30%)",
  },
  container: {
    position: "relative",
    zIndex: 2,
    maxWidth: "1200px",
    margin: "0 auto",
  },
  heroCard: {
    display: "grid",
    gridTemplateColumns: "1.4fr 0.8fr",
    gap: "20px",
    padding: "32px",
    borderRadius: "24px",
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.14)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
    marginBottom: "28px",
  },
  heroLeft: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  badge: {
    display: "inline-block",
    width: "fit-content",
    padding: "8px 14px",
    borderRadius: "999px",
    background: "rgba(255,255,255,0.12)",
    color: "#dcfce7",
    fontSize: "13px",
    fontWeight: "700",
    marginBottom: "18px",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  title: {
    color: "#ffffff",
    fontSize: "42px",
    lineHeight: 1.15,
    fontWeight: "800",
    margin: "0 0 14px 0",
  },
  subtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: "16px",
    lineHeight: 1.7,
    margin: 0,
    maxWidth: "700px",
  },
  actionRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "24px",
  },
  primaryButton: {
    textDecoration: "none",
    background: "linear-gradient(135deg, #22c55e, #15803d)",
    color: "#fff",
    padding: "13px 20px",
    borderRadius: "12px",
    fontWeight: "700",
    boxShadow: "0 10px 24px rgba(34,197,94,0.25)",
  },
  secondaryButton: {
    textDecoration: "none",
    background: "rgba(255,255,255,0.1)",
    color: "#fff",
    padding: "13px 20px",
    borderRadius: "12px",
    fontWeight: "700",
    border: "1px solid rgba(255,255,255,0.14)",
  },
  heroRight: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    justifyContent: "center",
  },
  statCard: {
    background: "rgba(255,255,255,0.1)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "20px",
    padding: "24px",
    color: "#fff",
    textAlign: "center",
  },
  statNumber: {
    fontSize: "34px",
    fontWeight: "800",
    marginBottom: "8px",
  },
  statLabel: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.78)",
  },
  sectionHeader: {
    marginBottom: "18px",
    padding: "4px 4px 0 4px",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: "28px",
    fontWeight: "800",
    margin: "0 0 6px 0",
  },
  sectionText: {
    color: "rgba(255,255,255,0.75)",
    margin: 0,
    fontSize: "15px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "18px",
  },
  card: {
    display: "block",
    textDecoration: "none",
    color: "inherit",
    background: "#ffffff",
    borderRadius: "20px",
    padding: "22px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 12px 30px rgba(15,23,42,0.12)",
    minHeight: "170px",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "18px",
  },
  iconWrap: {
    width: "52px",
    height: "52px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    background: "linear-gradient(135deg, #dcfce7, #bbf7d0)",
  },
  openText: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#16a34a",
  },
  cardTitle: {
    margin: "0 0 8px 0",
    fontSize: "20px",
    color: "#0f172a",
    fontWeight: "800",
  },
  cardDesc: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.6,
  },
};