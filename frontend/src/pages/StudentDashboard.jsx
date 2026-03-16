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

  const [viewedTopics, setViewedTopics] = useState([]);
  const [attemptedQuizzes, setAttemptedQuizzes] = useState([]);

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
            onClick={() => {
              setActiveSection("quiz");
              fetchAttemptedQuizzes();
            }}
          >
            Attempted Quizzes
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

        {/* MAIN */}

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

          <div style={styles.contentArea}>

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

            {/* ATTEMPTED QUIZZES */}

            {activeSection === "quiz" && (
              <>
                <h2 style={styles.heading}>Your Attempted Quizzes</h2>

                <div style={styles.cardGrid}>

                  {attemptedQuizzes.length === 0 && (
                    <p>No quiz attempts yet.</p>
                  )}

                  {attemptedQuizzes.map((quiz, index) => (

                    <div
                      key={index}
                      style={styles.card}
                      onClick={() =>
                        navigate(`/study-material/${quiz.subject_id}`)
                      }
                    >
                      <h4>{quiz.quiz_title}</h4>

                      <p>
                        Subject: {quiz.subject_title}
                      </p>

                      <p>
                        Score: {quiz.score} / {quiz.total}
                      </p>

                      <p>
                        Attempted:{" "}
                        {new Date(quiz.attempted_at).toLocaleDateString()}
                      </p>

                    </div>

                  ))}

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
  page:{
    minHeight:"100vh",
    background:"linear-gradient(135deg,#f0f9ff,#f5f3ff,#ecfdf5)"
  },
  hero:{
    background:"#4f46e5",
    color:"#fff",
    padding:"18px 20px",
    display:"flex",
    justifyContent:"space-between",
    alignItems:"center"
  },
  heroTitle:{margin:0,fontSize:"34px"},
  heroSubtitle:{marginTop:"6px"},
  heroHomeBtn:{
    padding:"10px 25px",
    borderRadius:"25px",
    border:"none",
    background:"#fff",
    color:"#4f46e5",
    cursor:"pointer"
  },
  wrapper:{display:"flex",marginTop:"25px",padding:"0 20px"},
  sidebar:{
    width:"260px",
    background:"#fff",
    padding:"30px 20px",
    boxShadow:"4px 0 15px rgba(0,0,0,0.05)",
    display:"flex",
    flexDirection:"column",
    gap:"15px"
  },
  profileBox:{textAlign:"center",marginBottom:"20px"},
  avatar:{
    width:"70px",
    height:"70px",
    borderRadius:"50%",
    background:"linear-gradient(135deg,#4f46e5,#06b6d4)",
    display:"flex",
    alignItems:"center",
    justifyContent:"center",
    color:"#fff",
    fontSize:"26px",
    margin:"0 auto"
  },
  roleText:{fontSize:"13px",color:"#64748b"},
  menuBtn:{
    padding:"16px",
    borderRadius:"20px",
    border:"none",
    background:"#fff",
    cursor:"pointer",
    fontWeight:"600",
    boxShadow:"0 4px 10px rgba(0,0,0,0.05)"
  },
  logoutBtn:{
    marginTop:"auto",
    padding:"16px",
    borderRadius:"20px",
    border:"none",
    background:"red",
    color:"#fff",
    cursor:"pointer"
  },
  mainContent:{flex:1,padding:"40px"},
  searchSection:{
    display:"flex",
    borderRadius:"50px",
    overflow:"hidden",
    background:"#fff",
    boxShadow:"0 10px 25px rgba(0,0,0,0.06)"
  },
  searchInput:{flex:1,padding:"16px 25px",border:"none",outline:"none"},
  searchBtn:{padding:"0 35px",border:"none",background:"#4f46e5",color:"#fff"},
  suggestionBox:{
    position:"absolute",
    width:"100%",
    background:"#fff",
    borderRadius:"10px",
    boxShadow:"0 10px 25px rgba(0,0,0,0.1)",
    marginTop:"5px"
  },
  suggestionItem:{
    padding:"12px 20px",
    cursor:"pointer",
    borderBottom:"1px solid #eee"
  },
  contentArea:{maxWidth:"1000px",margin:"0 auto"},
  heading:{marginBottom:"25px",color:"#1e293b"},
  cardGrid:{
    display:"grid",
    gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",
    gap:"25px"
  },
  card:{
    background:"#fff",
    padding:"25px",
    borderRadius:"16px",
    boxShadow:"0 10px 25px rgba(0,0,0,0.05)",
    cursor:"pointer"
  }
};