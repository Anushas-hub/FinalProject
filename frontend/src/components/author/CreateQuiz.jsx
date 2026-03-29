import { useState } from "react";
import axios from "axios";

export default function CreateQuiz() {
  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    difficulty: "easy",
    time_limit: 10,
    material_id: "",
  });

  const [questions, setQuestions] = useState([]);

  const username = localStorage.getItem("username"); // assume login se store hai

  // -------- ADD QUESTION --------
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
      },
    ]);
  };

  // -------- HANDLE QUESTION CHANGE --------
  const handleQuestionChange = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  // -------- CREATE QUIZ --------
  const handleSubmit = async () => {
    try {
      // STEP 1: Create Quiz
      const res = await axios.post("http://127.0.0.1:8000/api/author/create-quiz/", {
        username,
        ...quizData,
      });

      const quizId = res.data.quiz_id;

      // STEP 2: Add Questions
      for (let q of questions) {
        await axios.post("http://127.0.0.1:8000/api/author/add-question/", {
          quiz_id: quizId,
          question: q.question,
          option_a: q.optionA,
          option_b: q.optionB,
          option_c: q.optionC,
          option_d: q.optionD,
          correct_answer: q.correct,
          marks: q.marks,
        });
      }

      alert("Quiz Created Successfully 🚀");

      // reset
      setQuizData({
        title: "",
        description: "",
        difficulty: "easy",
        time_limit: 10,
        material_id: "",
      });
      setQuestions([]);

    } catch (err) {
      console.error(err);
      alert("Error creating quiz");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Create Quiz</h2>

      <div style={styles.card}>

        {/* QUIZ INFO */}
        <input
          style={styles.input}
          placeholder="Quiz Title"
          value={quizData.title}
          onChange={(e) => setQuizData({ ...quizData, title: e.target.value })}
        />

        <textarea
          style={styles.input}
          placeholder="Description"
          value={quizData.description}
          onChange={(e) => setQuizData({ ...quizData, description: e.target.value })}
        />

        <select
          style={styles.input}
          value={quizData.difficulty}
          onChange={(e) => setQuizData({ ...quizData, difficulty: e.target.value })}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <input
          style={styles.input}
          type="number"
          placeholder="Time Limit (minutes)"
          value={quizData.time_limit}
          onChange={(e) => setQuizData({ ...quizData, time_limit: e.target.value })}
        />

        <input
          style={styles.input}
          placeholder="Material ID (optional)"
          value={quizData.material_id}
          onChange={(e) => setQuizData({ ...quizData, material_id: e.target.value })}
        />

        {/* QUESTIONS */}
        {questions.map((q, index) => (
          <div key={index} style={styles.questionBox}>
            <input
              style={styles.input}
              placeholder="Question"
              value={q.question}
              onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Option A"
              value={q.optionA}
              onChange={(e) => handleQuestionChange(index, "optionA", e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Option B"
              value={q.optionB}
              onChange={(e) => handleQuestionChange(index, "optionB", e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Option C"
              value={q.optionC}
              onChange={(e) => handleQuestionChange(index, "optionC", e.target.value)}
            />

            <input
              style={styles.input}
              placeholder="Option D"
              value={q.optionD}
              onChange={(e) => handleQuestionChange(index, "optionD", e.target.value)}
            />

            <select
              style={styles.input}
              value={q.correct}
              onChange={(e) => handleQuestionChange(index, "correct", e.target.value)}
            >
              <option value="A">Correct: A</option>
              <option value="B">Correct: B</option>
              <option value="C">Correct: C</option>
              <option value="D">Correct: D</option>
            </select>
          </div>
        ))}

        <button style={styles.secondaryBtn} onClick={addQuestion}>
          + Add Question
        </button>

        <button style={styles.primaryBtn} onClick={handleSubmit}>
          Create Quiz
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "900px", margin: "0 auto" },
  heading: { marginBottom: "25px", color: "#1e293b" },

  card: {
    background: "#ffffff",
    padding: "30px",
    borderRadius: "18px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
  },

  questionBox: {
    marginBottom: "20px",
    padding: "20px",
    borderRadius: "14px",
    background: "#f8fafc",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
  },

  primaryBtn: {
    marginTop: "15px",
    padding: "14px",
    borderRadius: "14px",
    border: "none",
    background: "#4f46e5",
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
  },

  secondaryBtn: {
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #4f46e5",
    background: "#ffffff",
    color: "#4f46e5",
    cursor: "pointer",
    marginBottom: "20px",
  },
};