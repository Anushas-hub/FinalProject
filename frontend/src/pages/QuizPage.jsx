import { useParams, useNavigate } from "react-router-dom";

export default function QuizPage() {
  const { id, quizId } = useParams();
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h2>Quiz {quizId}</h2>
      <p>5 Questions will load here.</p>

      <button
        style={styles.btn}
        onClick={()=>navigate(`/certification/${id}`)}
      >
        Submit Quiz
      </button>
    </div>
  );
}

const styles = {
  container: { padding: "40px" },
  btn: {
    marginTop: "20px",
    padding: "12px 25px",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};