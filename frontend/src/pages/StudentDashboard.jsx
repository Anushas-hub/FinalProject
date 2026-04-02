import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
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

  // sections data
  const [viewedTopics, setViewedTopics] = useState([]);
  const [attemptedQuizzes, setAttemptedQuizzes] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [certifications, setCertifications] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [authorMaterials, setAuthorMaterials] = useState([]);
  const [followStatus, setFollowStatus] = useState({});
  const [authorLoading, setAuthorLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) navigate("/login");
    if (role !== "student") navigate("/");
  }, [user, role, navigate]);

  // fetch subjects for search
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/subjects/")
      .then(res => res.json())
      .then(data => setSubjects(data))
      .catch(err => console.error(err));
  }, []);

  // ── FETCH FUNCTIONS ──────────────────────────────────────

  const fetchViewedTopics = () => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/api/viewed-topics/${user}/`)
      .then(res => res.json())
      .then(data => { setViewedTopics(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const fetchAttemptedQuizzes = () => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/api/attempted-quizzes/${user}/`)
      .then(res => res.json())
      .then(data => { setAttemptedQuizzes(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const fetchAnalytics = () => {
    fetch(`http://127.0.0.1:8000/api/student-analytics/${user}/`)
      .then(res => res.json())
      .then(data => setAnalytics(data))
      .catch(err => console.error(err));
  };

  const fetchCertifications = () => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/api/my-certifications/${user}/`)
      .then(res => res.json())
      .then(data => { setCertifications(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const fetchLeaderboard = () => {
    setLoading(true);
    fetch("http://127.0.0.1:8000/api/student-leaderboard/")
      .then(res => res.json())
      .then(data => { setLeaderboard(data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const fetchAuthorMaterials = (search = "") => {
    setAuthorLoading(true);
    const url = search
      ? `http://127.0.0.1:8000/api/author/public-materials/?search=${search}`
      : "http://127.0.0.1:8000/api/author/public-materials/";

    fetch(url)
      .then(res => res.json())
      .then(data => {
        setAuthorMaterials(data);
        setAuthorLoading(false);
        const uniqueAuthors = [...new Set(data.map(m => m.author_username))];
        uniqueAuthors.forEach(au => {
          fetch(`http://127.0.0.1:8000/api/follow-status/${user}/${au}/`)
            .then(r => r.json())
            .then(d => setFollowStatus(prev => ({ ...prev, [au]: d.following })))
            .catch(() => {});
        });
      })
      .catch(() => setAuthorLoading(false));
  };

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
      .then(r => r.json())
      .then(() => {
        setFollowStatus(prev => ({ ...prev, [authorUsername]: !isFollowing }));
        setAuthorMaterials(prev =>
          prev.map(m => m.author_username === authorUsername
            ? { ...m, follower_count: isFollowing ? m.follower_count - 1 : m.follower_count + 1 }
            : m
          )
        );
      })
      .catch(err => console.error(err));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // ── SEARCH ──────────────────────────────────────────────

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length > 0) {
      setSuggestions(subjects.filter(s =>
        s.title.toLowerCase().includes(value.toLowerCase())
      ));
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
    if (activeSection === "authorMaterials") {
      fetchAuthorMaterials(searchTerm);
      return;
    }
    const text = searchTerm.toLowerCase();
    const yearMatch = text.match(/\b(20\d{2})\b/);
    const year = yearMatch ? yearMatch[0] : "";
    if (text.includes("pyq") || text.includes("previous year") || text.includes("question")) {
      let subject = text.replace("pyq","").replace("previous year","").replace("question","").replace(/\b20\d{2}\b/,"").trim();
      navigate(`/previous-year-questions?subject=${subject}&year=${year}`);
      return;
    }
    navigate(`/study-material?search=${searchTerm}`);
  };

  if (!user || role !== "student") return null;

  // chart data
  const chartData = analytics ? [
    { name: "Topics Viewed", value: analytics.topics_viewed || 0 },
    { name: "Quizzes Attempted", value: analytics.quizzes_attempted || 0 },
    { name: "Certifications", value: analytics.certifications || 0 },
  ] : [];
  const COLORS = ["#4f46e5", "#06b6d4", "#22c55e"];

  // current user rank in leaderboard
  const myRank = leaderboard.find(l => l.username === user);

  return (
    <div style={S.page}>

      {/* HERO */}
      <div style={S.hero}>
        <div>
          <h1 style={S.heroTitle}>Student Dashboard</h1>
          <p style={S.heroSub}>SmartStudy</p>
        </div>
        <button style={S.heroHomeBtn} onClick={() => navigate("/")}>Home</button>
      </div>

      <div style={S.wrapper}>

        {/* SIDEBAR */}
        <div style={S.sidebar}>
          <div style={S.profileBox}>
            <div style={S.avatar}>{user.charAt(0).toUpperCase()}</div>
            <h3 style={{ marginTop: "10px", marginBottom: "2px" }}>{user}</h3>
            <p style={S.roleText}>Student Account</p>
          </div>

          {[
            { key: "viewed", label: " Viewed Topics", fn: fetchViewedTopics },
            { key: "quiz", label: " Attempted Quizzes", fn: fetchAttemptedQuizzes },
            { key: "cert", label: " Certifications", fn: fetchCertifications },
            { key: "authorMaterials", label: " Author Materials", fn: () => fetchAuthorMaterials() },
            { key: "leaderboard", label: " Leaderboard", fn: () => { fetchLeaderboard(); fetchAnalytics(); } },
          ].map(item => (
            <button
              key={item.key}
              style={activeSection === item.key ? S.menuBtnActive : S.menuBtn}
              onClick={() => { setActiveSection(item.key); item.fn(); }}
            >
              {item.label}
            </button>
          ))}

          <button style={S.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>

        {/* MAIN */}
        <div style={S.mainContent}>

          {/* SEARCH */}
          <div style={{ position: "relative", maxWidth: "800px", margin: "0 auto 36px auto" }}>
            <div style={S.searchSection}>
              <input
                type="text"
                placeholder={
                  activeSection === "authorMaterials"
                    ? "Search author materials..."
                    : "Search topics, study materials, courses..."
                }
                style={S.searchInput}
                value={searchTerm}
                onChange={handleChange}
              />
              <button style={S.searchBtn} onClick={handleSearch}>Search</button>
            </div>
            {suggestions.length > 0 && activeSection !== "authorMaterials" && (
              <div style={S.suggestionBox}>
                {suggestions.map(item => (
                  <div key={item.id} style={S.suggestionItem}
                    onClick={() => handleSuggestionClick(item.id, item.title)}>
                    {item.title}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={S.contentArea}>

            {/* ── VIEWED TOPICS ── */}
            {activeSection === "viewed" && (
              <>
                <h2 style={S.heading}> Viewed Topics</h2>
                {loading && <p style={S.muted}>Loading...</p>}
                {!loading && viewedTopics.length === 0 && (
                  <div style={S.emptyBox}>
                    <p style={S.emptyIcon}></p>
                    <p style={S.emptyText}>No viewed topics yet.</p>
                    <p style={S.emptySubText}>Start exploring study materials!</p>
                    <button style={S.exploreBtn} onClick={() => navigate("/study-material")}>
                      Explore Study Material →
                    </button>
                  </div>
                )}
                <div style={S.cardGrid}>
                  {viewedTopics.map((topic, i) => (
                    <div key={i} style={S.card}
                      onClick={() => navigate(`/study-material/${topic.subject_id}`)}>
                      <div style={S.cardIcon}></div>
                      <h4 style={S.cardTitle}>{topic.title}</h4>
                      <p style={S.cardMeta}>
                        Last viewed: {new Date(topic.viewed_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </p>
                      <span style={S.cardLink}>View again →</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── ATTEMPTED QUIZZES ── */}
            {activeSection === "quiz" && (
              <>
                <h2 style={S.heading}>Attempted Quizzes</h2>
                {loading && <p style={S.muted}>Loading...</p>}
                {!loading && attemptedQuizzes.length === 0 && (
                  <div style={S.emptyBox}>
                    <p style={S.emptyIcon}></p>
                    <p style={S.emptyText}>No quiz attempts yet.</p>
                    <p style={S.emptySubText}>Attempt quizzes from study materials!</p>
                    <button style={S.exploreBtn} onClick={() => navigate("/study-material")}>
                      Go to Study Material →
                    </button>
                  </div>
                )}
                <div style={S.cardGrid}>
                  {attemptedQuizzes.map((quiz, i) => {
                    const pct = Math.round((quiz.score / quiz.total) * 100);
                    return (
                      <div key={i} style={S.card}>
                        <div style={S.cardIcon}></div>
                        <h4 style={S.cardTitle}>{quiz.quiz_title}</h4>
                        <p style={S.cardMeta}> {quiz.subject_title}</p>
                        <div style={S.scoreRow}>
                          <span style={{
                            ...S.scoreBadge,
                            background: pct >= 70 ? "#dcfce7" : pct >= 40 ? "#fef9c3" : "#fee2e2",
                            color: pct >= 70 ? "#166534" : pct >= 40 ? "#854d0e" : "#991b1b",
                          }}>
                            {quiz.score}/{quiz.total} — {pct}%
                          </span>
                        </div>
                        <p style={S.cardMeta}>
                          {new Date(quiz.attempted_at).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric"
                          })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── CERTIFICATIONS ── */}
            {activeSection === "cert" && (
              <>
                <h2 style={S.heading}> My Certifications</h2>
                {loading && <p style={S.muted}>Loading...</p>}
                {!loading && certifications.length === 0 && (
                  <div style={S.emptyBox}>
                    <p style={S.emptyIcon}></p>
                    <p style={S.emptyText}>No certifications yet.</p>
                    <p style={S.emptySubText}>Complete a certification course to earn your certificate!</p>
                    <button style={S.exploreBtn} onClick={() => navigate("/explore-certification")}>
                      Explore Courses →
                    </button>
                  </div>
                )}
                <div style={S.cardGrid}>
                  {certifications.map((cert, i) => (
                    <div key={i} style={{ ...S.card, borderTop: "4px solid #4f46e5" }}>
                      <div style={S.cardIcon}></div>
                      <h4 style={S.cardTitle}>{cert.course_title}</h4>
                      <p style={S.cardMeta}>
                        Completed: {new Date(cert.completed_at).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric"
                        })}
                      </p>
                      <p style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "10px" }}>
                        ID: {cert.certificate_id}
                      </p>
                      <button
                        style={S.certBtn}
                        onClick={() => navigate(`/certificate/${cert.certificate_id}`)}
                      >
                        View Certificate →
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── AUTHOR MATERIALS ── */}
            {activeSection === "authorMaterials" && (
              <>
                <h2 style={S.heading}> Author Materials</h2>
                {authorLoading && <p style={S.muted}>Loading...</p>}
                {!authorLoading && authorMaterials.length === 0 && (
                  <div style={S.emptyBox}>
                    <p style={S.emptyIcon}></p>
                    <p style={S.emptyText}>No author materials found.</p>
                  </div>
                )}
                <div style={S.cardGrid}>
                  {authorMaterials.map(material => (
                    <div key={material.id} style={S.authorCard}>
                      <div style={S.authorRow}>
                        {material.author_image ? (
                          <img src={material.author_image} alt="author" style={S.authorAvatar} />
                        ) : (
                          <div style={S.authorAvatarFallback}>
                            {material.author_name?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <p style={S.uploadedBy}>Uploaded by</p>
                          <p style={S.authorName}>{material.author_name}</p>
                        </div>
                        <span style={S.followerBadge}> {material.follower_count}</span>
                      </div>
                      <h4 style={S.cardTitle}>{material.title}</h4>
                      <p style={S.subjectTag}>
                         {material.subject} | {material.course?.toUpperCase()} | {material.semester?.toUpperCase()}
                      </p>
                      {material.description && (
                        <p style={S.descText}>{material.description}</p>
                      )}
                      <div style={S.btnRow}>
                        <button style={S.viewBtn}
                          onClick={() => navigate(`/author-material/${material.id}`)}>
                          View Material
                        </button>
                        {user !== material.author_username && (
                          <button style={{
                            ...S.followBtn,
                            background: followStatus[material.author_username] ? "#e0e7ff" : "#4f46e5",
                            color: followStatus[material.author_username] ? "#4f46e5" : "#fff",
                          }}
                            onClick={() => handleFollowToggle(material.author_username)}>
                            {followStatus[material.author_username] ? "Following ✓" : "+ Follow"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── LEADERBOARD ── */}
            {activeSection === "leaderboard" && (
              <>
                <h2 style={S.heading}> Student Leaderboard</h2>

                {/* My stats */}
                {analytics && (
                  <div style={S.myStatsBox}>
                    <h3 style={S.myStatsTitle}> My Performance</h3>
                    <div style={S.statsRow}>
                      <div style={S.statBox}>
                        <span style={S.statNum}>{analytics.topics_viewed}</span>
                        <span style={S.statLabel}>Topics</span>
                      </div>
                      <div style={S.statDivider} />
                      <div style={S.statBox}>
                        <span style={S.statNum}>{analytics.quizzes_attempted}</span>
                        <span style={S.statLabel}>Quizzes</span>
                      </div>
                      <div style={S.statDivider} />
                      <div style={S.statBox}>
                        <span style={S.statNum}>{analytics.certifications}</span>
                        <span style={S.statLabel}>Certs</span>
                      </div>
                      {myRank && (
                        <>
                          <div style={S.statDivider} />
                          <div style={S.statBox}>
                            <span style={{ ...S.statNum, color: "#f59e0b" }}>#{myRank.rank}</span>
                            <span style={S.statLabel}>My Rank</span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Pie chart */}
                    {chartData.some(d => d.value > 0) && (
                      <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                          <Pie data={chartData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>
                            {chartData.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                )}

                {/* Leaderboard table */}
                {loading && <p style={S.muted}>Loading leaderboard...</p>}
                {!loading && leaderboard.length > 0 && (
                  <div style={S.leaderboardBox}>
                    <table style={S.table}>
                      <thead>
                        <tr style={S.tableHead}>
                          <th style={S.th}>Rank</th>
                          <th style={S.th}>Student</th>
                          <th style={S.th}>Topics</th>
                          <th style={S.th}>Quizzes</th>
                          <th style={S.th}>Certs</th>
                          <th style={S.th}>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.map((entry, i) => (
                          <tr key={i} style={{
                            ...S.tableRow,
                            background: entry.username === user ? "#ede9fe" : i % 2 === 0 ? "#fff" : "#f9fafb",
                            fontWeight: entry.username === user ? "700" : "400",
                          }}>
                            <td style={S.td}>
                              {entry.rank === 1 ? "" : entry.rank === 2 ? "" : entry.rank === 3 ? "" : `#${entry.rank}`}
                            </td>
                            <td style={S.td}>
                              {entry.username}
                              {entry.username === user && <span style={S.youBadge}> (You)</span>}
                            </td>
                            <td style={S.td}>{entry.topics_viewed}</td>
                            <td style={S.td}>{entry.quizzes_attempted}</td>
                            <td style={S.td}>{entry.certifications}</td>
                            <td style={{ ...S.td, fontWeight: "700", color: "#4f46e5" }}>{entry.score}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p style={S.scoreNote}>
                      Score = Topics×1 + Quizzes×2 + Certifications×5
                    </p>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg,#f0f9ff,#f5f3ff,#ecfdf5)", fontFamily: "'Segoe UI', sans-serif" },
  hero: { background: "#4f46e5", color: "#fff", padding: "18px 40px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  heroTitle: { margin: 0, fontSize: "28px", fontWeight: "800" },
  heroSub: { margin: "4px 0 0", fontSize: "14px", opacity: 0.8 },
  heroHomeBtn: { padding: "10px 25px", borderRadius: "25px", border: "none", background: "#fff", color: "#4f46e5", fontWeight: "600", cursor: "pointer" },
  wrapper: { display: "flex", marginTop: "25px", padding: "0 20px", gap: "20px" },
  sidebar: { width: "240px", flexShrink: 0, background: "#fff", padding: "24px 16px", borderRadius: "16px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "10px", alignSelf: "flex-start", position: "sticky", top: "20px" },
  profileBox: { textAlign: "center", marginBottom: "10px", paddingBottom: "16px", borderBottom: "1px solid #f1f5f9" },
  avatar: { width: "60px", height: "60px", borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "22px", fontWeight: "700", margin: "0 auto" },
  roleText: { fontSize: "12px", color: "#64748b", margin: 0 },
  menuBtn: { padding: "12px 16px", borderRadius: "12px", border: "none", background: "#f8fafc", cursor: "pointer", fontWeight: "600", fontSize: "13px", textAlign: "left", color: "#374151" },
  menuBtnActive: { padding: "12px 16px", borderRadius: "12px", border: "none", background: "#ede9fe", cursor: "pointer", fontWeight: "700", fontSize: "13px", textAlign: "left", color: "#4f46e5" },
  logoutBtn: { marginTop: "10px", padding: "12px", borderRadius: "12px", border: "none", background: "#fee2e2", color: "#dc2626", fontWeight: "700", cursor: "pointer", fontSize: "13px" },
  mainContent: { flex: 1, paddingBottom: "60px" },
  searchSection: { display: "flex", borderRadius: "50px", overflow: "hidden", background: "#fff", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" },
  searchInput: { flex: 1, padding: "14px 24px", border: "none", outline: "none", fontSize: "14px" },
  searchBtn: { padding: "0 30px", border: "none", background: "#4f46e5", color: "#fff", fontWeight: "600", cursor: "pointer", fontSize: "14px" },
  suggestionBox: { position: "absolute", width: "100%", background: "#fff", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", marginTop: "5px", zIndex: 10 },
  suggestionItem: { padding: "12px 20px", cursor: "pointer", borderBottom: "1px solid #f1f5f9", fontSize: "14px" },
  contentArea: { maxWidth: "1000px", margin: "0 auto" },
  heading: { marginBottom: "20px", color: "#1e293b", fontSize: "20px", fontWeight: "700" },
  muted: { color: "#94a3b8", fontSize: "14px" },
  emptyBox: { textAlign: "center", padding: "50px 20px", background: "#fff", borderRadius: "16px", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" },
  emptyIcon: { fontSize: "48px", margin: "0 0 12px 0" },
  emptyText: { fontSize: "17px", fontWeight: "700", color: "#1e293b", margin: "0 0 6px 0" },
  emptySubText: { fontSize: "13px", color: "#64748b", margin: "0 0 20px 0" },
  exploreBtn: { padding: "11px 24px", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "600", cursor: "pointer", fontSize: "14px" },
  cardGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: "20px" },
  card: { background: "#fff", padding: "20px", borderRadius: "14px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", cursor: "pointer", transition: "transform 0.2s" },
  cardIcon: { fontSize: "24px", marginBottom: "10px" },
  cardTitle: { fontSize: "15px", fontWeight: "700", color: "#1e293b", margin: "0 0 6px 0" },
  cardMeta: { fontSize: "12px", color: "#64748b", margin: "0 0 4px 0" },
  cardLink: { fontSize: "12px", color: "#4f46e5", fontWeight: "600" },
  scoreRow: { margin: "6px 0" },
  scoreBadge: { padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" },
  certBtn: { width: "100%", padding: "9px", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "600", cursor: "pointer", fontSize: "13px" },
  // author materials
  authorCard: { background: "#fff", padding: "18px", borderRadius: "14px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: "6px" },
  authorRow: { display: "flex", alignItems: "center", gap: "10px", paddingBottom: "10px", borderBottom: "1px solid #f1f5f9" },
  authorAvatar: { width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" },
  authorAvatarFallback: { width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: "14px", flexShrink: 0 },
  uploadedBy: { fontSize: "11px", color: "#94a3b8", margin: 0 },
  authorName: { fontSize: "13px", fontWeight: "600", color: "#1e293b", margin: 0 },
  followerBadge: { fontSize: "12px", color: "#64748b", background: "#f1f5f9", padding: "3px 10px", borderRadius: "20px" },
  subjectTag: { fontSize: "12px", color: "#4f46e5", fontWeight: "600", margin: "2px 0" },
  descText: { fontSize: "13px", color: "#64748b", lineHeight: "1.5", margin: 0 },
  btnRow: { display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" },
  viewBtn: { padding: "8px 16px", borderRadius: "20px", border: "none", background: "#4f46e5", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  followBtn: { padding: "8px 16px", borderRadius: "20px", border: "none", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  // leaderboard
  myStatsBox: { background: "#fff", borderRadius: "16px", padding: "24px", marginBottom: "24px", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" },
  myStatsTitle: { fontSize: "16px", fontWeight: "700", color: "#1e293b", margin: "0 0 16px 0" },
  statsRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: "0", marginBottom: "20px", background: "#f8fafc", borderRadius: "12px", padding: "16px" },
  statBox: { textAlign: "center", padding: "0 24px" },
  statNum: { display: "block", fontSize: "22px", fontWeight: "800", color: "#1e293b" },
  statLabel: { fontSize: "12px", color: "#64748b" },
  statDivider: { width: "1px", height: "36px", background: "#e2e8f0" },
  leaderboardBox: { background: "#fff", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.06)" },
  table: { width: "100%", borderCollapse: "collapse" },
  tableHead: { background: "linear-gradient(135deg,#4f46e5,#7c3aed)" },
  th: { padding: "14px 16px", textAlign: "left", color: "#fff", fontSize: "13px", fontWeight: "700" },
  tableRow: { transition: "background 0.2s" },
  td: { padding: "12px 16px", fontSize: "13px", color: "#374151", borderBottom: "1px solid #f1f5f9" },
  youBadge: { background: "#4f46e5", color: "#fff", padding: "2px 8px", borderRadius: "10px", fontSize: "11px", marginLeft: "4px" },
  scoreNote: { textAlign: "center", fontSize: "12px", color: "#94a3b8", padding: "10px", margin: 0 },
};