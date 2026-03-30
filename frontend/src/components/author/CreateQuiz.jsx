import { useState, useEffect } from "react";
import axios from "axios";

export default function CreateQuiz() {
  const username = localStorage.getItem("user");
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    difficulty: "easy",
    time_limit: 10,
    material_id: "",
  });

  const [questions, setQuestions] = useState([]);

  // ─── FETCH MATERIALS ───
  useEffect(() => {
    const fetchData = async () => {
      try {
        const matRes = await axios.get(
          `http://127.0.0.1:8000/api/author/my-materials/${username}/`
        );
        setMaterials(matRes.data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    };
    if (username) fetchData();
  }, [username]);

  // ─── AUTO TITLE from material ───
  useEffect(() => {
    if (quizData.material_id) {
      const selected = materials.find((m) => m.id == quizData.material_id);
      if (selected) {
        setQuizData((prev) => ({ ...prev, title: `${selected.title} Quiz` }));
      }
    }
  }, [quizData.material_id, materials]);

  const filteredMaterials = materials.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  // ─── QUESTION HANDLERS ───
  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        optionA: "",
        optionB: "",
        optionC: "",
        optionD: "",
        correct: "A",
        marks: 1,
        explanation: "",
      },
    ]);
  };

  const deleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  // ─── SUBMIT ───
  const handleSubmit = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!quizData.title.trim()) {
      setErrorMsg("Quiz title is required.");
      return;
    }
    if (questions.length === 0) {
      setErrorMsg("Add at least 1 question.");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        setErrorMsg(`Q${i + 1}: Question text is empty.`);
        return;
      }
      if (!q.optionA.trim() || !q.optionB.trim()) {
        setErrorMsg(`Q${i + 1}: Option A & B are required.`);
        return;
      }
    }

    const formattedQuestions = questions.map((q) => ({
      question: q.question,
      option_a: q.optionA,
      option_b: q.optionB,
      option_c: q.optionC,
      option_d: q.optionD,
      correct_answer: q.correct,
      marks: q.marks,
      explanation: q.explanation,
    }));

    setLoading(true);
    try {
      await axios.post(
        "http://127.0.0.1:8000/api/author/create-quiz-with-questions/",
        {
          username,
          ...quizData,
          link_type: "material",
          questions: formattedQuestions,
        }
      );

      setSuccessMsg("Quiz Created Successfully! ✅");
      setQuizData({
        title: "",
        description: "",
        difficulty: "easy",
        time_limit: 10,
        material_id: "",
      });
      setQuestions([]);
      setSearch("");
    } catch (err) {
      const msg = err.response?.data?.error || "Something went wrong.";
      setErrorMsg(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.header}>
        <h2 style={S.heading}>Create Quiz</h2>
        <p style={S.sub}>Build a quiz and link it to your study material</p>
      </div>

      {successMsg && <div style={S.success}>{successMsg}</div>}
      {errorMsg && <div style={S.error}>{errorMsg}</div>}

      {/* ── BASIC INFO ── */}
      <div style={S.card}>
        <div style={S.cardHeader}>
        <h3 style={S.cardTitle}>Basic Info</h3>
        </div>

        <label style={S.label}>Quiz Title</label>
        <input
          style={S.input}
          placeholder="Quiz title (auto-fills when material selected)"
          value={quizData.title}
          onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
        />

        <label style={S.label}>Description(optional)</label>
        <textarea
          style={{ ...S.input, height: "80px", resize: "vertical" }}
          placeholder="Briefly describe this quiz..."
          value={quizData.description}
          onChange={(e) =>
            setQuizData({ ...quizData, description: e.target.value })
          }
        />

        <div style={S.row}>
          {/* DIFFICULTY */}
          <div style={{ flex: 1 }}>
            <label style={S.label}>Difficulty</label>
            <select
              style={S.input}
              value={quizData.difficulty}
              onChange={(e) =>
                setQuizData({ ...quizData, difficulty: e.target.value })
              }
            >
              <option value="easy">Easy 🟢</option>
              <option value="medium">Medium 🟡</option>
              <option value="hard">Hard 🔴</option>
            </select>
          </div>

          {/* TIME LIMIT — proper dropdown */}
          <div style={{ flex: 1 }}>
            <label style={S.label}>⏱ Time Limit</label>
            <select
              style={S.input}
              value={quizData.time_limit}
              onChange={(e) =>
                setQuizData({
                  ...quizData,
                  time_limit: parseInt(e.target.value),
                })
              }
            >
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
              <option value="15">15 minutes</option>
              <option value="20">20 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
            </select>

            {/* TIMER PREVIEW BADGE */}
            <div style={S.timerBadge}>
              ⏳ Students will get{" "}
              <strong>
                {quizData.time_limit >= 60
                  ? `${quizData.time_limit / 60} hr${quizData.time_limit > 60 ? "s" : ""}`
                  : `${quizData.time_limit} min`}
              </strong>{" "}
              to complete this quiz
            </div>
          </div>
        </div>
      </div>

      {/* ── LINK MATERIAL ── */}
      <div style={S.card}>
        <div style={S.cardHeader}>
          <h3 style={S.cardTitle}>Link Study Material</h3>
        </div>

        <label style={S.label}>Search Material</label>
        <input
          style={S.input}
          placeholder="Type to search your materials..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <label style={S.label}>Select Material</label>
        <select
          style={S.input}
          value={quizData.material_id}
          onChange={(e) =>
            setQuizData({ ...quizData, material_id: e.target.value })
          }
        >
          <option value="">— Select a material (optional) —</option>
          {filteredMaterials.length === 0 && (
            <option disabled>No materials found</option>
          )}
          {filteredMaterials.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title} ({m.subject})
            </option>
          ))}
        </select>

        {/* SELECTED MATERIAL PREVIEW */}
        {quizData.material_id && (() => {
          const sel = materials.find((m) => m.id == quizData.material_id);
          return sel ? (
            <div style={S.materialPreview}>
              <span style={S.previewIcon}>📖</span>
              <div>
                <div style={S.previewTitle}>{sel.title}</div>
                <div style={S.previewSub}>
                  {sel.subject} &nbsp;|&nbsp; {sel.course?.toUpperCase()} &nbsp;|&nbsp; {sel.semester?.toUpperCase()}
                </div>
              </div>
            </div>
          ) : null;
        })()}
      </div>

      {/* ── QUESTIONS ── */}
      <div style={S.card}>
        <div style={S.cardHeader}>
          <h3 style={S.cardTitle}>Questions ({questions.length})</h3>
            <span style={S.cardIcon}>❓</span>

        </div>

        {questions.length === 0 && (
          <div style={S.emptyBox}>
            No questions yet. Click <strong>+ Add Question</strong> to begin.
          </div>
        )}

        {questions.map((q, index) => (
          <div key={index} style={S.qBox}>
            <div style={S.qHeader}>
              <span style={S.qNum}>Q{index + 1}</span>
              <button style={S.removeBtn} onClick={() => deleteQuestion(index)}>
                ✕ Remove
              </button>
            </div>

            <label style={S.label}>Question</label>
            <textarea
              style={{ ...S.input, height: "70px", resize: "vertical" }}
              placeholder="Enter question text..."
              value={q.question}
              onChange={(e) =>
                handleQuestionChange(index, "question", e.target.value)
              }
            />

            <div style={S.optionsGrid}>
              {["A", "B", "C", "D"].map((opt) => (
                <div key={opt}>
                  <label style={S.label}>Option {opt}</label>
                  <input
                    style={S.input}
                    placeholder={`Option ${opt}`}
                    value={q[`option${opt}`]}
                    onChange={(e) =>
                      handleQuestionChange(index, `option${opt}`, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>

            <div style={S.row}>
              <div style={{ flex: 1 }}>
                <label style={S.label}>Correct Answer</label>
                <select
                  style={S.input}
                  value={q.correct}
                  onChange={(e) =>
                    handleQuestionChange(index, "correct", e.target.value)
                  }
                >
                  <option value="A">✅ Option A</option>
                  <option value="B">✅ Option B</option>
                  <option value="C">✅ Option C</option>
                  <option value="D">✅ Option D</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={S.label}>Marks</label>
                <select
                  style={S.input}
                  value={q.marks}
                  onChange={(e) =>
                    handleQuestionChange(index, "marks", parseInt(e.target.value))
                  }
                >
                  <option value="1">1 mark</option>
                  <option value="2">2 marks</option>
                  <option value="3">3 marks</option>
                  <option value="4">4 marks</option>
                  <option value="5">5 marks</option>
                </select>
              </div>
            </div>

            <label style={S.label}>Explanation (optional)</label>
            <input
              style={S.input}
              placeholder="Why is this the correct answer?"
              value={q.explanation}
              onChange={(e) =>
                handleQuestionChange(index, "explanation", e.target.value)
              }
            />
          </div>
        ))}

        <button style={S.addBtn} onClick={addQuestion}>
          + Add Question
        </button>
      </div>

      {/* ── QUIZ SUMMARY ── */}
      {questions.length > 0 && (
        <div style={S.summaryBox}>
          <span>📊 <strong>{questions.length}</strong> questions</span>
          <span>⏱ <strong>{quizData.time_limit} min</strong></span>
          <span>🎯 <strong>{quizData.difficulty}</strong></span>
          <span>
            💯 Total:{" "}
            <strong>
              {questions.reduce((sum, q) => sum + (q.marks || 1), 0)} marks
            </strong>
          </span>
        </div>
      )}

      {/* ── SUBMIT ── */}
      <button
        style={{ ...S.submitBtn, opacity: loading ? 0.7 : 1 }}
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "⏳ Creating Quiz..." : "🚀 Create Quiz"}
      </button>
    </div>
  );
}

const S = {
  page: {
    maxWidth: "820px",
    margin: "0 auto",
    padding: "10px 0 40px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  header: { marginBottom: "24px" },
  heading: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e1b4b",
    margin: "0 0 4px",
  },
  sub: { fontSize: "14px", color: "#6b7280", margin: 0 },
  card: {
    background: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
    border: "1px solid #f1f5f9",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "18px",
    paddingBottom: "12px",
    borderBottom: "1px solid #f1f5f9",
  },
  cardIcon: { fontSize: "20px" },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e1b4b",
    margin: 0,
  },
  label: {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    color: "#374151",
    marginBottom: "6px",
    marginTop: "4px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    marginBottom: "14px",
    borderRadius: "10px",
    border: "1.5px solid #e2e8f0",
    fontSize: "14px",
    color: "#1f2937",
    background: "#fafafa",
    boxSizing: "border-box",
    outline: "none",
  },
  row: { display: "flex", gap: "14px", alignItems: "flex-start" },
  timerBadge: {
    background: "#eff6ff",
    color: "#1d4ed8",
    padding: "8px 12px",
    borderRadius: "8px",
    fontSize: "12px",
    marginTop: "-8px",
    marginBottom: "8px",
  },
  materialPreview: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#f0fdf4",
    border: "1.5px solid #bbf7d0",
    borderRadius: "10px",
    padding: "12px",
    marginTop: "-6px",
  },
  previewIcon: { fontSize: "24px" },
  previewTitle: {
    fontWeight: "700",
    fontSize: "14px",
    color: "#14532d",
  },
  previewSub: {
    fontSize: "12px",
    color: "#16a34a",
    marginTop: "2px",
  },
  qBox: {
    background: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    borderRadius: "14px",
    padding: "18px",
    marginBottom: "16px",
  },
  qHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },
  qNum: {
    fontWeight: "700",
    fontSize: "15px",
    color: "#4f46e5",
    background: "#ede9fe",
    padding: "4px 12px",
    borderRadius: "20px",
  },
  optionsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0 14px",
  },
  emptyBox: {
    textAlign: "center",
    color: "#9ca3af",
    padding: "24px",
    background: "#f9fafb",
    borderRadius: "10px",
    marginBottom: "14px",
    fontSize: "14px",
  },
  addBtn: {
    padding: "10px 20px",
    background: "#fff",
    color: "#4f46e5",
    border: "2px solid #4f46e5",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "14px",
  },
  removeBtn: {
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    borderRadius: "8px",
    padding: "5px 12px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
  },
  summaryBox: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    background: "#f5f3ff",
    border: "1.5px solid #ddd6fe",
    borderRadius: "12px",
    padding: "14px 20px",
    marginBottom: "16px",
    fontSize: "14px",
    color: "#4c1d95",
  },
  submitBtn: {
    width: "100%",
    padding: "15px",
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "700",
    letterSpacing: "0.3px",
    boxShadow: "0 4px 15px rgba(79,70,229,0.4)",
  },
  success: {
    background: "#dcfce7",
    color: "#166534",
    padding: "12px 16px",
    borderRadius: "10px",
    marginBottom: "16px",
    fontWeight: "600",
    fontSize: "14px",
  },
  error: {
    background: "#fee2e2",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: "10px",
    marginBottom: "16px",
    fontWeight: "600",
    fontSize: "14px",
  },
};