import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(localStorage.getItem("user"));

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    navigate("/");
    window.location.reload();
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <h2 style={styles.logo}>SmartStudy</h2>

        <div style={styles.links}>
          <Link style={styles.linkItem} to="/">Home</Link>
          <Link style={styles.linkItem} to="/study-material">Study Material</Link>
          <Link style={styles.linkItem} to="/pyqs">Previous Year Question Papers</Link>
        </div>

        {!user ? (
          <Link to="/login" style={styles.loginBtn}>
            Login / Signup
          </Link>
        ) : (
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    width: "100%",
    background: "#ffffff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
    position: "sticky",
    top: 0,
    zIndex: 1000
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px"
  },

  logo: {
    color: "#4f46e5",
    fontWeight: "700",
    margin: 0
  },

  links: {
    display: "flex",
    gap: "40px"
  },

  linkItem: {
    textDecoration: "none",
    color: "#334155",
    fontWeight: "500"
  },

  loginBtn: {
    background: "#4f46e5",
    color: "#fff",
    padding: "8px 18px",
    borderRadius: "20px",
    textDecoration: "none",
    fontWeight: "500"
  },

  logoutBtn: {
    background: "#ef4444",
    color: "#fff",
    padding: "8px 18px",
    borderRadius: "20px",
    border: "none",
    cursor: "pointer",
    fontWeight: "500"
  }
};