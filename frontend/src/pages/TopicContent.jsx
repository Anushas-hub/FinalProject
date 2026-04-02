import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

function TopicContent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [subjectTitle, setSubjectTitle] = useState("");
  const [quizLoading, setQuizLoading] = useState(false);

  const user = localStorage.getItem("user");

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/subjects/${id}/modules/`)
      .then((res) => res.json())
      .then((data) => {
        setModules(data);
        if (data.length > 0) {
          setActiveModule(data[0]);
          setSubjectTitle(data[0].subject_title || "Study Topic");
        }
      })
      .catch((err) => console.error(err));
  }, [id]);

  useEffect(() => {
    if (activeModule) {
      setQuizLoading(true);
      fetch(`http://127.0.0.1:8000/api/modules/${activeModule.id}/quizzes/`)
        .then((res) => res.json())
        .then((data) => {
          setQuizzes(data);
          setQuizLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setQuizLoading(false);
        });
    }
  }, [activeModule]);

  // SAVE VIEW HISTORY
  useEffect(() => {
    if (user) {
      fetch("http://127.0.0.1:8000/api/save-viewed-topic/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: user, subject_id: id }),
      });
    }
  }, [id, user]);

  // ── Format content: newlines → paragraphs ──
  const renderContent = (text) => {
    if (!text) return <p style={S.emptyMsg}>No content available.</p>;
    return text
      .split(/\n+/)
      .filter((para) => para.trim() !== "")
      .map((para, i) => (
        <p key={i} style={S.para}>
          {para.trim()}
        </p>
      ));
  };

  return (
    <>
      <Navbar />

      <div style={S.page}>

        {/* ── HEADER ── */}
        <div style={S.header}>
          <div style={S.headerInner}>
            <button style={S.backBtn} onClick={() => navigate(-1)}>
              ← Back
            </button>
            <h1 style={S.headerTitle}>{subjectTitle}</h1>
            <p style={S.headerSub}>
              {modules.length} module{modules.length !== 1 ? "s" : ""} available
            </p>
          </div>
        </div>

        {/* ── BODY ── */}
        <div style={S.body}>

          {/* SIDEBAR */}
          <div style={S.sidebar}>
            <h3 style={S.sidebarHeading}> Modules</h3>
            {modules.map((module, idx) => (
              <button
                key={module.id}
                style={{
                  ...S.moduleBtn,
                  ...(activeModule?.id === module.id ? S.moduleBtnActive : {}),
                }}
                onClick={() => setActiveModule(module)}
              >
                <span style={S.moduleNum}>{idx + 1}</span>
                <span style={S.moduleTitle}>{module.title}</span>
              </button>
            ))}
          </div>

          {/* CONTENT */}
          <div style={S.contentArea}>

            {activeModule ? (
              <>
                {/* Module title */}
                <div style={S.contentHeader}>
                  <h2 style={S.contentTitle}>{activeModule.title}</h2>
                  <span style={S.contentBadge}> Reading</span>
                </div>

                {/* Divider */}
                <div style={S.divider} />

                {/* Content paragraphs */}
                <div style={S.contentBody}>
                  {renderContent(activeModule.content)}
                </div>

                {/* ── QUIZ SECTION ── */}
                <div style={S.quizSection}>
                  <div style={S.quizSectionHeader}>
                    <h3 style={S.quizSectionTitle}> Practice Quizzes</h3>
                    <p style={S.quizSectionSub}>
                      Test your understanding of this module
                    </p>
                  </div>

                  {quizLoading && (
                    <p style={S.loadingMsg}>Loading quizzes...</p>
                  )}

                  {!quizLoading && quizzes.length === 0 && (
                    <div style={S.noQuizBox}>
                      <span style={S.noQuizIcon}></span>
                      <p style={S.noQuizText}>
                        No quizzes available for this module yet.
                      </p>
                    </div>
                  )}

                  {!quizLoading && quizzes.length > 0 && (
                    <div style={S.quizGrid}>
                      {quizzes.map((quiz) => (
                        <div key={quiz.id} style={S.quizCard}>

                          {/* Quiz header */}
                          <div style={S.quizCardTop}>
                            <span style={S.quizIcon}></span>
                            <span style={{
                              ...S.diffBadge,
                              ...(quiz.difficulty === "hard"
                                ? S.diffHard
                                : quiz.difficulty === "medium"
                                ? S.diffMedium
                                : S.diffEasy),
                            }}>
                              {quiz.difficulty
                                ? quiz.difficulty.charAt(0).toUpperCase() +
                                  quiz.difficulty.slice(1)
                                : "Quiz"}
                            </span>
                          </div>

                          {/* Quiz title */}
                          <h4 style={S.quizTitle}>{quiz.title}</h4>

                          {/* Quiz meta */}
                          <div style={S.quizMeta}>
                            {quiz.total_questions > 0 && (
                              <span style={S.quizMetaItem}>
                                ❓ {quiz.total_questions} Qs
                              </span>
                            )}
                            {quiz.time_limit && (
                              <span style={S.quizMetaItem}>
                                ⏱ {quiz.time_limit} min
                              </span>
                            )}
                          </div>

                          {/* Start button */}
                          <button
                            style={S.startQuizBtn}
                            onClick={() => {
                              if (!user) {
                                navigate("/login", {
                                  state: {
                                    message: "Please login to attempt quiz.",
                                  },
                                });
                              } else {
                                navigate(`/quiz/${quiz.id}`);
                              }
                            }}
                          >
                            Start Quiz →
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div style={S.loadingContent}>
                <p>Select a module to view content.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh",
    background: "#f4f6fb",
    paddingBottom: "60px",
    fontFamily: "'Segoe UI', sans-serif",
  },

  // HEADER
  header: {
    background: "linear-gradient(135deg, #4f46e5, #9333ea)",
    padding: "50px 20px 40px",
    color: "#fff",
    textAlign: "center",
  },
  headerInner: { maxWidth: "900px", margin: "0 auto" },
  backBtn: {
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff",
    padding: "8px 18px",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "16px",
    display: "inline-block",
  },
  headerTitle: {
    fontSize: "34px",
    fontWeight: "800",
    margin: "0 0 8px 0",
  },
  headerSub: {
    fontSize: "14px",
    opacity: 0.8,
    margin: 0,
  },

  // BODY
  body: {
    display: "flex",
    width: "92%",
    maxWidth: "1100px",
    margin: "36px auto",
    gap: "28px",
    alignItems: "flex-start",
  },

  // SIDEBAR
  sidebar: {
    width: "260px",
    flexShrink: 0,
    background: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
  },
  sidebarHeading: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "1px",
    marginBottom: "14px",
  },
  moduleBtn: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "11px 14px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    background: "#f8fafc",
    marginBottom: "8px",
    textAlign: "left",
    transition: "all 0.2s",
  },
  moduleBtnActive: {
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    color: "#fff",
  },
  moduleNum: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "700",
    flexShrink: 0,
  },
  moduleTitle: {
    fontSize: "13px",
    fontWeight: "600",
    lineHeight: "1.3",
  },

  // CONTENT AREA
  contentArea: {
    flex: 1,
    background: "#fff",
    borderRadius: "16px",
    padding: "30px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
    minHeight: "400px",
  },
  contentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  contentTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  contentBadge: {
    background: "#ede9fe",
    color: "#7c3aed",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  divider: {
    height: "1px",
    background: "#f1f5f9",
    margin: "16px 0",
  },
  contentBody: {
    lineHeight: "1.9",
  },
  para: {
    fontSize: "15px",
    color: "#374151",
    marginBottom: "16px",
    lineHeight: "1.9",
    textAlign: "justify",
  },
  emptyMsg: {
    color: "#94a3b8",
    fontStyle: "italic",
    fontSize: "14px",
  },
  loadingContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "300px",
    color: "#94a3b8",
    fontSize: "15px",
  },

  // QUIZ SECTION
  quizSection: {
    marginTop: "40px",
    borderTop: "2px solid #f1f5f9",
    paddingTop: "30px",
  },
  quizSectionHeader: { marginBottom: "20px" },
  quizSectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 4px 0",
  },
  quizSectionSub: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
  },
  loadingMsg: {
    color: "#94a3b8",
    fontSize: "14px",
    textAlign: "center",
    padding: "20px 0",
  },
  noQuizBox: {
    textAlign: "center",
    padding: "30px",
    background: "#f9fafb",
    borderRadius: "12px",
    border: "1.5px dashed #e2e8f0",
  },
  noQuizIcon: { fontSize: "32px", display: "block", marginBottom: "8px" },
  noQuizText: {
    color: "#94a3b8",
    fontSize: "14px",
    margin: 0,
  },
  quizGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: "16px",
  },
  quizCard: {
    background: "#fafafa",
    border: "1.5px solid #e2e8f0",
    borderRadius: "14px",
    padding: "18px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    transition: "box-shadow 0.2s",
  },
  quizCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quizIcon: { fontSize: "22px" },
  diffBadge: {
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
  },
  diffEasy: { background: "#dcfce7", color: "#166534" },
  diffMedium: { background: "#fef9c3", color: "#854d0e" },
  diffHard: { background: "#fee2e2", color: "#991b1b" },
  quizTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
    lineHeight: "1.4",
  },
  quizMeta: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  quizMetaItem: {
    fontSize: "12px",
    color: "#64748b",
    background: "#f1f5f9",
    padding: "3px 10px",
    borderRadius: "20px",
  },
  startQuizBtn: {
    marginTop: "4px",
    padding: "10px",
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "700",
    width: "100%",
  },
};

export default TopicContent;