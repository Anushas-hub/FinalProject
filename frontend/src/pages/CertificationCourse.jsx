import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function CertificationCourse() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [quizzes, setQuizzes] = useState([]);

  const [completedQuizzes, setCompletedQuizzes] = useState(0);

  useEffect(() => {

    fetch(`http://127.0.0.1:8000/api/courses/${id}/`)
      .then(res => res.json())
      .then(data => {

        setCourse(data)
        setModules(data.modules || [])
        setQuizzes(data.quizzes || [])

      })
      .catch(err => console.log(err))

  }, [id])


  const totalQuizzes = quizzes.length || 1
  const progress = (completedQuizzes / totalQuizzes) * 100
  const isEligible = progress >= 70

  return (

    <div style={styles.page}>

      {/* HEADER */}

      <div style={styles.header}>

        <h1>{course ? course.title : `Certification Course #${id}`}</h1>

        <div style={styles.progressWrapper}>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${progress}%`
              }}
            />
          </div>

          <span>{Math.round(progress)}% Completed</span>

        </div>

      </div>


      {/* TABS */}

      <div style={styles.tabs}>

        <button
          style={activeTab === "overview" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </button>

        <button
          style={activeTab === "modules" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("modules")}
        >
          Modules
        </button>

        <button
          style={activeTab === "quizzes" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("quizzes")}
        >
          Quizzes
        </button>

        <button
          style={activeTab === "certification" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("certification")}
        >
          Certification
        </button>

      </div>


      {/* TAB CONTENT */}

      <div style={styles.content}>


        {/* OVERVIEW */}

        {activeTab === "overview" && course && (

          <div>

            <h2>Course Overview</h2>

            <p>{course.description}</p>

          </div>

        )}



        {/* MODULES */}

        {activeTab === "modules" && (

          <div>

            <h2>Modules</h2>

            <div style={styles.grid}>

              {modules.length === 0 ? (

                <p>No modules available.</p>

              ) : (

                modules.map((m) => (

                  <div key={m.id} style={styles.card}>

                    <h3>{m.title}</h3>

                    <p>{m.content}</p>

                  </div>

                ))

              )}

            </div>

          </div>

        )}



        {/* QUIZZES */}

        {activeTab === "quizzes" && (

          <div>

            <h2>Quizzes</h2>

            <div style={styles.grid}>

              {quizzes.length === 0 ? (

                <p>No quizzes available.</p>

              ) : (

                quizzes.map((q) => (

                  <div key={q.id} style={styles.card}>

                    <h3>{q.title}</h3>

                    <button
                      style={styles.quizBtn}
                      onClick={() =>
                        navigate(`/quiz/${q.id}`)
                      }
                    >
                      Attempt Quiz
                    </button>

                  </div>

                ))

              )}

            </div>

          </div>

        )}



        {/* CERTIFICATION */}

        {activeTab === "certification" && (

          <div style={{ textAlign: "center" }}>

            <h2>Certification</h2>

            {isEligible ? (

              <button
                style={styles.certBtn}
                onClick={() =>
                  navigate(`/certification/${id}/success`)
                }
              >
                🎉 Get Certified
              </button>

            ) : (

              <p>Complete at least 70% quizzes to unlock certificate.</p>

            )}

          </div>

        )}

      </div>

    </div>

  )

}



const styles = {

  page: {
    minHeight: "100vh",
    background: "#f8fafc",
  },

  header: {
    padding: "40px",
    background: "#4f46e5",
    color: "#fff",
  },

  progressWrapper: {
    marginTop: "15px",
  },

  progressBar: {
    height: "8px",
    background: "#ddd",
    borderRadius: "10px",
    marginBottom: "5px",
  },

  progressFill: {
    height: "8px",
    background: "#22c55e",
    borderRadius: "10px",
  },

  tabs: {
    display: "flex",
    gap: "20px",
    padding: "20px 40px",
    background: "#fff",
    borderBottom: "1px solid #eee",
  },

  tab: {
    padding: "10px 20px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontWeight: "500",
  },

  activeTab: {
    padding: "10px 20px",
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
  },

  content: {
    padding: "40px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
    gap: "20px",
    marginTop: "20px",
  },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
  },

  quizBtn: {
    marginTop: "10px",
    padding: "8px 15px",
    background: "#06b6d4",
    border: "none",
    color: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
  },

  certBtn: {
    marginTop: "20px",
    padding: "15px 30px",
    background: "green",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    cursor: "pointer",
  },

}
