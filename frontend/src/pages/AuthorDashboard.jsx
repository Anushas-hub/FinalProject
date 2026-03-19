import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ProfileSection from "../components/author/AuthorProfile";
import UploadSection from "../components/author/UploadMaterial";
import QuizSection from "../components/author/CreateQuiz";
import LeaderboardSection from "../components/author/Leaderboard";
import NotificationSection from "../components/author/Notifications";
import AuthorMaterials from "../components/author/AuthorMaterials"; // ✅ NEW

export default function AuthorDashboard() {
  const navigate = useNavigate();
  const user = localStorage.getItem("user");
  const role = localStorage.getItem("role");

  const [activeSection, setActiveSection] = useState("profile");

  const [profile, setProfile] = useState({
    name: "",
    image: null
  });

  const [refreshSidebar, setRefreshSidebar] = useState(false);

  useEffect(() => {
    if (!user) navigate("/login");
    if (role !== "author") navigate("/");
  }, [user, role, navigate]);

  useEffect(() => {
    if (!user) return;

    fetch(`http://127.0.0.1:8000/api/author-profile/${user}/`)
      .then(res => res.json())
      .then(data => {
        setProfile({
          name: data.name || user,
          image: data.profile_image
        });
      });
  }, [user, refreshSidebar]);

  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshSidebar(prev => !prev);
    };

    window.addEventListener("profileUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("profileUpdated", handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSection />;
      case "upload":
        return <UploadSection />;
      case "materials": // ✅ NEW
        return <AuthorMaterials />;
      case "quiz":
        return <QuizSection />;
      case "leaderboard":
        return <LeaderboardSection />;
      case "notifications":
        return <NotificationSection />;
      default:
        return <ProfileSection />;
    }
  };

  if (!user || role !== "author") return null;

  return (
    <div style={styles.page}>
      
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

        <div style={styles.sidebar}>
          <div style={styles.profileBox}>

            {profile.image ? (
              <img
                src={profile.image}
                alt="profile"
                style={styles.avatarImage}
              />
            ) : (
              <div style={styles.avatar}>
                {user.charAt(0).toUpperCase()}
              </div>
            )}

            <h3 style={{ marginTop: "10px" }}>
              {profile.name || user}
            </h3>

            <p style={styles.roleText}>Author Account</p>
          </div>

          <button style={styles.menuBtn} onClick={() => setActiveSection("profile")}>
            Profile
          </button>

          <button style={styles.menuBtn} onClick={() => setActiveSection("upload")}>
            Upload Material
          </button>

          {/* ✅ NEW BUTTON */}
          <button style={styles.menuBtn} onClick={() => setActiveSection("materials")}>
            My Materials
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

        <div style={styles.mainContent}>
          <div style={styles.contentArea}>
            {renderSection()}
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

  wrapper: {
    display: "flex",
    marginTop: "25px",
    padding: "0 40px",
  },

  sidebar: {
    width: "260px",
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

  avatarImage: {
    width: "70px",
    height: "70px",
    borderRadius: "50%",
    objectFit: "cover",
    margin: "0 auto"
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

  contentArea: {
    maxWidth: "1000px",
    margin: "0 auto",
  },
};