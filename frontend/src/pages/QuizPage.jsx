import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";

function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/quizzes/${id}/`)
      .then(res => res.json())
      .then(data => {
        setQuiz(data);
        if (data.time_limit) {
          setTimeLeft(data.time_limit * 60);
        }
      });
  }, [id]);

  // ── TIMER ──
  useEffect(() => {
    if (timeLeft === null || submitted) return;
    if (timeLeft <= 0) {
      handleSubmit(true);
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timeLeft, submitted]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSelect = (qIndex, option) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qIndex]: option }));
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (submitted) return;
    clearTimeout(timerRef.current);
    setSubmitted(true);

    let correct = 0;
    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.answer) correct++;
    });
    setScore(correct);

    const user = localStorage.getItem("user");
    if (user) {
      await fetch("http://127.0.0.1:8000/api/save-quiz-attempt/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: user,
          quiz_id: quiz.id,
          score: correct,
          total: quiz.questions.length,
        }),
      });
    }
  };

  if (!quiz) {
    return (
      <>
        <Navbar />
        <div style={S.loadingPage}>
          <div style={S.loadingBox}>
            <div style={S.loadingSpinner}>⏳</div>
            <p style={S.loadingText}>Loading Quiz...</p>
          </div>
        </div>
      </>
    );
  }

  const total = quiz.questions.length;
  const answered = Object.keys(answers).length;
  const progress = Math.round((answered / total) * 100);
  const pct = score !== null ? Math.round((score / total) * 100) : 0;

  // ── RESULT SCREEN ──
  if (submitted && score !== null) {
    return (
      <>
        <Navbar />
        <div style={S.resultPage}>
          <div style={S.resultCard}>

            {/* Score circle */}
            <div style={{
              ...S.scoreCircle,
              background: pct >= 70
                ? "linear-gradient(135deg,#10b981,#059669)"
                : pct >= 40
                ? "linear-gradient(135deg,#f59e0b,#d97706)"
                : "linear-gradient(135deg,#ef4444,#dc2626)",
            }}>
              <span style={S.scorePct}>{pct}%</span>
              <span style={S.scoreLabel}>Score</span>
            </div>

            <h2 style={S.resultTitle}>
              {pct >= 70 ? "Excellent!" : pct >= 40 ? "Good Try!" : "Keep Practicing!"}
            </h2>

            <p style={S.resultSub}>
              You scored <strong>{score}</strong> out of <strong>{total}</strong> questions correctly
            </p>

            {/* Stats row */}
            <div style={S.statsRow}>
              <div style={S.statBox}>
                <span style={S.statNum}>{score}</span>
                <span style={S.statLabel2}>Correct</span>
              </div>
              <div style={S.statDivider} />
              <div style={S.statBox}>
                <span style={S.statNum}>{total - score}</span>
                <span style={S.statLabel2}>Wrong</span>
              </div>
              <div style={S.statDivider} />
              <div style={S.statBox}>
                <span style={S.statNum}>{pct}%</span>
                <span style={S.statLabel2}>Accuracy</span>
              </div>
            </div>

            {/* Answer review */}
            <div style={S.reviewSection}>
              <h3 style={S.reviewTitle}> Answer Review</h3>
              {quiz.questions.map((q, i) => {
                const userAns = answers[i];
                const isCorrect = userAns === q.answer;
                return (
                  <div key={i} style={{
                    ...S.reviewItem,
                    borderLeft: `4px solid ${isCorrect ? "#10b981" : "#ef4444"}`,
                  }}>
                    <p style={S.reviewQ}>
                      <strong>Q{i + 1}:</strong> {q.question}
                    </p>
                    <p style={{ ...S.reviewAns, color: isCorrect ? "#10b981" : "#ef4444" }}>
                      {isCorrect ? "✅" : "❌"} Your answer: <strong>{userAns || "Not answered"}</strong>
                    </p>
                    {!isCorrect && (
                      <p style={S.correctAns}>
                        ✔ Correct: <strong>{q.answer}</strong>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action buttons */}
            <div style={S.resultBtns}>
              <button style={S.retryBtn} onClick={() => {
                setAnswers({});
                setScore(null);
                setSubmitted(false);
                setCurrentQ(0);
                if (quiz.time_limit) setTimeLeft(quiz.time_limit * 60);
              }}>
                 Retry Quiz
              </button>
              <button style={S.backBtn2} onClick={() => navigate(-1)}>
                ← Go Back
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const q = quiz.questions[currentQ];

  // ── QUIZ SCREEN ──
  return (
    <>
      <Navbar />
      <div style={S.page}>

        {/* ── HEADER ── */}
        <div style={S.header}>
          <div style={S.headerInner}>

            <div style={S.headerLeft}>
              <h2 style={S.quizTitle}>{quiz.title}</h2>
              <p style={S.quizSub}>
                Question {currentQ + 1} of {total}
              </p>
            </div>

            {/* Timer */}
            {timeLeft !== null && (
              <div style={{
                ...S.timerBox,
                background: timeLeft < 30
                  ? "linear-gradient(135deg,#ef4444,#dc2626)"
                  : timeLeft < 60
                  ? "linear-gradient(135deg,#f59e0b,#d97706)"
                  : "linear-gradient(135deg,#4f46e5,#7c3aed)",
              }}>
                <span style={S.timerIcon}>⏱</span>
                <span style={S.timerText}>{formatTime(timeLeft)}</span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div style={S.progressWrap}>
            <div style={S.progressTrack}>
              <div style={{ ...S.progressFill, width: `${progress}%` }} />
            </div>
            <span style={S.progressLabel}>{answered}/{total} answered</span>
          </div>
        </div>

        {/* ── QUESTION AREA ── */}
        <div style={S.questionWrap}>

          {/* Question card */}
          <div style={S.questionCard}>
            <div style={S.qNumBadge}>Q{currentQ + 1}</div>
            <h3 style={S.questionText}>{q.question}</h3>
          </div>

          {/* Options */}
          <div style={S.optionsGrid}>
            {q.options.map((opt, i) => {
              const isSelected = answers[currentQ] === opt;
              const optLabel = ["A", "B", "C", "D"][i];
              return (
                <div
                  key={i}
                  style={{
                    ...S.optionCard,
                    ...(isSelected ? S.optionSelected : {}),
                  }}
                  onClick={() => handleSelect(currentQ, opt)}
                >
                  <div style={{
                    ...S.optionLabel,
                    ...(isSelected ? S.optionLabelSelected : {}),
                  }}>
                    {optLabel}
                  </div>
                  <span style={S.optionText}>{opt}</span>
                  {isSelected && <span style={S.optionTick}>✓</span>}
                </div>
              );
            })}
          </div>

          {/* Navigation */}
          <div style={S.navRow}>
            <button
              style={{
                ...S.navBtn,
                opacity: currentQ === 0 ? 0.4 : 1,
                cursor: currentQ === 0 ? "not-allowed" : "pointer",
              }}
              onClick={() => currentQ > 0 && setCurrentQ(c => c - 1)}
              disabled={currentQ === 0}
            >
              ← Previous
            </button>

            {/* Question dots */}
            <div style={S.dots}>
              {quiz.questions.map((_, i) => (
                <div
                  key={i}
                  style={{
                    ...S.dot,
                    background: answers[i]
                      ? "#4f46e5"
                      : i === currentQ
                      ? "#c4b5fd"
                      : "#e2e8f0",
                    transform: i === currentQ ? "scale(1.3)" : "scale(1)",
                  }}
                  onClick={() => setCurrentQ(i)}
                />
              ))}
            </div>

            {currentQ < total - 1 ? (
              <button
                style={S.navBtnNext}
                onClick={() => setCurrentQ(c => c + 1)}
              >
                Next →
              </button>
            ) : (
              <button
                style={{
                  ...S.submitBtn,
                  opacity: answered === 0 ? 0.6 : 1,
                }}
                onClick={() => handleSubmit(false)}
              >
                 Submit Quiz
              </button>
            )}
          </div>

          {/* Answered progress hint */}
          {answered < total && (
            <p style={S.hintText}>
              ⚠️ {total - answered} question{total - answered !== 1 ? "s" : ""} unanswered
            </p>
          )}
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────
const S = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#f0f9ff,#f5f3ff,#ecfdf5)",
    paddingBottom: "60px",
    fontFamily: "'Segoe UI', sans-serif",
  },

  // LOADING
  loadingPage: {
    minHeight: "80vh", display: "flex",
    alignItems: "center", justifyContent: "center",
  },
  loadingBox: { textAlign: "center" },
  loadingSpinner: { fontSize: "48px", marginBottom: "16px" },
  loadingText: { color: "#64748b", fontSize: "16px" },

  // HEADER
  header: {
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    padding: "24px 40px 20px",
    color: "#fff",
  },
  headerInner: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", maxWidth: "800px", margin: "0 auto 16px",
  },
  headerLeft: {},
  quizTitle: {
    fontSize: "20px", fontWeight: "700",
    margin: "0 0 4px 0", color: "#fff",
  },
  quizSub: { fontSize: "13px", opacity: 0.8, margin: 0 },

  timerBox: {
    display: "flex", alignItems: "center", gap: "8px",
    padding: "10px 18px", borderRadius: "30px",
    color: "#fff", fontWeight: "700",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  timerIcon: { fontSize: "16px" },
  timerText: { fontSize: "20px", fontFamily: "monospace", letterSpacing: "1px" },

  progressWrap: {
    display: "flex", alignItems: "center",
    gap: "12px", maxWidth: "800px", margin: "0 auto",
  },
  progressTrack: {
    flex: 1, height: "6px",
    background: "rgba(255,255,255,0.2)",
    borderRadius: "10px", overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "#fff",
    borderRadius: "10px",
    transition: "width 0.3s ease",
  },
  progressLabel: { fontSize: "12px", opacity: 0.8, whiteSpace: "nowrap" },

  // QUESTION AREA
  questionWrap: {
    maxWidth: "800px", margin: "36px auto",
    padding: "0 20px",
  },
  questionCard: {
    background: "#fff", borderRadius: "16px",
    padding: "28px", marginBottom: "20px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
  },
  qNumBadge: {
    display: "inline-block",
    background: "#ede9fe", color: "#7c3aed",
    padding: "4px 14px", borderRadius: "20px",
    fontSize: "12px", fontWeight: "700",
    marginBottom: "14px",
  },
  questionText: {
    fontSize: "18px", fontWeight: "700",
    color: "#1e293b", margin: 0, lineHeight: "1.5",
  },

  // OPTIONS
  optionsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px", marginBottom: "24px",
  },
  optionCard: {
    display: "flex", alignItems: "center", gap: "14px",
    background: "#fff", borderRadius: "12px",
    padding: "16px", cursor: "pointer",
    border: "2px solid #e2e8f0",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  optionSelected: {
    border: "2px solid #4f46e5",
    background: "#f5f3ff",
    boxShadow: "0 4px 14px rgba(79,70,229,0.15)",
  },
  optionLabel: {
    width: "34px", height: "34px",
    borderRadius: "50%",
    background: "#f1f5f9",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: "700", fontSize: "14px",
    color: "#64748b", flexShrink: 0,
  },
  optionLabelSelected: {
    background: "#4f46e5", color: "#fff",
  },
  optionText: {
    fontSize: "14px", color: "#1e293b",
    fontWeight: "500", flex: 1,
  },
  optionTick: {
    color: "#4f46e5", fontWeight: "700", fontSize: "16px",
  },

  // NAVIGATION
  navRow: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", gap: "12px",
  },
  navBtn: {
    padding: "11px 22px",
    border: "2px solid #e2e8f0",
    background: "#fff", borderRadius: "10px",
    fontSize: "14px", fontWeight: "600",
    color: "#475569", cursor: "pointer",
  },
  navBtnNext: {
    padding: "11px 22px",
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    color: "#fff", border: "none",
    borderRadius: "10px", fontSize: "14px",
    fontWeight: "600", cursor: "pointer",
  },
  submitBtn: {
    padding: "11px 26px",
    background: "linear-gradient(135deg,#10b981,#059669)",
    color: "#fff", border: "none",
    borderRadius: "10px", fontSize: "14px",
    fontWeight: "700", cursor: "pointer",
    boxShadow: "0 4px 12px rgba(16,185,129,0.3)",
  },
  dots: {
    display: "flex", gap: "8px",
    alignItems: "center", flexWrap: "wrap",
    justifyContent: "center", flex: 1,
  },
  dot: {
    width: "10px", height: "10px",
    borderRadius: "50%",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  hintText: {
    textAlign: "center", color: "#f59e0b",
    fontSize: "13px", marginTop: "16px",
    fontWeight: "600",
  },

  // RESULT SCREEN
  resultPage: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#f0f9ff,#f5f3ff,#ecfdf5)",
    padding: "40px 20px 60px",
    display: "flex", alignItems: "flex-start",
    justifyContent: "center",
  },
  resultCard: {
    background: "#fff", borderRadius: "20px",
    padding: "40px", maxWidth: "700px", width: "100%",
    boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  scoreCircle: {
    width: "120px", height: "120px",
    borderRadius: "50%",
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    margin: "0 auto 24px",
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
  },
  scorePct: {
    fontSize: "28px", fontWeight: "800", color: "#fff",
  },
  scoreLabel: {
    fontSize: "11px", color: "rgba(255,255,255,0.8)",
    fontWeight: "600", textTransform: "uppercase",
  },
  resultTitle: {
    fontSize: "24px", fontWeight: "800",
    color: "#1e293b", margin: "0 0 10px 0",
  },
  resultSub: {
    fontSize: "15px", color: "#64748b",
    margin: "0 0 28px 0",
  },
  statsRow: {
    display: "flex", justifyContent: "center",
    alignItems: "center",
    background: "#f8fafc", borderRadius: "14px",
    padding: "20px", marginBottom: "30px",
  },
  statBox: { textAlign: "center", padding: "0 28px" },
  statNum: {
    display: "block", fontSize: "24px",
    fontWeight: "800", color: "#1e293b",
  },
  statLabel2: {
    fontSize: "12px", color: "#64748b",
    fontWeight: "500",
  },
  statDivider: {
    width: "1px", height: "40px",
    background: "#e2e8f0",
  },
  reviewSection: {
    textAlign: "left", marginBottom: "28px",
  },
  reviewTitle: {
    fontSize: "16px", fontWeight: "700",
    color: "#1e293b", marginBottom: "14px",
  },
  reviewItem: {
    background: "#f9fafb",
    borderRadius: "10px",
    padding: "14px 16px",
    marginBottom: "10px",
  },
  reviewQ: {
    fontSize: "14px", color: "#1e293b",
    margin: "0 0 6px 0",
  },
  reviewAns: {
    fontSize: "13px", margin: "0 0 4px 0",
    fontWeight: "500",
  },
  correctAns: {
    fontSize: "13px", color: "#10b981",
    margin: 0, fontWeight: "600",
  },
  resultBtns: {
    display: "flex", gap: "12px",
    justifyContent: "center", flexWrap: "wrap",
  },
  retryBtn: {
    padding: "12px 28px",
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    color: "#fff", border: "none",
    borderRadius: "12px", fontSize: "15px",
    fontWeight: "700", cursor: "pointer",
  },
  backBtn2: {
    padding: "12px 28px",
    background: "#fff",
    color: "#475569",
    border: "2px solid #e2e8f0",
    borderRadius: "12px", fontSize: "15px",
    fontWeight: "600", cursor: "pointer",
  },
};

export default QuizPage;