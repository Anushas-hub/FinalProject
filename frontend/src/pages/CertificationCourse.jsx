import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function CertificationCourse() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);

  const [completedQuizzes, setCompletedQuizzes] = useState([]);

  useEffect(() => {

    fetch(`http://127.0.0.1:8000/api/courses/${id}/`)
      .then(res => res.json())
      .then(data => {

        setCourse(data)
        setModules(data.modules || [])

      })
      .catch(err => console.log(err))

  }, [id])


  const totalQuizzes = modules.reduce(
    (total, m) => total + (m.quizzes?.length || 0),
    0
  )

  const progress =
    totalQuizzes === 0
      ? 0
      : (completedQuizzes.length / totalQuizzes) * 100

  const certificateUnlocked = progress >= 70


  return (

    <div style={styles.page}>

      <div style={styles.header}>

        <h1>{course?.title || "Certification Course"}</h1>

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


      <div style={styles.courseLayout}>

        {/* SIDEBAR */}

        <div style={styles.sidebar}>

          <h3>Course Navigation</h3>

          {modules.map((module, index) => (

            <div key={module.id}>

              <div style={styles.moduleTitle}>
                {module.title}
              </div>

              <div style={styles.assessment}>
                Assessment {index + 1}
              </div>

            </div>

          ))}

          <div style={{ marginTop: "40px" }}>

            {certificateUnlocked ? (

              <button
                style={styles.certBtn}
                onClick={() =>
                  navigate(`/certification/${id}/success`)
                }
              >
                Get Certificate
              </button>

            ) : (

              <p style={{ fontSize: "14px" }}>
                Complete 70% quizzes to unlock certificate
              </p>

            )}

          </div>

        </div>


        {/* MAIN PAGE */}

        <div style={styles.content}>

          {modules.map((module, moduleIndex) => (

            <div key={module.id} style={styles.moduleSection}>

              <h2>{module.title}</h2>

              <p>{module.content}</p>

              <h3 style={{ marginTop: "25px" }}>
                Assessment {moduleIndex + 1}
              </h3>

              {module.quizzes?.map((quiz) => (

                <div key={quiz.id} style={styles.quizCard}>

                  <h4>{quiz.title}</h4>

                  <button
                    style={styles.quizBtn}
                    onClick={() =>
                      navigate(`/certification-quiz/${quiz.id}`)
                    }
                  >
                    Attempt Quiz
                  </button>

                </div>

              ))}

            </div>

          ))}

        </div>

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
    padding: "30px",
    background: "#4f46e5",
    color: "#fff",
  },

  progressWrapper: {
    marginTop: "10px",
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

  courseLayout: {
    display: "flex",
  },

  sidebar: {
    width: "260px",
    background: "#fff",
    padding: "25px",
    borderRight: "1px solid #eee",
    minHeight: "80vh",
  },

  moduleTitle: {
    fontWeight: "600",
    marginTop: "15px",
  },

  assessment: {
    marginLeft: "10px",
    fontSize: "14px",
    color: "#6b7280",
  },

  content: {
    flex: 1,
    padding: "40px",
  },

  moduleSection: {
    background: "#fff",
    padding: "25px",
    borderRadius: "12px",
    marginBottom: "30px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
  },

  quizCard: {
    background: "#f9fafb",
    padding: "15px",
    borderRadius: "10px",
    marginTop: "15px",
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
    padding: "15px",
    background: "green",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    width: "100%",
    cursor: "pointer",
  },

}