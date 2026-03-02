import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(localStorage.getItem("user"));
  const [showProfile, setShowProfile] = useState(false);
  const [visitCount, setVisitCount] = useState(1);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const count = parseInt(localStorage.getItem("visitCount") || "0") + 1;
    localStorage.setItem("visitCount", count);
    setVisitCount(count);
  }, []);

  useEffect(() => {
    if (user) {
      fetch("http://127.0.0.1:8000/api/user-stats/")
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
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
          <div style={styles.profileWrapper}>
            <div
              style={styles.profileIcon}
              onClick={() => setShowProfile(!showProfile)}
            >
              {user.charAt(0).toUpperCase()}
            </div>

            {showProfile && (
              <div style={styles.profileCard}>
                <h4 style={{ margin: 0 }}>{user}</h4>

                <button style={styles.menuBtn}>Viewed Topics</button>
                <button style={styles.menuBtn}>Certifications</button>
                <button style={styles.menuBtn}>Profile</button>
                <button style={styles.menuBtn}>Notes Completed</button>
                <button style={styles.menuBtn}>Your Leaderboard</button>

                <div style={styles.statsBox}>
                  Quiz Attempt (5 days):{" "}
                  {stats ? stats.quiz_percentage + "%" : "Loading..."}
                </div>

                <button style={styles.logoutBtn} onClick={handleLogout}>
                  {visitCount > 2 ? "Logout" : "Sign Out"}
                </button>
              </div>
            )}
          </div>
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

  profileWrapper: {
    position: "relative"
  },

  profileIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#4f46e5,#06b6d4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer"
  },

  profileCard: {
    position: "absolute",
    right: 0,
    top: "48px",
    width: "250px",
    background: "#ffffff",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    zIndex: 100
  },

  menuBtn: {
    background: "#f3f4f6",
    border: "none",
    padding: "8px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px"
  },

  statsBox: {
    fontSize: "13px",
    marginTop: "4px",
    color: "#475569"
  },

  logoutBtn: {
    marginTop: "10px",
    background: "#3556f8",
    color: "#fff",
    border: "none",
    padding: "8px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500"
  }
};