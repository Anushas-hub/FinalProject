import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const user = localStorage.getItem("user");
  const role = localStorage.getItem("role");

  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }

    if (role !== "student") {
      navigate("/");
    }
  }, [user, role, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
    window.location.reload();
  };

  if (!user || role !== "student") return null;

  return (
    <div style={styles.wrapper}>
      
      {/* SIDE PANEL */}
      <div style={styles.sidebar}>
        <div style={styles.profileBox}>
          <div style={styles.avatar}>
            {user.charAt(0).toUpperCase()}
          </div>
          <h3 style={{ margin: "10px 0 0 0" }}>{user}</h3>
          <p style={{ fontSize: "13px", color: "#64748b" }}>
            Student Account
          </p>
        </div>

        <button style={styles.menuBtn} onClick={() => setActiveSection("viewed")}>
          Viewed Topics
        </button>

        <button style={styles.menuBtn} onClick={() => setActiveSection("quiz")}>
          Quiz % (Last 5 Days)
        </button>

        <button style={styles.menuBtn} onClick={() => setActiveSection("cert")}>
          Certifications
        </button>

        <button style={styles.menuBtn} onClick={() => setActiveSection("leaderboard")}>
          Leaderboard
        </button>

        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div style={styles.mainContent}>
        
        {/* Top Bar */}
        <div style={styles.topBar}>
          <button style={styles.homeBtn} onClick={() => navigate("/")}>
            Home
          </button>
        </div>

        {/* Search Section */}
        <div style={styles.searchSection}>
          <input
            type="text"
            placeholder="Search topics, study materials, courses..."
            style={styles.searchInput}
          />
          <button style={styles.searchBtn}>Search</button>
        </div>

        {/* Dynamic Content */}
        <div style={styles.contentArea}>
          {activeSection === "home" && (
            <>
              <h2 style={styles.heading}>Suggested Study Materials</h2>
              <div style={styles.cardGrid}>
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} style={styles.card}>
                    <h4>Recommended Topic {item}</h4>
                    <p>High quality notes & quizzes available.</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeSection === "viewed" && (
            <h2 style={styles.heading}>Your Viewed Topics</h2>
          )}

          {activeSection === "quiz" && (
            <h2 style={styles.heading}>Quiz Performance: 78%</h2>
          )}

          {activeSection === "cert" && (
            <h2 style={styles.heading}>Your Certifications</h2>
          )}

          {activeSection === "leaderboard" && (
            <h2 style={styles.heading}>Leaderboard Position</h2>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "Arial, sans-serif",
    background: "linear-gradient(135deg, #f0f9ff 0%, #f5f3ff 50%, #ecfdf5 100%)"
  },

  sidebar: {
    width: "260px",
    background: "#ffffff",
    padding: "30px 20px",
    boxShadow: "4px 0 15px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "15px"
  },

  profileBox: {
    textAlign: "center",
    marginBottom: "20px"
  },

  avatar: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#4f46e5,#06b6d4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "26px",
    margin: "0 auto"
  },

  menuBtn: {
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#f3f4f6",
    cursor: "pointer",
    fontWeight: "500"
  },

  logoutBtn: {
    marginTop: "auto",
    padding: "10px",
    borderRadius: "8px",
    border: "none",
    background: "#ef4444",
    color: "#fff",
    cursor: "pointer",
    fontWeight: "500"
  },

  mainContent: {
    flex: 1,
    padding: "40px"
  },

  topBar: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "30px"
  },

  homeBtn: {
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    padding: "8px 18px",
    borderRadius: "20px",
    cursor: "pointer"
  },

  searchSection: {
    maxWidth: "800px",
    margin: "0 auto 40px auto",
    display: "flex",
    borderRadius: "50px",
    overflow: "hidden",
    background: "#ffffff",
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)"
  },

  searchInput: {
    flex: 1,
    padding: "16px 25px",
    border: "none",
    outline: "none",
    fontSize: "16px"
  },

  searchBtn: {
    padding: "0 35px",
    border: "none",
    background: "#4f46e5",
    color: "#ffffff",
    fontSize: "15px",
    cursor: "pointer"
  },

  contentArea: {
    maxWidth: "1000px",
    margin: "0 auto"
  },

  heading: {
    marginBottom: "25px",
    color: "#1e293b"
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "25px"
  },

  card: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)"
  }
};