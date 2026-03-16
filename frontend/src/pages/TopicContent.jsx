import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import "./TopicContent.css";

function TopicContent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);
  const [activeModule, setActiveModule] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [subjectTitle, setSubjectTitle] = useState("");

  const user = localStorage.getItem("user");

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/subjects/${id}/modules/`)
      .then((res) => res.json())
      .then((data) => {
        setModules(data);

        if (data.length > 0) {
          setActiveModule(data[0]);
          setSubjectTitle(data[0].subject_title || "Study Topic");
        }
      })
      .catch((err) => console.error(err));
  }, [id]);

  useEffect(() => {
    if (activeModule) {
      fetch(`http://127.0.0.1:8000/api/modules/${activeModule.id}/quizzes/`)
        .then((res) => res.json())
        .then((data) => setQuizzes(data))
        .catch((err) => console.error(err));
    }
  }, [activeModule]);

  // SAVE VIEW HISTORY
  useEffect(() => {

    if (user) {

      fetch("http://127.0.0.1:8000/api/save-viewed-topic/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: user,
          subject_id: id
        })
      });

    }

  }, [id, user]);

  return (
    <>
      <Navbar />

      <div className="topic-container">

        <div className="topic-header">
          <h1>{subjectTitle}</h1>
        </div>

        <div className="topic-body">

          <div className="module-sidebar">
            {modules.map((module) => (
              <button
                key={module.id}
                className={activeModule?.id === module.id ? "active-module" : ""}
                onClick={() => setActiveModule(module)}
              >
                {module.title}
              </button>
            ))}
          </div>

          <div className="module-content">
            {activeModule ? (
              <p>{activeModule.content}</p>
            ) : (
              <p>Loading content...</p>
            )}
          </div>

        </div>

        <div className="quiz-section">
          <h2>Related Quizzes</h2>

          <div className="quiz-grid">
            {quizzes.map((quiz) => (
              <button
                key={quiz.id}
                className="quiz-btn"
                onClick={() => navigate(`/quiz/${quiz.id}`)}
              >
                {quiz.title}
              </button>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}

export default TopicContent;