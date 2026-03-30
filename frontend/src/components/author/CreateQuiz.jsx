import { useState, useEffect } from "react";
import axios from "axios";

export default function CreateQuiz() {
  const username = localStorage.getItem("username");

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
    link_type: "material",
    material_id: "",
    linked_id: "",
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

  // ─── AUTO TITLE ───
  useEffect(() => {
    if (quizData.link_type === "material" && quizData.material_id) {
      const selected = materials.find((m) => m.id == quizData.material_id);
      if (selected) {
        setQuizData((prev) => ({ ...prev, title: `${selected.title} Quiz` }));
      }
    } else if (quizData.link_type === "course" && quizData.linked_id) {
      setQuizData((prev) => ({ ...prev, title: `Course ${quizData.linked_id} Quiz` }));
    } else if (quizData.link_type === "pyq" && quizData.linked_id) {
      setQuizData((prev) => ({ ...prev, title: `PYQ ${quizData.linked_id} Quiz` }));
    }
  }, [quizData.material_id, quizData.linked_id, quizData.link_type]);

  const filteredMaterials = materials.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  // ─── QUESTION HANDLERS ───
  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", optionA: "", optionB: "", optionC: "", optionD: "", correct: "A", marks: 1, explanation: "" },
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

    // Frontend validation
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) { setErrorMsg(`Q${i + 1}: Question text is empty.`); return; }
      if (!q.optionA.trim() || !q.optionB.trim()) { setErrorMsg(`Q${i + 1}: Option A & B are required.`); return; }
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
        { username, ...quizData, questions: formattedQuestions }
      );

      setSuccessMsg("✅ Quiz Created Successfully!");
      setQuizData({
        title: "", description: "", difficulty: "easy",
        time_limit: 10, link_type: "material", material_id: "", linked_id: "",
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
        <h2 style={S.heading}>🧠 Create Quiz</h2>
        <p style={S.sub}>Build a quiz and link it to your study material, course, or PYQ</p>
      </div>

      {/* ── SUCCESS / ERROR ── */}
      {successMsg && <div style={S.success}>{successMsg}</div>}
      {errorMsg && <div style={S.error}>{errorMsg}</div>}

      {/* ── SECTION 1: BASIC INFO ── */}
      <div style={S.card}>
        <div style={S.cardHeader}>
          <span style={S.cardIcon}>📋</span>
          <h3 style={S.cardTitle}>Basic Info</h3>
        </div>

        <label style={S.label}>Quiz Title</label>
        <input
          style={S.input}
          placeholder="Quiz title (auto-fills or type manually)"
          value={quizData.title}
          onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
        />

        <label style={S.label}>Description (optional)</label>
        <textarea
          style={{ ...S.input, height: "80px", resize: "vertical" }}
          placeholder="Briefly describe this quiz..."
          value={quizData.description}
          onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
        />

        <div style={S.row}>
          <div style={{ flex: 1 }}>
            <label style={S.label}>Difficulty</label>
            <select
              style={S.input}
              value={quizData.difficulty}
              onChange={(e) => setQuizData({ ...quizData, difficulty: e.target.value })}
            >
              <option value="easy">🟢 Easy</option>
              <option value="medium">🟡 Medium</option>
              <option value="hard">🔴 Hard</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={S.label}>Time Limit (minutes)</label>
            <input
              style={S.input}
              type="number"
              min="1"
              max="180"
              value={quizData.time_limit}
              onChange={(e) => setQuizData({ ...quizData, time_limit: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* ── SECTION 2: LINK CONTENT ── */}
      <div style={S.card}>
        <div style={S.cardHeader}>
          <span style={S.cardIcon}>🔗</span>
          <h3 style={S.cardTitle}>Link Content</h3>
        </div>

        <label style={S.label}>Link Type</label>
        <select
          style={S.input}
          value={quizData.link_type}
          onChange={(e) =>
            setQuizData({ ...quizData, link_type: e.target.value, material_id: "", linked_id: "" })
          }
        >
          <option value="material">📚 Study Material</option>
          <option value="course">🎓 Course</option>
          <option value="pyq">📝 PYQ</option>
        </select>

        {quizData.link_type === "material" && (
          <>
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
              onChange={(e) => setQuizData({ ...quizData, material_id: e.target.value })}
            >
              <option value="">— Select a material —</option>
              {filteredMaterials.length === 0 && (
                <option disabled>No materials found</option>
              )}
              {filteredMaterials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.subject})
                </option>
              ))}
            </select>
          </>
        )}

        {quizData.link_type === "course" && (
          <>
            <label style={S.label}>Course ID</label>
            <input
              style={S.input}
              placeholder="Enter Course ID (e.g. 3)"
              type="number"
              value={quizData.linked_id}
              onChange={(e) => setQuizData({ ...quizData, linked_id: e.target.value })}
            />
          </>
        )}

        {quizData.link_type === "pyq" && (
          <>
            <label style={S.label}>PYQ ID</label>
            <input
              style={S.input}
              placeholder="Enter PYQ ID (e.g. 5)"
              type="number"
              value={quizData.linked_id}
              onChange={(e) => setQuizData({ ...quizData, linked_id: e.target.value })}
            />
          </>
        )}
      </div>

      {/* ── SECTION 3: QUESTIONS ── */}
      <div style={S.card}>
        <div style={S.cardHeader}>
          <span style={S.cardIcon}>❓</span>
          <h3 style={S.cardTitle}>Questions ({questions.length})</h3>
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
              onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
            />

            <div style={S.optionsGrid}>
              {["A", "B", "C", "D"].map((opt) => (
                <div key={opt}>
                  <label style={S.label}>Option {opt}</label>
                  <input
                    style={S.input}
                    placeholder={`Option ${opt}`}
                    value={q[`option${opt}`]}
                    onChange={(e) => handleQuestionChange(index, `option${opt}`, e.target.value)}
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
                  onChange={(e) => handleQuestionChange(index, "correct", e.target.value)}
                >
                  <option value="A">✅ Option A</option>
                  <option value="B">✅ Option B</option>
                  <option value="C">✅ Option C</option>
                  <option value="D">✅ Option D</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={S.label}>Marks</label>
                <input
                  style={S.input}
                  type="number"
                  min="1"
                  value={q.marks}
                  onChange={(e) => handleQuestionChange(index, "marks", parseInt(e.target.value))}
                />
              </div>
            </div>

            <label style={S.label}>Explanation (optional)</label>
            <input
              style={S.input}
              placeholder="Why is this the correct answer?"
              value={q.explanation}
              onChange={(e) => handleQuestionChange(index, "explanation", e.target.value)}
            />
          </div>
        ))}

        <button style={S.addBtn} onClick={addQuestion}>
          + Add Question
        </button>
      </div>

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

// ─────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────
const S = {
  page: {
    maxWidth: "820px",
    margin: "0 auto",
    padding: "10px 0 40px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  header: {
    marginBottom: "24px",
  },
  heading: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e1b4b",
    margin: "0 0 4px",
  },
  sub: {
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
  },
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
    transition: "border-color 0.2s",
  },
  row: {
    display: "flex",
    gap: "14px",
    alignItems: "flex-start",
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