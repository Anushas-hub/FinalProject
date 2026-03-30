import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export default function StudentDashboard() {

  const navigate = useNavigate();
  const user = localStorage.getItem("user");
  const role = localStorage.getItem("role");

  const [activeSection, setActiveSection] = useState("home");

  // search
  const [searchTerm, setSearchTerm] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // existing sections
  const [viewedTopics, setViewedTopics] = useState([]);
  const [attemptedQuizzes, setAttemptedQuizzes] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  // 🆕 author materials
  const [authorMaterials, setAuthorMaterials] = useState([]);
  const [authorLoading, setAuthorLoading] = useState(false);
  const [followStatus, setFollowStatus] = useState({});

  useEffect(() => {
    if (!user) navigate("/login");
    if (role !== "student") navigate("/");
  }, [user, role, navigate]);

  /* FETCH SUBJECTS */
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/subjects/")
      .then((res) => res.json())
      .then((data) => setSubjects(data))
      .catch((err) => console.error(err));
  }, []);

  /* FETCH VIEWED TOPICS */
  const fetchViewedTopics = () => {
    fetch(`http://127.0.0.1:8000/api/viewed-topics/${user}/`)
      .then((res) => res.json())
      .then((data) => setViewedTopics(data))
      .catch((err) => console.error(err));
  };

  /* FETCH ATTEMPTED QUIZZES */
  const fetchAttemptedQuizzes = () => {
    fetch(`http://127.0.0.1:8000/api/attempted-quizzes/${user}/`)
      .then((res) => res.json())
      .then((data) => setAttemptedQuizzes(data))
      .catch((err) => console.error(err));
  };

  /* FETCH ANALYTICS */
  const fetchAnalytics = () => {
    fetch(`http://127.0.0.1:8000/api/student-analytics/${user}/`)
      .then((res) => res.json())
      .then((data) => setAnalytics(data))
      .catch((err) => console.error(err));
  };

  /* 🆕 FETCH AUTHOR MATERIALS */
  const fetchAuthorMaterials = (search = "") => {
    setAuthorLoading(true);
    const url = search
      ? `http://127.0.0.1:8000/api/author/public-materials/?search=${search}`
      : "http://127.0.0.1:8000/api/author/public-materials/";

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setAuthorMaterials(data);
        setAuthorLoading(false);

        // fetch follow status for each unique author
        const uniqueAuthors = [...new Set(data.map((m) => m.author_username))];
        uniqueAuthors.forEach((authorUsername) => {
          fetch(
            `http://127.0.0.1:8000/api/follow-status/${user}/${authorUsername}/`
          )
            .then((r) => r.json())
            .then((d) => {
              setFollowStatus((prev) => ({
                ...prev,
                [authorUsername]: d.following,
              }));
            })
            .catch(() => {});
        });
      })
      .catch((err) => {
        console.error(err);
        setAuthorLoading(false);
      });
  };

  /* 🆕 FOLLOW / UNFOLLOW */
  const handleFollowToggle = (authorUsername) => {
    const isFollowing = followStatus[authorUsername];
    const endpoint = isFollowing
      ? "http://127.0.0.1:8000/api/unfollow/"
      : "http://127.0.0.1:8000/api/follow/";

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ follower: user, author: authorUsername }),
    })
      .then((r) => r.json())
      .then(() => {
        setFollowStatus((prev) => ({
          ...prev,
          [authorUsername]: !isFollowing,
        }));
        setAuthorMaterials((prev) =>
          prev.map((m) => {
            if (m.author_username === authorUsername) {
              return {
                ...m,
                follower_count: isFollowing
                  ? m.follower_count - 1
                  : m.follower_count + 1,
              };
            }
            return m;
          })
        );
      })
      .catch((err) => console.error(err));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length > 0) {
      const filtered = subjects.filter((subject) =>
        subject.title.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (id, title) => {
    setSearchTerm(title);
    setSuggestions([]);
    navigate(`/study-material/${id}`);
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    const text = searchTerm.toLowerCase();
    const yearMatch = text.match(/\b(20\d{2})\b/);
    const year = yearMatch ? yearMatch[0] : "";

    if (
      text.includes("pyq") ||
      text.includes("previous year") ||
      text.includes("question")
    ) {
      let subject = text
        .replace("pyq", "")
        .replace("previous year", "")
        .replace("question", "")
        .replace(/\b20\d{2}\b/, "")
        .trim();
      navigate(`/previous-year-questions?subject=${subject}&year=${year}`);
      return;
    }

    // 🆕 if on author materials section — search within it
    if (activeSection === "authorMaterials") {
      fetchAuthorMaterials(searchTerm);
      return;
    }

    navigate(`/study-material?search=${searchTerm}`);
  };

  if (!user || role !== "student") return null;

  const chartData = analytics
    ? [
        { name: "Topics Viewed", value: analytics.topics_viewed },
        { name: "Quizzes Attempted", value: analytics.quizzes_attempted },
        { name: "Certifications", value: analytics.certifications },
      ]
    : [];

  const COLORS = ["#4f46e5", "#06b6d4", "#22c55e"];

  return (
    <div style={styles.page}>

      {/* HERO */}
      <div style={styles.hero}>
        <div>
          <h1 style={styles.heroTitle}>Student Dashboard</h1>
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
            <div style={styles.avatar}>
              {user.charAt(0).toUpperCase()}
            </div>
            <h3 style={{ marginTop: "10px" }}>{user}</h3>
            <p style={styles.roleText}>Student Account</p>
          </div>

          <button
            style={activeSection === "viewed" ? styles.menuBtnActive : styles.menuBtn}
            onClick={() => { setActiveSection("viewed"); fetchViewedTopics(); }}
          >
            Viewed Topics
          </button>

          <button
            style={activeSection === "quiz" ? styles.menuBtnActive : styles.menuBtn}
            onClick={() => { setActiveSection("quiz"); fetchAttemptedQuizzes(); }}
          >
            Attempted Quizzes
          </button>

          <button
            style={activeSection === "cert" ? styles.menuBtnActive : styles.menuBtn}
            onClick={() => setActiveSection("cert")}
          >
            Certifications
          </button>

          {/* 🆕 Author Materials button */}
          <button
            style={activeSection === "authorMaterials" ? styles.menuBtnActive : styles.menuBtn}
            onClick={() => {
              setActiveSection("authorMaterials");
              fetchAuthorMaterials();
            }}
          >
            Author Materials
          </button>

          <button
            style={activeSection === "leaderboard" ? styles.menuBtnActive : styles.menuBtn}
            onClick={() => { setActiveSection("leaderboard"); fetchAnalytics(); }}
          >
            Leaderboard
          </button>

          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>

        </div>

        {/* MAIN */}
        <div style={styles.mainContent}>

          {/* SEARCH */}
          <div style={{ position: "relative", maxWidth: "800px", margin: "0 auto 40px auto" }}>
            <div style={styles.searchSection}>
              <input
                type="text"
                placeholder={
                  activeSection === "authorMaterials"
                    ? "Search author materials by title or subject..."
                    : "Search topics, study materials, courses..."
                }
                style={styles.searchInput}
                value={searchTerm}
                onChange={handleChange}
              />
              <button style={styles.searchBtn} onClick={handleSearch}>
                Search
              </button>
            </div>

            {suggestions.length > 0 && activeSection !== "authorMaterials" && (
              <div style={styles.suggestionBox}>
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    style={styles.suggestionItem}
                    onClick={() => handleSuggestionClick(item.id, item.title)}
                  >
                    {item.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.contentArea}>

            {/* VIEWED TOPICS */}
            {activeSection === "viewed" && (
              <>
                <h2 style={styles.heading}>Your Viewed Topics</h2>
                <div style={styles.cardGrid}>
                  {viewedTopics.length === 0 && <p>No viewed topics yet.</p>}
                  {viewedTopics.map((topic, index) => (
                    <div
                      key={index}
                      style={styles.card}
                      onClick={() => navigate(`/study-material/${topic.subject_id}`)}
                    >
                      <h4>{topic.title}</h4>
                      <p>Last viewed: {new Date(topic.viewed_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ATTEMPTED QUIZZES */}
            {activeSection === "quiz" && (
              <>
                <h2 style={styles.heading}>Your Attempted Quizzes</h2>
                <div style={styles.cardGrid}>
                  {attemptedQuizzes.length === 0 && <p>No quiz attempts yet.</p>}
                  {attemptedQuizzes.map((quiz, index) => (
                    <div
                      key={index}
                      style={styles.card}
                      onClick={() => navigate(`/study-material/${quiz.subject_id}`)}
                    >
                      <h4>{quiz.quiz_title}</h4>
                      <p>Subject: {quiz.subject_title}</p>
                      <p>Score: {quiz.score} / {quiz.total}</p>
                      <p>Attempted: {new Date(quiz.attempted_at).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* 🆕 AUTHOR MATERIALS SECTION */}
            {activeSection === "authorMaterials" && (
              <>
                <h2 style={styles.heading}>Author Materials</h2>

                {authorLoading && (
                  <p style={{ color: "#64748b" }}>Loading author materials...</p>
                )}

                {!authorLoading && authorMaterials.length === 0 && (
                  <p style={{ color: "#64748b" }}>No author materials found.</p>
                )}

                <div style={styles.cardGrid}>
                  {authorMaterials.map((material) => (
                    <div key={material.id} style={styles.authorCard}>

                      {/* Author row */}
                      <div style={styles.authorRow}>
                        {material.author_image ? (
                          <img
                            src={material.author_image}
                            alt="author"
                            style={styles.authorAvatar}
                          />
                        ) : (
                          <div style={styles.authorAvatarFallback}>
                            {material.author_name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <p style={styles.uploadedBy}>Uploaded by</p>
                          <p style={styles.authorName}>{material.author_name}</p>
                        </div>
                        <div style={styles.followerBadge}>
                          {material.follower_count}
                        </div>
                      </div>

                      {/* Material info */}
                      <h4 style={styles.materialTitle}>{material.title}</h4>
                      <p style={styles.subjectTag}>
                        📚 {material.subject} &nbsp;|&nbsp;
                        {material.course?.toUpperCase()} &nbsp;|&nbsp;
                        {material.semester?.toUpperCase()}
                      </p>

                      {material.description && (
                        <p style={styles.descText}>{material.description}</p>
                      )}

                      {/* Buttons */}
                      <div style={styles.btnRow}>
                        <button
                          style={styles.viewBtn}
                          onClick={() =>
                            navigate(`/author-material/${material.id}`)
                          }
                        >
                          View Material
                        </button>

                        {user !== material.author_username && (
                          <button
                            style={{
                              ...styles.followBtn,
                              background: followStatus[material.author_username]
                                ? "#e0e7ff"
                                : "#4f46e5",
                              color: followStatus[material.author_username]
                                ? "#4f46e5"
                                : "#fff",
                            }}
                            onClick={() =>
                              handleFollowToggle(material.author_username)
                            }
                          >
                            {followStatus[material.author_username]
                              ? "Following ✓"
                              : "+ Follow"}
                          </button>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              </>
            )}

            {/* LEADERBOARD ANALYTICS */}
            {activeSection === "leaderboard" && analytics && (
              <>
                <h2 style={styles.heading}>Your Performance Analytics</h2>
                <div style={styles.chartBox}>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        dataKey="value"
                        label
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
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
    background: "linear-gradient(135deg,#f0f9ff,#f5f3ff,#ecfdf5)",
  },
  hero: {
    background: "#4f46e5",
    color: "#fff",
    padding: "18px 20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroTitle: { margin: 0, fontSize: "34px" },
  heroSubtitle: { marginTop: "6px" },
  heroHomeBtn: {
    padding: "10px 25px",
    borderRadius: "25px",
    border: "none",
    background: "#fff",
    color: "#4f46e5",
    cursor: "pointer",
    fontWeight: "600",
  },
  wrapper: { display: "flex", marginTop: "25px", padding: "0 20px" },
  sidebar: {
    width: "260px",
    background: "#fff",
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
    background: "#fff",
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
    color: "#fff",
    cursor: "pointer",
    fontWeight: "600",
  },
  mainContent: { flex: 1, padding: "40px" },
  searchSection: {
    display: "flex",
    borderRadius: "50px",
    overflow: "hidden",
    background: "#fff",
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
  },
  searchInput: { flex: 1, padding: "16px 25px", border: "none", outline: "none" },
  searchBtn: {
    padding: "0 35px",
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },
  suggestionBox: {
    position: "absolute",
    width: "100%",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    marginTop: "5px",
    zIndex: 10,
  },
  suggestionItem: {
    padding: "12px 20px",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
  },
  contentArea: { maxWidth: "1000px", margin: "0 auto" },
  heading: { marginBottom: "25px", color: "#1e293b" },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: "25px",
  },
  card: {
    background: "#fff",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    cursor: "pointer",
  },
  chartBox: {
    background: "#fff",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  },

  // 🆕 author material card styles
  authorCard: {
    background: "#fff",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  authorRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    paddingBottom: "10px",
    borderBottom: "1px solid #f1f5f9",
  },
  authorAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  authorAvatarFallback: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#4f46e5,#06b6d4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "700",
    fontSize: "14px",
    flexShrink: 0,
  },
  uploadedBy: { fontSize: "11px", color: "#94a3b8", margin: 0 },
  authorName: { fontSize: "13px", fontWeight: "600", color: "#1e293b", margin: 0 },
  followerBadge: {
    fontSize: "12px",
    color: "#64748b",
    background: "#f1f5f9",
    padding: "4px 10px",
    borderRadius: "20px",
    whiteSpace: "nowrap",
  },
  materialTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "6px 0 2px 0",
  },
  subjectTag: {
    fontSize: "12px",
    color: "#4f46e5",
    fontWeight: "600",
    margin: "2px 0",
  },
  descText: {
    fontSize: "13px",
    color: "#64748b",
    margin: "2px 0",
    lineHeight: "1.5",
  },
  btnRow: {
    display: "flex",
    gap: "8px",
    marginTop: "10px",
    flexWrap: "wrap",
  },
  viewBtn: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  followBtn: {
    padding: "8px 16px",
    borderRadius: "20px",
    border: "none",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};