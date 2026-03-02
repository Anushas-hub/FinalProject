import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Footer from "../components/Footer";

export default function Home() {
  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = "scale(1.05)";
    e.currentTarget.style.boxShadow =
      "0 12px 30px rgba(0,0,0,0.12)";
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow =
      "0 8px 20px rgba(0,0,0,0.05)";
  };

  return (
    <div style={styles.page}>
      <Navbar />
      <Hero />

      {/* 🔍 Search Section */}
      <section style={styles.searchSection}>
        <h2 style={styles.searchTitle}>Let's Start Learning</h2>

        <div style={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search study materials, PYQs, subjects..."
            style={styles.searchInput}
          />
          <button style={styles.searchButton}>Search</button>
        </div>
      </section>

      {/* 📘 About SmartStudy Section */}
      <section style={styles.aboutSection}>
        <div style={styles.cardsContainer}>

          <div
            style={styles.card}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <h3 style={styles.cardTitle}>Purpose</h3>
            <p style={styles.cardText}>
              SmartStudy is built to simplify learning by providing
              structured resources, past papers, and collaborative tools
              for students.
            </p>
          </div>

          <div
            style={styles.card}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <h3 style={styles.cardTitle}>
              Syllabus Aligned Notes (Mumbai University)
            </h3>
            <p style={styles.cardText}>
              Bachelor of Science in Information Technology and
              Bachelor of Science in Computer Science courses with
              syllabus-focused notes.
            </p>
          </div>

          <div
            style={styles.card}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <h3 style={styles.cardTitle}>Subject Based Quizzes</h3>
            <p style={styles.cardText}>
              Practice with topic-wise quizzes to strengthen concepts
              and prepare effectively for exams.
            </p>
          </div>

          <div
            style={styles.card}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <h3 style={styles.cardTitle}>
              Student–Author Collaboration
            </h3>
            <p style={styles.cardText}>
              Authors can upload notes and Q&A while students can ask
              doubts, creating an interactive academic ecosystem.
            </p>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "Arial, sans-serif",
    background: "#d9deeb",
    minHeight: "100vh",
  },

  /* SEARCH SECTION */
  searchSection: {
    padding: "80px 20px",
    textAlign: "center",
    background: "#f4f6fb",
  },

  searchTitle: {
    fontSize: "32px",
    fontWeight: "700",
    marginBottom: "30px",
    color: "#1f2937",
  },

  searchWrapper: {
    maxWidth: "900px",
    margin: "0 auto",
    display: "flex",
    borderRadius: "50px",
    overflow: "hidden",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    background: "#ffffff",
  },

  searchInput: {
    flex: 1,
    padding: "18px 25px",
    border: "none",
    outline: "none",
    fontSize: "16px",
  },

  searchButton: {
    padding: "0 35px",
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
  },

  /* ABOUT SECTION */
  aboutSection: {
    padding: "80px 20px",
    background: "#ffffff",
  },

  cardsContainer: {
    maxWidth: "1000px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)", // fixed 2 per row
    gap: "40px",
  },

  card: {
    background: "#f4f6fb",
    padding: "25px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    cursor: "pointer",
  },

  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "12px",
    color: "#2563eb",
  },

  cardText: {
    fontSize: "14px",
    color: "#374151",
    lineHeight: "1.6",
  },
};