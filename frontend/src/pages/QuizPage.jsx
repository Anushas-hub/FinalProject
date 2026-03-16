import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

function QuizPage() {

  const { id } = useParams();

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/quizzes/${id}/`)
      .then(res => res.json())
      .then(data => setQuiz(data));
  }, [id]);

  const handleSelect = (qIndex, option) => {
    setAnswers({
      ...answers,
      [qIndex]: option
    });
  };

  const submitQuiz = () => {

    let correct = 0;

    quiz.questions.forEach((q, index) => {
      if (answers[index] === q.answer) {
        correct++;
      }
    });

    setScore(correct);

    const user = localStorage.getItem("user");

    fetch("http://127.0.0.1:8000/api/save-quiz-attempt/", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        username: user,
        quiz_id: quiz.id,
        score: correct,
        total: quiz.questions.length
      })

    });

  };

  if (!quiz) {
    return (
      <>
        <Navbar />
        <p style={{ padding: "40px" }}>Loading Quiz...</p>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div style={{ padding: "40px" }}>

        <h1>{quiz.title}</h1>

        {quiz.questions.map((q, index) => (

          <div key={index} style={{ marginBottom: "30px" }}>

            <h3>{q.question}</h3>

            {q.options.map((opt, i) => (

              <div key={i}>

                <input
                  type="radio"
                  name={`q${index}`}
                  value={opt}
                  onChange={() => handleSelect(index, opt)}
                />

                {opt}

              </div>

            ))}

          </div>

        ))}

        <button
          onClick={submitQuiz}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          Submit Quiz
        </button>

        {score !== null && (

          <h2 style={{ marginTop: "30px" }}>
            Score: {score} / {quiz.questions.length}
          </h2>

        )}

      </div>
    </>
  );
}

export default QuizPage;