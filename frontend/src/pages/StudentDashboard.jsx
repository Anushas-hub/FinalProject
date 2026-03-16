import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const user = localStorage.getItem("user");
  const role = localStorage.getItem("role");

  const [activeSection, setActiveSection] = useState("home");

  const [searchTerm, setSearchTerm] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  /* VIEWED TOPICS STATE */
  const [viewedTopics, setViewedTopics] = useState([]);

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

    navigate(`/study-material?search=${searchTerm}`);
  };

  if (!user || role !== "student") return null;

  return (
    <div style={styles.page}>
      
      {/* HERO */}
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
            onClick={() => {
              setActiveSection("viewed");
              fetchViewedTopics();
            }}
          >
            Viewed Topics
          </button>

          <button
            style={styles.menuBtn}
            onClick={() => setActiveSection("quiz")}
          >
            Attemted Quizzes
          </button>

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

          <button style={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>

        {/* MAIN CONTENT */}
        <div style={styles.mainContent}>

          {/* SEARCH */}
          <div style={{position:"relative", maxWidth:"800px", margin:"0 auto 40px auto"}}>

            <div style={styles.searchSection}>
              <input
                type="text"
                placeholder="Search topics, study materials, courses..."
                style={styles.searchInput}
                value={searchTerm}
                onChange={handleChange}
              />

              <button style={styles.searchBtn} onClick={handleSearch}>
                Search
              </button>
            </div>

            {suggestions.length > 0 && (
              <div style={styles.suggestionBox}>
                {suggestions.map((item) => (
                  <div
                    key={item.id}
                    style={styles.suggestionItem}
                    onClick={() =>
                      handleSuggestionClick(item.id, item.title)
                    }
                  >
                    {item.title}
                  </div>
                ))}
              </div>
            )}

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

            {/* VIEWED TOPICS */}

            {activeSection === "viewed" && (
              <>
                <h2 style={styles.heading}>Your Viewed Topics</h2>

                <div style={styles.cardGrid}>

                  {viewedTopics.length === 0 && (
                    <p>No viewed topics yet.</p>
                  )}

                  {viewedTopics.map((topic, index) => (

                    <div
                      key={index}
                      style={styles.card}
                      onClick={() =>
                        navigate(`/study-material/${topic.subject_id}`)
                      }
                    >
                      <h4>{topic.title}</h4>

                      <p>
                        Last viewed:{" "}
                        {new Date(topic.viewed_at).toLocaleDateString()}
                      </p>

                    </div>

                  ))}

                </div>
              </>
            )}

            {activeSection === "quiz" && (
              <h2 style={styles.heading}>
                Your Attemted Quizzes
              </h2>
            )}

            {activeSection === "cert" && (
              <h2 style={styles.heading}>Your Certifications</h2>
            )}

            {activeSection === "leaderboard" && (
              <h2 style={styles.heading}>Leaderboard</h2>
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

  suggestionBox: {
    position: "absolute",
    width: "100%",
    background: "#fff",
    borderRadius: "10px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    marginTop: "5px",
    zIndex: 10,
    textAlign: "left",
  },

  suggestionItem: {
    padding: "12px 20px",
    cursor: "pointer",
    borderBottom: "1px solid #eee",
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
    cursor: "pointer"
  },
};