import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

export default function CertificationCourse() {

  const { id } = useParams();
  const navigate = useNavigate();
  const user = localStorage.getItem("user");

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [passedQuizIds, setPassedQuizIds] = useState([]);
  const [progress, setProgress] = useState(0);
  const [certificateUnlocked, setCertificateUnlocked] = useState(false);
  const [alreadyCertified, setAlreadyCertified] = useState(false);
  const [loading, setLoading] = useState(true);

  // ── Fetch course data ────────────────────────────────────────────
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/courses/${id}/`)
      .then(res => res.json())
      .then(data => {
        setCourse(data);
        setModules(data.modules || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // ── Fetch student progress ───────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    fetch(`http://127.0.0.1:8000/api/course-progress/${id}/${user}/`)
      .then(res => res.json())
      .then(data => {
        setPassedQuizIds(data.passed_quiz_ids || []);
        setProgress(data.progress || 0);
        setCertificateUnlocked(data.certificate_unlocked || false);
        setAlreadyCertified(data.already_certified || false);
      })
      .catch(() => {});
  }, [id, user]);

  const activeModule = modules[activeModuleIndex];

  const getModuleStatus = (module) => {
    if (!module.quizzes || module.quizzes.length === 0) return "no-quiz";
    const allPassed = module.quizzes.every(q => passedQuizIds.includes(q.id));
    const somePassed = module.quizzes.some(q => passedQuizIds.includes(q.id));
    if (allPassed) return "completed";
    if (somePassed) return "partial";
    return "pending";
  };

  const handleGetCertificate = () => {
    if (!user) { navigate("/login"); return; }

    fetch("http://127.0.0.1:8000/api/generate-certificate/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, course_id: id }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.certificate_id) {
          navigate(`/certification/${id}/success`, {
            state: {
              certificate_id: data.certificate_id,
              course_title: data.course_title,
            }
          });
        }
      })
      .catch(() => {});
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.loadingMsg}>Loading course...</div>
      </>
    );
  }

  if (!course) {
    return (
      <>
        <Navbar />
        <div style={styles.loadingMsg}>Course not found.</div>
      </>
    );
  }

  return (
    <div style={styles.page}>
      <Navbar />

      {/* ── TOP HEADER ── */}
      <div style={styles.courseHeader}>
        <div style={styles.courseHeaderInner}>
          <button style={styles.backBtn} onClick={() => navigate("/certifications")}>
            ← All Courses
          </button>
          <h1 style={styles.courseTitle}>{course.title}</h1>
          <p style={styles.courseMeta}>
            {course.level?.charAt(0).toUpperCase() + course.level?.slice(1)} &nbsp;·&nbsp;
            {course.duration} &nbsp;·&nbsp;
            {modules.length} Modules
          </p>

          {/* Progress bar */}
          <div style={styles.progressWrapper}>
            <div style={styles.progressBarTrack}>
              <div style={{ ...styles.progressBarFill, width: `${progress}%` }} />
            </div>
            <span style={styles.progressText}>{progress}% Completed</span>
          </div>
        </div>
      </div>

      <div style={styles.layout}>

        {/* ── SIDEBAR ── */}
        <div style={styles.sidebar}>

          <p style={styles.sidebarHeading}>Course Navigation</p>

          {modules.map((module, index) => {
            const status = getModuleStatus(module);
            const isActive = index === activeModuleIndex;

            return (
              <div
                key={module.id}
                style={{
                  ...styles.sidebarItem,
                  background: isActive ? "#e0e7ff" : "transparent",
                  borderLeft: isActive ? "4px solid #4f46e5" : "4px solid transparent",
                }}
                onClick={() => setActiveModuleIndex(index)}
              >
                <div style={styles.sidebarItemTop}>
                  <span style={styles.moduleIcon}>
                    {status === "completed" ? "✅" : status === "partial" ? "" : ""}
                  </span>
                  <span style={{
                    ...styles.sidebarModuleTitle,
                    color: isActive ? "#4f46e5" : "#1e293b",
                    fontWeight: isActive ? "700" : "500",
                  }}>
                    {index + 1}. {module.title}
                  </span>
                </div>

                {module.quizzes?.length > 0 && (
                  <div style={styles.sidebarQuizCount}>
                     {module.quizzes.length} Assessment{module.quizzes.length > 1 ? "s" : ""}
                    {status === "completed" && (
                      <span style={styles.passedTag}>Passed</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {/* Certificate button */}
          <div style={styles.certSection}>
            {alreadyCertified ? (
              <button
                style={{ ...styles.certBtn, background: "#22c55e" }}
                onClick={() => navigate(`/certifications`)}
              >
                ✅ Already Certified
              </button>
            ) : certificateUnlocked ? (
              <button style={styles.certBtn} onClick={handleGetCertificate}>
                 Get Certificate
              </button>
            ) : (
              <div style={styles.certLocked}>
                <p style={styles.certLockedText}>
                   Complete 70% assessments to unlock certificate
                </p>
                <div style={styles.miniProgress}>
                  <div style={{ ...styles.miniProgressFill, width: `${progress}%` }} />
                </div>
                <p style={styles.miniProgressLabel}>{progress}% done</p>
              </div>
            )}
          </div>

        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={styles.mainContent}>

          {activeModule && (
            <div>

              {/* Module header */}
              <div style={styles.moduleHeader}>
                <span style={styles.moduleNumber}>
                  Module {activeModuleIndex + 1} of {modules.length}
                </span>
                <h2 style={styles.moduleTitle}>{activeModule.title}</h2>
              </div>

              {/* Module content */}
              <div style={styles.contentCard}>
                <h3 style={styles.contentHeading}> Learning Content</h3>
                <div style={styles.contentText}>
                  {activeModule.content}
                </div>
              </div>

              {/* Assessments */}
              {activeModule.quizzes?.length > 0 && (
                <div style={styles.assessmentSection}>
                  <h3 style={styles.assessmentHeading}>
                     Module Assessments
                  </h3>
                  <p style={styles.assessmentSub}>
                    Complete assessments to track your progress and unlock the certificate.
                  </p>

                  <div style={styles.quizGrid}>
                    {activeModule.quizzes.map((quiz, qi) => {
                      const isPassed = passedQuizIds.includes(quiz.id);
                      return (
                        <div key={quiz.id} style={styles.quizCard}>
                          <div style={styles.quizCardLeft}>
                            <span style={styles.quizIcon}>
                              {isPassed ? "✅" : ""}
                            </span>
                            <div>
                              <p style={styles.quizTitle}>{quiz.title}</p>
                              <p style={styles.quizMeta}>
                                {quiz.total_questions || 0} Questions
                                &nbsp;·&nbsp;
                                Pass: {quiz.pass_percentage || 60}%
                              </p>
                            </div>
                          </div>

                          <button
                            style={{
                              ...styles.quizBtn,
                              background: isPassed ? "#dcfce7" : "#4f46e5",
                              color: isPassed ? "#166534" : "#fff",
                              border: isPassed ? "1px solid #86efac" : "none",
                            }}
                            onClick={() => navigate(`/certification-quiz/${quiz.id}`)}
                          >
                            {isPassed ? "Retake" : "Attempt →"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div style={styles.navBtns}>
                {activeModuleIndex > 0 && (
                  <button
                    style={styles.navBtn}
                    onClick={() => setActiveModuleIndex(prev => prev - 1)}
                  >
                    ← Previous Module
                  </button>
                )}
                {activeModuleIndex < modules.length - 1 && (
                  <button
                    style={{ ...styles.navBtn, background: "#4f46e5", color: "#fff" }}
                    onClick={() => setActiveModuleIndex(prev => prev + 1)}
                  >
                    Next Module →
                  </button>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
  },
  loadingMsg: {
    textAlign: "center", padding: "80px",
    fontSize: "16px", color: "#64748b",
  },
  courseHeader: {
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    color: "#fff",
    padding: "30px 40px",
  },
  courseHeaderInner: { maxWidth: "1100px", margin: "0 auto" },
  backBtn: {
    background: "rgba(255,255,255,0.15)",
    border: "1px solid rgba(255,255,255,0.3)",
    color: "#fff", padding: "6px 16px",
    borderRadius: "20px", fontSize: "13px",
    cursor: "pointer", marginBottom: "12px",
    fontWeight: "600",
  },
  courseTitle: {
    fontSize: "28px", fontWeight: "800",
    margin: "0 0 6px 0",
  },
  courseMeta: { fontSize: "14px", opacity: 0.85, marginBottom: "20px" },
  progressWrapper: {
    display: "flex", alignItems: "center", gap: "14px",
  },
  progressBarTrack: {
    flex: 1, height: "10px",
    background: "rgba(255,255,255,0.25)",
    borderRadius: "10px",
  },
  progressBarFill: {
    height: "10px",
    background: "#22c55e",
    borderRadius: "10px",
    transition: "width 0.4s ease",
  },
  progressText: {
    fontSize: "14px", fontWeight: "700",
    whiteSpace: "nowrap",
  },
  layout: {
    display: "flex",
    maxWidth: "1300px",
    margin: "0 auto",
    padding: "30px 20px",
    gap: "25px",
    alignItems: "flex-start",
  },
  sidebar: {
    width: "280px",
    background: "#fff",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    position: "sticky",
    top: "20px",
    flexShrink: 0,
  },
  sidebarHeading: {
    fontSize: "11px", fontWeight: "700",
    color: "#94a3b8", textTransform: "uppercase",
    letterSpacing: "1px", marginBottom: "14px",
  },
  sidebarItem: {
    padding: "12px 10px",
    borderRadius: "10px",
    cursor: "pointer",
    marginBottom: "6px",
    transition: "all 0.2s ease",
  },
  sidebarItemTop: {
    display: "flex", alignItems: "flex-start", gap: "8px",
  },
  moduleIcon: { fontSize: "14px", flexShrink: 0, marginTop: "2px" },
  sidebarModuleTitle: {
    fontSize: "13px", lineHeight: "1.4",
  },
  sidebarQuizCount: {
    fontSize: "11px", color: "#94a3b8",
    marginTop: "4px", paddingLeft: "22px",
    display: "flex", alignItems: "center", gap: "6px",
  },
  passedTag: {
    background: "#dcfce7", color: "#166534",
    padding: "1px 8px", borderRadius: "10px",
    fontSize: "10px", fontWeight: "700",
  },
  certSection: { marginTop: "20px", borderTop: "1px solid #f1f5f9", paddingTop: "20px" },
  certBtn: {
    width: "100%", padding: "13px",
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    color: "#fff", border: "none",
    borderRadius: "12px", fontSize: "14px",
    fontWeight: "700", cursor: "pointer",
  },
  certLocked: { textAlign: "center" },
  certLockedText: {
    fontSize: "12px", color: "#64748b",
    lineHeight: "1.5", marginBottom: "10px",
  },
  miniProgress: {
    height: "6px", background: "#f1f5f9",
    borderRadius: "10px", overflow: "hidden",
  },
  miniProgressFill: {
    height: "6px", background: "#4f46e5",
    borderRadius: "10px",
  },
  miniProgressLabel: {
    fontSize: "11px", color: "#94a3b8",
    marginTop: "4px", textAlign: "right",
  },
  mainContent: { flex: 1, minWidth: 0 },
  moduleHeader: {
    marginBottom: "20px",
  },
  moduleNumber: {
    fontSize: "12px", fontWeight: "700",
    color: "#4f46e5", textTransform: "uppercase",
    letterSpacing: "1px",
  },
  moduleTitle: {
    fontSize: "24px", fontWeight: "700",
    color: "#1e293b", margin: "6px 0 0 0",
  },
  contentCard: {
    background: "#fff", borderRadius: "16px",
    padding: "28px", marginBottom: "24px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  },
  contentHeading: {
    fontSize: "15px", fontWeight: "700",
    color: "#1e293b", margin: "0 0 14px 0",
    borderBottom: "2px solid #e0e7ff",
    paddingBottom: "10px",
  },
  contentText: {
    fontSize: "15px", color: "#334155",
    lineHeight: "1.9", whiteSpace: "pre-wrap",
  },
  assessmentSection: {
    background: "#fff", borderRadius: "16px",
    padding: "28px", marginBottom: "24px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  },
  assessmentHeading: {
    fontSize: "15px", fontWeight: "700",
    color: "#1e293b", margin: "0 0 6px 0",
  },
  assessmentSub: {
    fontSize: "13px", color: "#64748b",
    margin: "0 0 18px 0",
  },
  quizGrid: { display: "flex", flexDirection: "column", gap: "12px" },
  quizCard: {
    display: "flex", alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 18px",
    background: "#f8fafc",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    gap: "12px",
  },
  quizCardLeft: { display: "flex", alignItems: "center", gap: "12px" },
  quizIcon: { fontSize: "20px" },
  quizTitle: {
    fontSize: "14px", fontWeight: "600",
    color: "#1e293b", margin: "0 0 2px 0",
  },
  quizMeta: { fontSize: "12px", color: "#64748b", margin: 0 },
  quizBtn: {
    padding: "9px 18px", borderRadius: "20px",
    fontSize: "13px", fontWeight: "700",
    cursor: "pointer", whiteSpace: "nowrap",
    flexShrink: 0,
  },
  navBtns: {
    display: "flex", gap: "12px",
    justifyContent: "flex-end", marginTop: "10px",
  },
  navBtn: {
    padding: "12px 24px", borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "#fff", color: "#1e293b",
    fontSize: "14px", fontWeight: "600",
    cursor: "pointer",
  },
};