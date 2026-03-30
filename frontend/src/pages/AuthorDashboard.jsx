import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ProfileSection from "../components/author/AuthorProfile";
import UploadSection from "../components/author/UploadMaterial";
import QuizSection from "../components/author/CreateQuiz";
import LeaderboardSection from "../components/author/Leaderboard";
import NotificationSection from "../components/author/Notifications";
import AuthorMaterials from "../components/author/AuthorMaterials";

export default function AuthorDashboard() {
  const navigate = useNavigate();
  const user = localStorage.getItem("user");
  const role = localStorage.getItem("role");

  const [activeSection, setActiveSection] = useState("profile");

  const [profile, setProfile] = useState({
    name: "",
    image: null,
  });

  const [refreshSidebar, setRefreshSidebar] = useState(false);

  // 🆕 followers state
  const [followers, setFollowers] = useState([]);
  const [followerCount, setFollowerCount] = useState(0);
  const [followersLoading, setFollowersLoading] = useState(false);

  useEffect(() => {
    if (!user) navigate("/login");
    if (role !== "author") navigate("/");
  }, [user, role, navigate]);

  useEffect(() => {
    if (!user) return;

    fetch(`http://127.0.0.1:8000/api/author-profile/${user}/`)
      .then((res) => res.json())
      .then((data) => {
        setProfile({
          name: data.name || user,
          image: data.profile_image,
        });
        setFollowerCount(data.follower_count || 0);
      });
  }, [user, refreshSidebar]);

  useEffect(() => {
    const handleStorageChange = () => {
      setRefreshSidebar((prev) => !prev);
    };
    window.addEventListener("profileUpdated", handleStorageChange);
    return () => {
      window.removeEventListener("profileUpdated", handleStorageChange);
    };
  }, []);

  // 🆕 fetch followers list
  const fetchFollowers = () => {
    setFollowersLoading(true);
    fetch(`http://127.0.0.1:8000/api/author-followers/${user}/`)
      .then((res) => res.json())
      .then((data) => {
        setFollowers(data.followers || []);
        setFollowerCount(data.follower_count || 0);
        setFollowersLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setFollowersLoading(false);
      });
  };

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
      case "materials":
        return <AuthorMaterials />;
      case "quiz":
        return <QuizSection />;
      case "leaderboard":
        return <LeaderboardSection />;
      case "notifications":
        return <NotificationSection />;
      case "followers":
        return <FollowersSection
                  followers={followers}
                  followerCount={followerCount}
                  loading={followersLoading}
               />;
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
        <button style={styles.heroHomeBtn} onClick={() => navigate("/")}>
          Home
        </button>
      </div>

      <div style={styles.wrapper}>

        {/* SIDEBAR */}
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
            <h3 style={{ marginTop: "10px" }}>{profile.name || user}</h3>
            <p style={styles.roleText}>Author Account</p>

            {/* 🆕 Follower count pill in sidebar */}
            <div style={styles.followerPill}>
              👥 {followerCount} Followers
            </div>
          </div>

          <button
            style={activeSection === "profile" ? styles.menuBtnActive : styles.menuBtn}
            onClick={() => setActiveSection("profile")}
          >
            Profile
          </button>

          <button
            style={activeSection === "upload" ? styles.menuBtnActive : styles.menuBtn}
            onClick={() => setActiveSection("upload")}
          >
            Upload Material
          </button>

          <button
            style={activeSection === "materials" ? styles.menuBtnActive : styles.menuBtn}
            onClick={() => setActiveSection("materials")}
          >
            My Materials
          </button>

          <button
            style={activeSection === "quiz" ? styles.menuBtnActive : styles.menuBtn}
            onClick={() => setActiveSection("quiz")}
          >
            Create Quiz
          </button>

          {/* 🆕 Followers button */}
          <button
            style={activeSection === "followers" ? styles.menuBtnActive : styles.menuBtn}
            onClick={() => {
              setActiveSection("followers");
              fetchFollowers();
            }}
          >
            My Followers
          </button>

          <button
            style={activeSection === "leaderboard" ? styles.menuBtnActive : styles.menuBtn}
            onClick={() => setActiveSection("leaderboard")}
          >
            Leaderboard
          </button>

          <button
            style={activeSection === "notifications" ? styles.menuBtnActive : styles.menuBtn}
            onClick={() => setActiveSection("notifications")}
          >
            Notifications
          </button>

          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>

        </div>

        {/* MAIN CONTENT */}
        <div style={styles.mainContent}>
          <div style={styles.contentArea}>
            {renderSection()}
          </div>
        </div>

      </div>
    </div>
  );
}


// ===================== 🆕 FOLLOWERS SECTION COMPONENT =====================

function FollowersSection({ followers, followerCount, loading }) {
  return (
    <div>

      {/* Header */}
      <div style={fStyles.header}>
        <h2 style={fStyles.heading}>My Followers</h2>
        <div style={fStyles.countBadge}>
          {followerCount} Total
        </div>
      </div>

      {loading && (
        <p style={fStyles.msg}>Loading followers...</p>
      )}

      {!loading && followers.length === 0 && (
        <div style={fStyles.emptyBox}>
          <p style={fStyles.emptyText}>No followers yet.</p>
          <p style={fStyles.emptySubText}>
            Keep uploading quality materials — students will follow you! 🚀
          </p>
        </div>
      )}

      {!loading && followers.length > 0 && (
        <div style={fStyles.grid}>
          {followers.map((f, index) => (
            <div key={index} style={fStyles.card}>

              {/* Avatar */}
              <div style={fStyles.avatar}>
                {f.username.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div style={fStyles.info}>
                <p style={fStyles.username}>{f.username}</p>
                <p style={fStyles.date}>
                  Followed on{" "}
                  {new Date(f.followed_at).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

// Followers section styles
const fStyles = {
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "25px",
    flexWrap: "wrap",
    gap: "12px",
  },
  heading: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  countBadge: {
    background: "#e0e7ff",
    color: "#4f46e5",
    padding: "8px 20px",
    borderRadius: "25px",
    fontSize: "14px",
    fontWeight: "700",
  },
  msg: {
    color: "#64748b",
    fontSize: "15px",
  },
  emptyBox: {
    textAlign: "center",
    padding: "60px 20px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  },
  emptyText: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 8px 0",
  },
  emptySubText: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "20px",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  avatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#4f46e5,#06b6d4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "20px",
    fontWeight: "700",
    flexShrink: 0,
  },
  info: {
    flex: 1,
  },
  username: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 4px 0",
  },
  date: {
    fontSize: "12px",
    color: "#94a3b8",
    margin: 0,
  },
};


// ===================== DASHBOARD STYLES =====================

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#f0f9ff 0%,#f5f3ff 50%,#ecfdf5 100%)",
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
    marginBottom: "10px",
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
    margin: "0 auto",
    display: "block",
  },
  roleText: { fontSize: "13px", color: "#64748b" },

  // 🆕 follower pill under profile
  followerPill: {
    marginTop: "8px",
    display: "inline-block",
    background: "#e0e7ff",
    color: "#4f46e5",
    padding: "5px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
  },

  menuBtn: {
    padding: "16px",
    borderRadius: "20px",
    border: "none",
    background: "#ffffff",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    textAlign: "left",
  },
  menuBtnActive: {
    padding: "16px",
    borderRadius: "20px",
    border: "none",
    background: "#e0e7ff",
    color: "#4f46e5",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
    textAlign: "left",
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
};