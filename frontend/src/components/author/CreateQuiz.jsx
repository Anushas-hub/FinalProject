import { useState } from "react";

export default function CreateQuiz() {
  const [questions, setQuestions] = useState([]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { question: "", optionA: "", optionB: "", optionC: "", optionD: "" },
    ]);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Create Quiz</h2>

      <div style={styles.card}>
        {questions.map((q, index) => (
          <div key={index} style={styles.questionBox}>
            <input style={styles.input} placeholder="Question" />
            <input style={styles.input} placeholder="Option A" />
            <input style={styles.input} placeholder="Option B" />
            <input style={styles.input} placeholder="Option C" />
            <input style={styles.input} placeholder="Option D" />
          </div>
        ))}

        <button style={styles.secondaryBtn} onClick={addQuestion}>
          Add Question
        </button>

        <button style={styles.primaryBtn}>
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