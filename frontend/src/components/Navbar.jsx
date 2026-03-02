import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>SmartStudy</div>

      <ul style={styles.menu}>
        <li><Link to="/" style={styles.link}>Home</Link></li>
        <li><Link to="/materials" style={styles.link}>Study Material</Link></li>
        <li><Link to="/pyq" style={styles.link}>Previous Year Question Papers</Link></li>
        <li>
          <Link to="/login" style={styles.loginBtn}>
            Login / Signup
          </Link>
        </li>
      </ul>
    </nav>
  );
}

const styles = {
  nav: {
    height: "70px",
    padding: "0 60px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#ffffff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    fontFamily: "Arial, sans-serif",
  },
  logo: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#2563eb", // blue theme
  },
  menu: {
    listStyle: "none",
    display: "flex",
    gap: "30px",
    alignItems: "center",
  },
  link: {
    textDecoration: "none",
    color: "#374151",
    fontSize: "16px",
    fontWeight: "500",
  },
  loginBtn: {
    textDecoration: "none",
    padding: "8px 20px",
    borderRadius: "20px",
    background: "#2563eb",
    color: "#fff",
    fontSize: "14px",
    fontWeight: "500",
  },
};