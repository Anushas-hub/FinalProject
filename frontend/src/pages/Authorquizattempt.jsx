import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AuthorQuizAttempt() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const loggedInUser = localStorage.getItem("user");
  const loggedInRole = localStorage.getItem("role");

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [activeQ, setActiveQ] = useState(0);
  const timerRef = useRef(null);

  // ── Fetch quiz ─────────────────────────────────────────────────
  useEffect(() => {
    if (!loggedInUser) {
      navigate("/login", { state: { message: "Please login to attempt quizzes." } });
      return;
    }
    fetch(`http://127.0.0.1:8000/api/author/quiz-detail/${quizId}/`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) { setLoading(false); return; }
        setQuiz(d);
        setTimeLeft(d.time_limit * 60);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [quizId, loggedInUser, navigate]);

  // ── Timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) { handleSubmit(true); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [timeLeft === null, submitted]);

  useEffect(() => {
    if (timeLeft === 0 && !submitted) handleSubmit(true);
  }, [timeLeft]);

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = (autoSubmit = false) => {
    if (submitted) return;
    clearInterval(timerRef.current);
    setSubmitting(true);

    fetch("http://127.0.0.1:8000/api/author/submit-quiz/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quiz_id: quizId, answers }),
    })
      .then((r) => r.json())
      .then((d) => {
        setResult(d);
        setSubmitted(true);
        setSubmitting(false);

        // 🆕 Track author quiz attempt for leaderboard (students only)
        if (loggedInUser && loggedInRole !== "author") {
          fetch("http://127.0.0.1:8000/api/save-author-quiz-attempt/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: loggedInUser,
              quiz_id: quizId,
              quiz_title: quiz?.title || "",
              score: d.score || 0,
              total_marks: d.total_marks || 0,
            }),
          }).catch(() => {});
        }
      })
      .catch(() => setSubmitting(false));
  };

  // ── Timer format ───────────────────────────────────────────────
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const timerColor =
    timeLeft !== null && timeLeft < 60
      ? "#d15f5f"
      : timeLeft < 180
      ? "#d97706"
      : "#4f46e5";

  if (loading) return <><Navbar /><div style={S.centerMsg}>Loading quiz...</div></>;
  if (!quiz) return <><Navbar /><div style={S.centerMsg}>Quiz not found.</div></>;

  const diffColor = {
    easy: { bg: "#dcfce7", text: "#166534" },
    medium: { bg: "#fef9c3", text: "#854d0e" },
    hard: { bg: "#fee2e2", text: "#991b1b" },
  };
  const dc = diffColor[quiz.difficulty] || diffColor.easy;
  const answeredCount = Object.keys(answers).length;
  const totalQ = quiz.questions?.length || 0;

  // ── RESULT PAGE ────────────────────────────────────────────────
  if (submitted && result) {
    const pct = result.percentage;
    const passed = pct >= 50;

    return (
      <>
        <Navbar />
        <div style={S.resultPage}>
          <div style={{ ...S.resultHero, background: passed ? "linear-gradient(135deg,#4f46e5,#06b6d4)" : "linear-gradient(135deg,#dc2626,#f97316)" }}>
            <div style={S.resultEmoji}>{pct >= 80 ? "" : pct >= 50 ? "✅" : ""}</div>
            <h1 style={S.resultTitle}>{pct >= 80 ? "Excellent!" : pct >= 50 ? "Well Done!" : "Keep Practicing!"}</h1>
            <p style={S.resultSubtitle}>{quiz.title}</p>
            <div style={S.scoreBig}>{result.score} / {result.total_marks}</div>
            <div style={S.percentBadge}>{pct}%</div>
          </div>

          <div style={S.resultBody}>
            <div style={S.statsRow}>
              <div style={S.statCard}>
                <span style={S.statBig}>{result.correct_count}</span>
                <span style={S.statSmall}>Correct</span>
              </div>
              <div style={S.statCard}>
                <span style={S.statBig}>{result.total_questions - result.correct_count}</span>
                <span style={S.statSmall}>Wrong</span>
              </div>
              <div style={S.statCard}>
                <span style={S.statBig}>{result.total_questions}</span>
                <span style={S.statSmall}>Total Qs</span>
              </div>
              <div style={S.statCard}>
                <span style={{ ...S.statBig, color: passed ? "#16a34a" : "#dc2626" }}>
                  {passed ? "Pass ✓" : "Fail ✗"}
                </span>
                <span style={S.statSmall}>Result</span>
              </div>
            </div>

            <h3 style={S.reviewHeading}>Detailed Review</h3>
            {result.results?.map((r, i) => (
              <div key={r.id} style={{ ...S.reviewCard, borderLeft: r.is_correct ? "4px solid #22c55e" : "4px solid #ef4444" }}>
                <div style={S.reviewQHeader}>
                  <span style={S.reviewQNum}>Q{i + 1}</span>
                  <span style={{ ...S.reviewBadge, background: r.is_correct ? "#dcfce7" : "#fee2e2", color: r.is_correct ? "#166534" : "#991b1b" }}>
                    {r.is_correct ? `+${r.marks} marks ✓` : "0 marks ✗"}
                  </span>
                </div>
                <p style={S.reviewQ}>{r.question}</p>
                <div style={S.reviewOptions}>
                  {[
                    { key: "A", val: r.option_a },
                    { key: "B", val: r.option_b },
                    { key: "C", val: r.option_c },
                    { key: "D", val: r.option_d },
                  ].filter((o) => o.val).map((opt) => {
                    const isCorrect = opt.key === r.correct_answer;
                    const isYours = opt.key === r.your_answer;
                    let bg = "#f8fafc", border = "#e2e8f0", color = "#334155";
                    if (isCorrect) { bg = "#dcfce7"; border = "#22c55e"; color = "#166534"; }
                    else if (isYours && !isCorrect) { bg = "#fee2e2"; border = "#ef4444"; color = "#991b1b"; }
                    return (
                      <div key={opt.key} style={{ ...S.reviewOpt, background: bg, border: `1.5px solid ${border}`, color }}>
                        <span style={S.reviewOptKey}>{opt.key}</span>
                        <span>{opt.val}</span>
                        {isCorrect && <span style={S.reviewCorrectTag}>✓ Correct</span>}
                        {isYours && !isCorrect && <span style={S.reviewWrongTag}>✗ Your Answer</span>}
                      </div>
                    );
                  })}
                </div>
                {r.explanation && (
                  <div style={S.explanationBox}>
                    <span style={S.explanationLabel}> Explanation:</span> {r.explanation}
                  </div>
                )}
              </div>
            ))}

            <div style={S.resultActions}>
              <button style={S.backMaterialBtn} onClick={() => navigate(-1)}>← Back to Material</button>
              <button style={S.retryBtn} onClick={() => {
                setSubmitted(false); setResult(null); setAnswers({});
                setActiveQ(0); setTimeLeft(quiz.time_limit * 60);
              }}>
                Retry Quiz
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── QUIZ ATTEMPT PAGE ──────────────────────────────────────────
  const currentQ = quiz.questions?.[activeQ];

  return (
    <>
      <Navbar />
      <div style={S.page}>
        <div style={S.topBar}>
          <div style={S.topLeft}>
            <button style={S.exitBtn} onClick={() => navigate(-1)}>✕ Exit</button>
            <div>
              <h2 style={S.quizTitle}>{quiz.title}</h2>
              <div style={S.quizMeta}>
                <span style={{ ...S.diffPill, background: dc.bg, color: dc.text }}>
                  {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                </span>
                <span style={S.metaPill}>{totalQ} Questions</span>
                <span style={S.metaPill}>{quiz.total_marks} Marks</span>
              </div>
            </div>
          </div>
          <div style={{ ...S.timerBox, borderColor: timerColor }}>
            <span style={S.timerIcon}>⏱</span>
            <span style={{ ...S.timerText, color: timerColor }}>{formatTime(timeLeft)}</span>
          </div>
        </div>

        <div style={S.body}>
          <div style={S.navigator}>
            <p style={S.navTitle}>Questions</p>
            <div style={S.navGrid}>
              {quiz.questions?.map((q, i) => {
                const ans = answers[q.id];
                return (
                  <button
                    key={q.id}
                    style={{
                      ...S.navBtn,
                      background: i === activeQ ? "#4f46e5" : ans ? "#22c55e" : "#fff",
                      color: i === activeQ || ans ? "#fff" : "#64748b",
                      border: i === activeQ ? "2px solid #4f46e5" : ans ? "2px solid #22c55e" : "2px solid #e2e8f0",
                    }}
                    onClick={() => setActiveQ(i)}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div style={S.progressBox}>
              <div style={S.progressBar}>
                <div style={{ ...S.progressFill, width: `${(answeredCount / totalQ) * 100}%` }} />
              </div>
              <p style={S.progressText}>{answeredCount}/{totalQ} Answered</p>
            </div>
            <button
              style={{ ...S.submitBtn, opacity: submitting ? 0.7 : 1 }}
              onClick={() => handleSubmit(false)}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
            {answeredCount < totalQ && (
              <p style={S.unattemptedWarning}>
                ⚠ {totalQ - answeredCount} question{totalQ - answeredCount > 1 ? "s" : ""} unanswered
              </p>
            )}
          </div>

          <div style={S.questionPanel}>
            {currentQ && (
              <>
                <div style={S.qHeader}>
                  <span style={S.qNum}>Question {activeQ + 1} of {totalQ}</span>
                  <span style={S.qMarks}>{currentQ.marks} mark{currentQ.marks > 1 ? "s" : ""}</span>
                </div>
                <p style={S.qText}>{currentQ.question}</p>
                <div style={S.optionsList}>
                  {[
                    { key: "A", val: currentQ.option_a },
                    { key: "B", val: currentQ.option_b },
                    { key: "C", val: currentQ.option_c },
                    { key: "D", val: currentQ.option_d },
                  ].filter((o) => o.val).map((opt) => {
                    const selected = answers[currentQ.id] === opt.key;
                    return (
                      <button
                        key={opt.key}
                        style={{
                          ...S.optBtn,
                          background: selected ? "#e0e7ff" : "#fff",
                          border: selected ? "2px solid #4f46e5" : "2px solid #e2e8f0",
                          color: selected ? "#4f46e5" : "#334155",
                        }}
                        onClick={() => setAnswers((prev) => ({ ...prev, [currentQ.id]: opt.key }))}
                      >
                        <span style={{ ...S.optKey, background: selected ? "#4f46e5" : "#f1f5f9", color: selected ? "#fff" : "#64748b" }}>
                          {opt.key}
                        </span>
                        <span style={S.optText}>{opt.val}</span>
                      </button>
                    );
                  })}
                </div>
                {answers[currentQ.id] && (
                  <button style={S.clearBtn} onClick={() => setAnswers((prev) => { const n = { ...prev }; delete n[currentQ.id]; return n; })}>
                    Clear Answer
                  </button>
                )}
                <div style={S.navBtns}>
                  <button style={{ ...S.prevBtn, opacity: activeQ === 0 ? 0.4 : 1 }} onClick={() => setActiveQ((p) => Math.max(0, p - 1))} disabled={activeQ === 0}>← Previous</button>
                  <button style={{ ...S.nextBtn, opacity: activeQ === totalQ - 1 ? 0.4 : 1 }} onClick={() => setActiveQ((p) => Math.min(totalQ - 1, p + 1))} disabled={activeQ === totalQ - 1}>Next →</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

const S = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg,#f0f9ff,#f5f3ff,#ecfdf5)" },
  centerMsg: { textAlign: "center", marginTop: "80px", fontSize: "16px", color: "#64748b" },
  topBar: { background: "#fff", padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", flexWrap: "wrap", gap: "12px" },
  topLeft: { display: "flex", alignItems: "center", gap: "16px" },
  exitBtn: { padding: "8px 16px", borderRadius: "20px", border: "1.5px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  quizTitle: { fontSize: "18px", fontWeight: "700", color: "#1e293b", margin: "0 0 4px 0" },
  quizMeta: { display: "flex", gap: "8px", flexWrap: "wrap" },
  diffPill: { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  metaPill: { padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: "#f1f5f9", color: "#475569" },
  timerBox: { display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "12px", border: "2px solid", background: "#fff" },
  timerIcon: { fontSize: "18px" },
  timerText: { fontSize: "22px", fontWeight: "700", fontFamily: "monospace" },
  body: { display: "flex", gap: "24px", padding: "24px 40px", maxWidth: "1200px", margin: "0 auto" },
  navigator: { width: "220px", flexShrink: 0 },
  navTitle: { fontSize: "13px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" },
  navGrid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", marginBottom: "20px" },
  navBtn: { width: "100%", aspectRatio: "1", borderRadius: "8px", border: "2px solid", fontSize: "13px", fontWeight: "700", cursor: "pointer" },
  progressBox: { marginBottom: "16px" },
  progressBar: { height: "6px", background: "#e2e8f0", borderRadius: "10px", overflow: "hidden", marginBottom: "6px" },
  progressFill: { height: "100%", background: "linear-gradient(90deg,#4f46e5,#06b6d4)", borderRadius: "10px", transition: "width 0.3s ease" },
  progressText: { fontSize: "12px", color: "#64748b", textAlign: "center", margin: 0 },
  submitBtn: { width: "100%", padding: "13px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", fontSize: "14px", fontWeight: "700", cursor: "pointer", marginBottom: "10px" },
  unattemptedWarning: { fontSize: "12px", color: "#d97706", textAlign: "center", margin: 0 },
  questionPanel: { flex: 1, background: "#fff", borderRadius: "16px", padding: "32px", boxShadow: "0 10px 25px rgba(0,0,0,0.06)" },
  qHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" },
  qNum: { fontSize: "13px", fontWeight: "600", color: "#64748b", background: "#f1f5f9", padding: "6px 14px", borderRadius: "20px" },
  qMarks: { fontSize: "13px", fontWeight: "600", color: "#4f46e5", background: "#e0e7ff", padding: "6px 14px", borderRadius: "20px" },
  qText: { fontSize: "17px", fontWeight: "600", color: "#1e293b", lineHeight: "1.6", marginBottom: "24px" },
  optionsList: { display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" },
  optBtn: { display: "flex", alignItems: "center", gap: "14px", padding: "14px 18px", borderRadius: "12px", border: "2px solid", cursor: "pointer", textAlign: "left", transition: "all 0.15s ease", width: "100%" },
  optKey: { width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "700", flexShrink: 0 },
  optText: { fontSize: "15px", lineHeight: "1.4" },
  clearBtn: { background: "none", border: "none", color: "#94a3b8", fontSize: "12px", cursor: "pointer", marginBottom: "16px", textDecoration: "underline" },
  navBtns: { display: "flex", justifyContent: "space-between", marginTop: "8px" },
  prevBtn: { padding: "10px 24px", borderRadius: "10px", border: "1.5px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  nextBtn: { padding: "10px 24px", borderRadius: "10px", border: "none", background: "#4f46e5", color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  resultPage: { minHeight: "100vh", background: "#f8fafc" },
  resultHero: { padding: "50px 40px", textAlign: "center", color: "#fff" },
  resultEmoji: { fontSize: "52px", marginBottom: "10px" },
  resultTitle: { fontSize: "32px", fontWeight: "800", margin: "0 0 6px 0" },
  resultSubtitle: { fontSize: "16px", opacity: 0.85, margin: "0 0 20px 0" },
  scoreBig: { fontSize: "48px", fontWeight: "800", margin: "0 0 8px 0" },
  percentBadge: { display: "inline-block", background: "rgba(255,255,255,0.25)", padding: "8px 24px", borderRadius: "30px", fontSize: "18px", fontWeight: "700" },
  resultBody: { maxWidth: "860px", margin: "0 auto", padding: "30px 20px 60px" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "16px", marginBottom: "32px" },
  statCard: { background: "#fff", borderRadius: "14px", padding: "20px", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "4px" },
  statBig: { fontSize: "26px", fontWeight: "800", color: "#1e293b" },
  statSmall: { fontSize: "12px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" },
  reviewHeading: { fontSize: "18px", fontWeight: "700", color: "#1e293b", marginBottom: "16px" },
  reviewCard: { background: "#fff", borderRadius: "14px", padding: "22px", marginBottom: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" },
  reviewQHeader: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" },
  reviewQNum: { background: "#f1f5f9", color: "#475569", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" },
  reviewBadge: { padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" },
  reviewQ: { fontSize: "15px", fontWeight: "600", color: "#1e293b", lineHeight: "1.5", marginBottom: "14px" },
  reviewOptions: { display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" },
  reviewOpt: { display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", fontSize: "14px" },
  reviewOptKey: { width: "26px", height: "26px", borderRadius: "50%", background: "rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700", flexShrink: 0 },
  reviewCorrectTag: { marginLeft: "auto", fontSize: "11px", fontWeight: "700", color: "#166534" },
  reviewWrongTag: { marginLeft: "auto", fontSize: "11px", fontWeight: "700", color: "#991b1b" },
  explanationBox: { background: "#fefce8", border: "1px solid #fde68a", borderRadius: "10px", padding: "12px 14px", fontSize: "13px", color: "#713f12", lineHeight: "1.5" },
  explanationLabel: { fontWeight: "700" },
  resultActions: { display: "flex", gap: "14px", marginTop: "32px", justifyContent: "center", flexWrap: "wrap" },
  backMaterialBtn: { padding: "13px 28px", borderRadius: "12px", border: "2px solid #e2e8f0", background: "#fff", color: "#475569", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  retryBtn: { padding: "13px 28px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", fontSize: "14px", fontWeight: "700", cursor: "pointer" },
};