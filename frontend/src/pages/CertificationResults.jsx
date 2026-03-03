import { useLocation, useNavigate } from "react-router-dom";

export default function CertificationResults() {
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const search = query.get("search") || "";

  const courses = [
    {
      id: 1,
      title: "Data Structures Certification",
      modules: 6,
      quizzes: 4,
      description: "Master core data structures with real quizzes."
    },
    {
      id: 2,
      title: "Web Development Certification",
      modules: 6,
      quizzes: 4,
      description: "Frontend + Backend + Deployment complete roadmap."
    },
  ];

  const filtered = courses.filter((course) =>
    course.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.page}>
      <div style={styles.hero}>
        <h1>Certification Courses</h1>
        <p>Search Results for "{search}"</p>
      </div>

      <div style={styles.container}>
        {filtered.length === 0 ? (
          <p style={{ textAlign: "center" }}>
            No certification course available.
          </p>
        ) : (
          <div style={styles.grid}>
            {filtered.map((course) => (
              <div key={course.id} style={styles.card}>
                <h2>{course.title}</h2>
                <p style={styles.desc}>{course.description}</p>

                <div style={styles.meta}>
                  <span>📘 {course.modules} Modules</span>
                  <span>🧠 {course.quizzes} Quizzes</span>
                </div>

                <button
                  style={styles.btn}
                  onClick={() =>
                    navigate(`/certification/${course.id}`)
                  }
                >
                  Start Certification →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#eef2ff,#f0f9ff,#ecfdf5)"
  },

  hero: {
    background: "#4f46e5",
    color: "#fff",
    padding: "50px 20px",
    textAlign: "center",
  },

  container: {
    padding: "50px 40px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
    gap: "30px",
  },

  card: {
    background: "#ffffff",
    padding: "30px",
    borderRadius: "18px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
    transition: "0.3s ease",
  },

  desc: {
    marginTop: "10px",
    color: "#475569"
  },

  meta: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
    fontSize: "14px",
    color: "#64748b"
  },

  btn: {
    marginTop: "25px",
    padding: "12px 20px",
    borderRadius: "10px",
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%"
  },
};