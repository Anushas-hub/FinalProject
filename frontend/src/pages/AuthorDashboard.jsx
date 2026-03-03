import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthorDashboard() {
  const navigate = useNavigate();
  const user = localStorage.getItem("user");
  const role = localStorage.getItem("role");

  const [activeSection, setActiveSection] = useState("profile");

  useEffect(() => {
    if (!user) navigate("/login");
    if (role !== "author") navigate("/");
  }, [user, role, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!user || role !== "author") return null;

  return (
    <div style={styles.page}>
      
      {/* HERO */}
      <div style={styles.hero}>
        <div>
          <h1 style={styles.heroTitle}>Author Dashboard</h1>
          <p style={styles.heroSubtitle}>SmartStudy</p>
        </div>

        <button
          style={styles.heroHomeBtn}
          onClick={() => navigate("/")}
        >
          Home
        </button>
      </div>

      <div style={styles.wrapper}>

        {/* SIDEBAR */}
        <div style={styles.sidebar}>
          <div style={styles.profileBox}>
            <div style={styles.avatar}>
              {user.charAt(0).toUpperCase()}
            </div>
            <h3 style={{ marginTop: "10px" }}>{user}</h3>
            <p style={styles.roleText}>Author Account</p>
          </div>

          <button style={styles.menuBtn} onClick={() => setActiveSection("profile")}>
            Profile
          </button>

          <button style={styles.menuBtn} onClick={() => setActiveSection("upload")}>
            Upload Material
          </button>

          <button style={styles.menuBtn} onClick={() => setActiveSection("quiz")}>
            Create Quiz
          </button>

          <button style={styles.menuBtn} onClick={() => setActiveSection("leaderboard")}>
            Leaderboard
          </button>

          <button style={styles.menuBtn} onClick={() => setActiveSection("notifications")}>
            Notifications
          </button>

          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div style={styles.mainContent}>
          <div style={styles.contentArea}>

            {activeSection === "profile" && (
              <>
                <h2 style={styles.heading}>Profile Information</h2>

                <div style={styles.profileCard}>
                  
                  {/* BLUE COVER WITH TITLE */}
                  <div style={styles.coverImage}>
                    <h2 style={styles.coverTitle}>
                      About {user}
                    </h2>
                  </div>

                  <div style={styles.profileTop}>
                    <div style={styles.largeAvatar}>
                      {user.charAt(0).toUpperCase()}
                    </div>

                    <div>
                      <h3>{user}</h3>
                      <p style={{ color: "#64748b" }}>
                        Professional Educator & Content Creator
                      </p>
                    </div>
                  </div>

                  <div style={styles.statsRow}>
                    <div><strong>1.2K</strong><br />Followers</div>
                    <div><strong>450</strong><br />Credits</div>
                    <div><strong>35</strong><br />Uploads</div>
                  </div>

                  <div style={styles.infoGrid}>
                    <div>
                      <strong>Education:</strong>
                      <p>M.Tech Computer Science</p>
                    </div>

                    <div>
                      <strong>Experience:</strong>
                      <p>5 Years Teaching Experience</p>
                    </div>

                    <div>
                      <strong>Skills:</strong>
                      <p>Python, Django, React</p>
                    </div>

                    <div>
                      <strong>Email:</strong>
                      <p>author@email.com</p>
                    </div>
                  </div>

                </div>
              </>
            )}

            {activeSection === "upload" && (
              <>
                <h2 style={styles.heading}>Upload Study Material</h2>
                <div style={styles.card}>
                  Upload PDFs, Notes, Videos and more.
                </div>
              </>
            )}

            {activeSection === "quiz" && (
              <>
                <h2 style={styles.heading}>Create Quiz</h2>
                <div style={styles.card}>
                  Create interactive quizzes for students.
                </div>
              </>
            )}

            {activeSection === "leaderboard" && (
              <>
                <h2 style={styles.heading}>Leaderboard</h2>
                <div style={styles.card}>
                  Top performing authors appear here.
                </div>
              </>
            )}

            {activeSection === "notifications" && (
              <>
                <h2 style={styles.heading}>Notifications</h2>
                <div style={styles.card}>
                  Comments and questions on your content.
                </div>
              </>
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

  hero: {
    background: "#4f46e5",
    color: "#ffffff",
    padding: "18px 60px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  heroTitle: { margin: 0, fontSize: "34px", fontWeight: "700" },
  heroSubtitle: { marginTop: "6px", fontSize: "16px", opacity: 0.9 },

  heroHomeBtn: {
    padding: "10px 25px",
    borderRadius: "25px",
    border: "none",
    background: "#ffffff",
    color: "#4f46e5",
    fontWeight: "600",
    cursor: "pointer",
  },

  wrapper: { display: "flex", marginTop: "25px", padding: "0 40px" },

  sidebar: {
    width: "260px",
    background: "#ffffff",
    padding: "30px 20px",
    boxShadow: "4px 0 15px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  profileBox: { textAlign: "center", marginBottom: "20px" },

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

  roleText: { fontSize: "13px", color: "#64748b" },

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

  mainContent: { flex: 1, padding: "40px" },

  contentArea: { maxWidth: "1000px", margin: "0 auto" },

  heading: { marginBottom: "25px", color: "#1e293b" },

  profileCard: {
    background: "#ffffff",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  },

  coverImage: {
    height: "140px",
    borderRadius: "12px",
    background: "linear-gradient(135deg,#4f46e5,#06b6d4)",
    marginBottom: "25px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  coverTitle: {
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: "700",
  },

  profileTop: { display: "flex", gap: "20px", alignItems: "center" },

  largeAvatar: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    background: "#4f46e5",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "32px",
  },

  statsRow: {
    display: "flex",
    justifyContent: "space-around",
    margin: "25px 0",
    textAlign: "center",
  },

  infoGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px",
  },

  card: {
    background: "#ffffff",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  },
};