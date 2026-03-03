import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const user = localStorage.getItem("user");
  const role = localStorage.getItem("role");

  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    if (!user) navigate("/login");
    if (role !== "student") navigate("/");
  }, [user, role, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!user || role !== "student") return null;

  return (
    <div style={styles.page}>
      
      {/* 🔵 HERO SECTION */}
      <div style={styles.hero}>
        <div>
          <h1 style={styles.heroTitle}>Student Dashboard</h1>
          <p style={styles.heroSubtitle}>SmartStudy</p>
        </div>

        <button
          style={styles.heroHomeBtn}
          onClick={() => navigate("/")}
        >
          Home
        </button>
      </div>

      {/* 🔽 MAIN SECTION STARTS JUST BELOW HERO */}
      <div style={styles.wrapper}>

        {/* SIDEBAR */}
        <div style={styles.sidebar}>
          <div style={styles.profileBox}>
            <div style={styles.avatar}>
              {user.charAt(0).toUpperCase()}
            </div>
            <h3 style={{ marginTop: "10px" }}>{user}</h3>
            <p style={styles.roleText}>Student Account</p>
          </div>

          <button
            style={styles.menuBtn}
            onClick={() => setActiveSection("viewed")}
          >
            Viewed Topics
          </button>

          <button
            style={styles.menuBtn}
            onClick={() => setActiveSection("quiz")}
          >
Attemted Quizzes          </button>

          <button
            style={styles.menuBtn}
            onClick={() => setActiveSection("cert")}
          >
            Certifications
          </button>

          <button
            style={styles.menuBtn}
            onClick={() => setActiveSection("leaderboard")}
          >
            Leaderboard
          </button>

          {/* 🔴 RED LOGOUT AT BOTTOM */}
          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div style={styles.mainContent}>

          {/* SEARCH */}
          <div style={styles.searchSection}>
            <input
              type="text"
              placeholder="Search topics, study materials, courses..."
              style={styles.searchInput}
            />
            <button style={styles.searchBtn}>Search</button>
          </div>

          {/* CONTENT */}
          <div style={styles.contentArea}>
            {activeSection === "home" && (
              <>
                <h2 style={styles.heading}>
                  Suggested Study Materials
                </h2>

                <div style={styles.cardGrid}>
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} style={styles.card}>
                      <h4>Recommended Topic {item}</h4>
                      <p>
                        High quality notes & quizzes available.
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {activeSection === "viewed" && (
              <h2 style={styles.heading}>Your Viewed Topics</h2>
            )}

            {activeSection === "quiz" && (
              <h2 style={styles.heading}>
               Your Attemted Quizzes              </h2>
            )}

            {activeSection === "cert" && (
              <h2 style={styles.heading}>Your Certifications</h2>
            )}

            {activeSection === "leaderboard" && (
              <h2 style={styles.heading}>
                Leaderboard 
              </h2>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f0f9ff 0%, #f5f3ff 50%, #ecfdf5 100%)",
  },

  /* 🔵 HERO */
 hero: {
  background: "#4f46e5",
  color: "#ffffff",
  padding: "18px 20px",
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
},
  heroTitle: {
    margin: 0,
    fontSize: "34px",
    fontWeight: "700",
  },

  heroSubtitle: {
    marginTop: "6px",
    fontSize: "16px",
    opacity: 0.9,
  },

  heroHomeBtn: {
    padding: "10px 25px",
    borderRadius: "25px",
    border: "none",
    background: "#ffffff",
    color: "#4f46e5",
    fontWeight: "600",
    cursor: "pointer",
  },

  /* MAIN */
 wrapper: {
  display: "flex",
  flexWrap: "wrap",
  marginTop: "25px",
  padding: "0 20px",
},

 sidebar: {
  width: "260px",
  minWidth: "220px",
  background: "#ffffff",
  padding: "30px 20px",
  boxShadow: "4px 0 15px rgba(0,0,0,0.05)",
  display: "flex",
  flexDirection: "column",
  gap: "15px",
},

  profileBox: {
    textAlign: "center",
    marginBottom: "20px",
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
    margin: "0 auto",
  },

  roleText: {
    fontSize: "13px",
    color: "#64748b",
  },

  menuBtn: {
    padding: "16px",
    borderRadius: "20px",
    border: "none",
    background: "#ffffff",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },

  logoutBtn: {
    marginTop: "auto",
    padding: "16px",
    borderRadius: "20px",
    border: "none",
    background: "red",
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
  },

  mainContent: {
    flex: 1,
    padding: "40px",
  },

  searchSection: {
    maxWidth: "800px",
    margin: "0 auto 40px auto",
    display: "flex",
    borderRadius: "50px",
    overflow: "hidden",
    background: "#ffffff",
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
  },

  searchInput: {
    flex: 1,
    padding: "16px 25px",
    border: "none",
    outline: "none",
    fontSize: "16px",
  },

  searchBtn: {
    padding: "0 35px",
    border: "none",
    background: "#4f46e5",
    color: "#ffffff",
    fontSize: "15px",
    cursor: "pointer",
  },

  contentArea: {
    maxWidth: "1000px",
    margin: "0 auto",
  },

  heading: {
    marginBottom: "25px",
    color: "#1e293b",
  },

  cardGrid: {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
  gap: "25px",
},

  card: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  },
};