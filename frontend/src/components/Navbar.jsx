import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <div style={styles.logo}>SmartStudy</div>

      <ul style={styles.menu}>
        <li><Link to="/" style={styles.link}>Home</Link></li>
        <li><Link to="/materials" style={styles.link}>Study Material</Link></li>
        <li><Link to="/pyq" style={styles.link}>Previous Year Question Papers</Link></li>
        <li><Link to="/login" style={styles.login}>Login / Signup</Link></li>
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
  },
  logo: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#2e7d32",
  },
  menu: {
    listStyle: "none",
    display: "flex",
    gap: "30px",
    alignItems: "center",
  },
  link: {
    textDecoration: "none",
    color: "#444",
    fontSize: "16px",
  },
  login: {
    textDecoration: "none",
    padding: "8px 18px",
    borderRadius: "20px",
    background: "#2e7d32",
    color: "#fff",
    fontSize: "15px",
  },
};