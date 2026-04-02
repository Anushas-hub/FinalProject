import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";

export default function CertificationQuiz() {

  const { id } = useParams();
  const navigate = useNavigate();
  const user = localStorage.getItem("user");

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);

  // Timer
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  // ── Fetch quiz ───────────────────────────────────────────────────
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/course-quiz/${id}/`)
      .then(res => res.json())
      .then(data => {
        setQuiz(data);
        // 2 min per question as default timer
        setTimeLeft((data.questions?.length || 5) * 120);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // ── Timer countdown ──────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft === null || submitted) return;

    if (timeLeft <= 0) {
      handleSubmit(true); // auto-submit on timeout
      return;
    }

    timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, submitted]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSelect = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
  };

  // ── Submit quiz ──────────────────────────────────────────────────
  const handleSubmit = (autoSubmit = false) => {
    if (!user) { navigate("/login"); return; }
    if (!autoSubmit && Object.keys(answers).length === 0) return;

    clearTimeout(timerRef.current);
    setSubmitting(true);

    // Build answers map: { question_id: selected_option }
    const answersMap = {};
    quiz.questions.forEach(q => {
      answersMap[q.id] = answers[q.id] || "";
    });

    fetch("http://127.0.0.1:8000/api/course-submit-quiz/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user,
        quiz_id: id,
        answers: answersMap,
      }),
    })
      .then(res => res.json())
      .then(data => {
        setResult(data);
        setSubmitted(true);
        setSubmitting(false);
      })
      .catch(() => setSubmitting(false));
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.centerMsg}>Loading quiz...</div>
      </>
    );
  }

  if (!quiz) {
    return (
      <>
        <Navbar />
        <div style={styles.centerMsg}>Quiz not found.</div>
      </>
    );
  }

  const answered = Object.keys(answers).length;
  const total = quiz.questions?.length || 0;

  // ── RESULTS SCREEN ───────────────────────────────────────────────
  if (submitted && result) {
    const passed = result.passed;
    return (
      <>
        <Navbar />
        <div style={styles.resultsPage}>

          {/* Score card */}
          <div style={styles.scoreCard}>
            <div style={{
              ...styles.scoreCircle,
              background: passed
                ? "linear-gradient(135deg,#22c55e,#16a34a)"
                : "linear-gradient(135deg,#ef4444,#dc2626)",
            }}>
              <span style={styles.scoreNum}>{result.percentage}%</span>
              <span style={styles.scoreLabel}>{passed ? "PASSED ✓" : "FAILED ✗"}</span>
            </div>

            <h2 style={styles.resultTitle}>{quiz.title}</h2>

            <div style={styles.resultStats}>
              <div style={styles.resultStat}>
                <span style={styles.resultStatNum}>{result.score}</span>
                <span style={styles.resultStatLabel}>Correct</span>
              </div>
              <div style={styles.resultStatDivider} />
              <div style={styles.resultStat}>
                <span style={styles.resultStatNum}>{result.total - result.score}</span>
                <span style={styles.resultStatLabel}>Wrong</span>
              </div>
              <div style={styles.resultStatDivider} />
              <div style={styles.resultStat}>
                <span style={styles.resultStatNum}>{result.total}</span>
                <span style={styles.resultStatLabel}>Total</span>
              </div>
            </div>

            <p style={styles.passNote}>
              {passed
                ? ` You passed! Minimum required: ${result.pass_percentage}%`
                : `❌ Minimum required: ${result.pass_percentage}%. Try again!`}
            </p>

            {result.certificate_unlocked && (
              <div style={styles.certUnlockedBanner}>
                 Course progress: {result.course_progress}% — Certificate unlocked!
              </div>
            )}

            <div style={styles.resultBtns}>
              <button
                style={styles.backCourseBtn}
                onClick={() => navigate(`/certification/${quiz.course_id}`)}
              >
                ← Back to Course
              </button>
              {!passed && (
                <button
                  style={styles.retryBtn}
                  onClick={() => {
                    setSubmitted(false);
                    setResult(null);
                    setAnswers({});
                    setCurrentQ(0);
                    setTimeLeft((quiz.questions?.length || 5) * 120);
                  }}
                >
                   Retry Quiz
                </button>
              )}
            </div>
          </div>

          {/* Question review */}
          <div style={styles.reviewSection}>
            <h3 style={styles.reviewHeading}>Answer Review</h3>
            {result.results?.map((r, i) => (
              <div
                key={i}
                style={{
                  ...styles.reviewCard,
                  borderLeft: r.is_correct ? "4px solid #22c55e" : "4px solid #ef4444",
                }}
              >
                <p style={styles.reviewQ}>
                  <span style={styles.qNum}>Q{i + 1}.</span> {r.question}
                </p>
                <p style={styles.reviewAnswer}>
                  Your answer:{" "}
                  <span style={{ color: r.is_correct ? "#16a34a" : "#dc2626", fontWeight: "600" }}>
                    {r.selected || "Not answered"}
                  </span>
                </p>
                {!r.is_correct && (
                  <p style={styles.reviewCorrect}>
                    Correct answer: <span style={{ color: "#16a34a", fontWeight: "600" }}>{r.correct_answer}</span>
                  </p>
                )}
              </div>
            ))}
          </div>

        </div>
      </>
    );
  }

  // ── QUIZ SCREEN ──────────────────────────────────────────────────
  const currentQuestion = quiz.questions?.[currentQ];

  return (
    <>
      <Navbar />
      <div style={styles.quizPage}>

        {/* Quiz header */}
        <div style={styles.quizHeader}>
          <div style={styles.quizHeaderLeft}>
            <p style={styles.quizCourse}>{quiz.course_title}</p>
            <h2 style={styles.quizTitle}>{quiz.title}</h2>
          </div>

          {/* Timer */}
          <div style={{
            ...styles.timer,
            background: timeLeft < 60 ? "#fee2e2" : "#e0e7ff",
            color: timeLeft < 60 ? "#dc2626" : "#4f46e5",
          }}>
            ⏱ {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress */}
        <div style={styles.quizProgressRow}>
          <span style={styles.quizProgressText}>
            Question {currentQ + 1} of {total} &nbsp;·&nbsp; {answered} answered
          </span>
          <div style={styles.quizProgressTrack}>
            <div style={{ ...styles.quizProgressFill, width: `${(answered / total) * 100}%` }} />
          </div>
        </div>

        <div style={styles.quizLayout}>

          {/* Question list sidebar */}
          <div style={styles.qSidebar}>
            <p style={styles.qSidebarHeading}>Questions</p>
            <div style={styles.qGrid}>
              {quiz.questions?.map((q, i) => (
                <button
                  key={i}
                  style={{
                    ...styles.qDot,
                    background: answers[q.id]
                      ? "#4f46e5"
                      : i === currentQ
                      ? "#e0e7ff"
                      : "#f1f5f9",
                    color: answers[q.id] ? "#fff" : "#1e293b",
                    border: i === currentQ ? "2px solid #4f46e5" : "2px solid transparent",
                  }}
                  onClick={() => setCurrentQ(i)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Question card */}
          <div style={styles.questionCard}>

            <p style={styles.qLabel}>Question {currentQ + 1}</p>
            <h3 style={styles.questionText}>{currentQuestion?.question}</h3>

            <div style={styles.optionsList}>
              {[
                { key: "option1", label: "A" },
                { key: "option2", label: "B" },
                { key: "option3", label: "C" },
                { key: "option4", label: "D" },
              ].map(({ key, label }) => {
                const optionVal = currentQuestion?.[key];
                if (!optionVal) return null;
                const isSelected = answers[currentQuestion?.id] === optionVal;

                return (
                  <div
                    key={key}
                    style={{
                      ...styles.optionItem,
                      background: isSelected ? "#e0e7ff" : "#f8fafc",
                      border: isSelected ? "2px solid #4f46e5" : "2px solid #e2e8f0",
                    }}
                    onClick={() => handleSelect(currentQuestion.id, optionVal)}
                  >
                    <span style={{
                      ...styles.optionLabel,
                      background: isSelected ? "#4f46e5" : "#e2e8f0",
                      color: isSelected ? "#fff" : "#64748b",
                    }}>
                      {label}
                    </span>
                    <span style={styles.optionText}>{optionVal}</span>
                  </div>
                );
              })}
            </div>

            {/* Navigation */}
            <div style={styles.qNav}>
              <button
                style={styles.qNavBtn}
                disabled={currentQ === 0}
                onClick={() => setCurrentQ(prev => prev - 1)}
              >
                ← Prev
              </button>

              {currentQ < total - 1 ? (
                <button
                  style={{ ...styles.qNavBtn, background: "#4f46e5", color: "#fff", border: "none" }}
                  onClick={() => setCurrentQ(prev => prev + 1)}
                >
                  Next →
                </button>
              ) : (
                <button
                  style={{
                    ...styles.qNavBtn,
                    background: answered === total ? "#22c55e" : "#94a3b8",
                    color: "#fff", border: "none",
                    opacity: submitting ? 0.7 : 1,
                  }}
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit Quiz ✓"}
                </button>
              )}
            </div>

          </div>
        </div>

      </div>
    </>
  );
}

const styles = {
  centerMsg: { textAlign: "center", padding: "80px", color: "#64748b", fontSize: "16px" },

  // Results
  resultsPage: { maxWidth: "800px", margin: "0 auto", padding: "40px 20px" },
  scoreCard: {
    background: "#fff", borderRadius: "20px",
    padding: "40px", boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    textAlign: "center", marginBottom: "30px",
  },
  scoreCircle: {
    width: "130px", height: "130px",
    borderRadius: "50%", margin: "0 auto 20px auto",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    color: "#fff",
  },
  scoreNum: { fontSize: "30px", fontWeight: "800" },
  scoreLabel: { fontSize: "12px", fontWeight: "700", letterSpacing: "1px" },
  resultTitle: { fontSize: "20px", fontWeight: "700", color: "#1e293b", marginBottom: "20px" },
  resultStats: {
    display: "flex", justifyContent: "center",
    alignItems: "center", gap: "0",
    background: "#f8fafc", borderRadius: "12px",
    padding: "16px", marginBottom: "16px",
  },
  resultStat: { textAlign: "center", padding: "0 24px" },
  resultStatNum: { display: "block", fontSize: "24px", fontWeight: "800", color: "#1e293b" },
  resultStatLabel: { fontSize: "12px", color: "#64748b" },
  resultStatDivider: { width: "1px", height: "40px", background: "#e2e8f0" },
  passNote: { fontSize: "14px", color: "#64748b", marginBottom: "16px" },
  certUnlockedBanner: {
    background: "#dcfce7", color: "#166534",
    padding: "12px 20px", borderRadius: "12px",
    fontSize: "14px", fontWeight: "600", marginBottom: "20px",
  },
  resultBtns: { display: "flex", gap: "12px", justifyContent: "center" },
  backCourseBtn: {
    padding: "12px 24px", borderRadius: "10px",
    border: "1px solid #e2e8f0", background: "#fff",
    color: "#1e293b", fontSize: "14px",
    fontWeight: "600", cursor: "pointer",
  },
  retryBtn: {
    padding: "12px 24px", borderRadius: "10px",
    border: "none", background: "#4f46e5",
    color: "#fff", fontSize: "14px",
    fontWeight: "600", cursor: "pointer",
  },
  reviewSection: { display: "flex", flexDirection: "column", gap: "12px" },
  reviewHeading: { fontSize: "17px", fontWeight: "700", color: "#1e293b", marginBottom: "4px" },
  reviewCard: {
    background: "#fff", padding: "16px 20px",
    borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
  },
  reviewQ: { fontSize: "14px", color: "#1e293b", margin: "0 0 6px 0", lineHeight: "1.5" },
  qNum: { fontWeight: "700", color: "#4f46e5", marginRight: "6px" },
  reviewAnswer: { fontSize: "13px", color: "#64748b", margin: "0 0 4px 0" },
  reviewCorrect: { fontSize: "13px", color: "#64748b", margin: 0 },

  // Quiz screen
  quizPage: { maxWidth: "1100px", margin: "0 auto", padding: "30px 20px" },
  quizHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: "20px",
    background: "#fff", padding: "20px 24px",
    borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },
  quizHeaderLeft: {},
  quizCourse: { fontSize: "12px", color: "#64748b", margin: "0 0 4px 0" },
  quizTitle: { fontSize: "20px", fontWeight: "700", color: "#1e293b", margin: 0 },
  timer: {
    padding: "10px 20px", borderRadius: "12px",
    fontSize: "18px", fontWeight: "800",
    flexShrink: 0,
  },
  quizProgressRow: {
    display: "flex", alignItems: "center", gap: "14px",
    marginBottom: "24px",
  },
  quizProgressText: { fontSize: "13px", color: "#64748b", whiteSpace: "nowrap" },
  quizProgressTrack: {
    flex: 1, height: "8px",
    background: "#e2e8f0", borderRadius: "10px",
  },
  quizProgressFill: {
    height: "8px", background: "#4f46e5",
    borderRadius: "10px", transition: "width 0.3s ease",
  },
  quizLayout: { display: "flex", gap: "20px", alignItems: "flex-start" },
  qSidebar: {
    width: "200px", background: "#fff",
    borderRadius: "16px", padding: "16px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
    position: "sticky", top: "20px", flexShrink: 0,
  },
  qSidebarHeading: {
    fontSize: "11px", fontWeight: "700",
    color: "#94a3b8", textTransform: "uppercase",
    letterSpacing: "1px", marginBottom: "12px",
  },
  qGrid: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px",
  },
  qDot: {
    width: "36px", height: "36px",
    borderRadius: "8px", fontSize: "12px",
    fontWeight: "700", cursor: "pointer",
    display: "flex", alignItems: "center",
    justifyContent: "center",
  },
  questionCard: {
    flex: 1, background: "#fff",
    borderRadius: "16px", padding: "28px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  },
  qLabel: {
    fontSize: "12px", fontWeight: "700",
    color: "#4f46e5", textTransform: "uppercase",
    letterSpacing: "1px", margin: "0 0 10px 0",
  },
  questionText: {
    fontSize: "17px", fontWeight: "600",
    color: "#1e293b", lineHeight: "1.6",
    margin: "0 0 24px 0",
  },
  optionsList: { display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" },
  optionItem: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "14px 16px", borderRadius: "12px",
    cursor: "pointer", transition: "all 0.15s ease",
  },
  optionLabel: {
    width: "28px", height: "28px", borderRadius: "8px",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "13px", fontWeight: "700", flexShrink: 0,
  },
  optionText: { fontSize: "14px", color: "#1e293b", lineHeight: "1.4" },
  qNav: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center",
  },
  qNavBtn: {
    padding: "11px 24px", borderRadius: "10px",
    border: "1px solid #e2e8f0", background: "#fff",
    color: "#1e293b", fontSize: "14px",
    fontWeight: "600", cursor: "pointer",
  },
};