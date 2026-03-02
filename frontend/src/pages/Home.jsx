import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Footer from "../components/Footer";

export default function Home() {
  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = "scale(1.04)";
    e.currentTarget.style.boxShadow =
      "0 15px 35px rgba(0,0,0,0.08)";
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

      {/* Search Section */}
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

      {/* About Section */}
      <section style={styles.aboutSection}>
        <div style={styles.cardsContainer}>

          <div
            style={styles.card}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <h3 style={styles.cardTitle}>Purpose</h3>
            <p style={styles.cardText}>
              SmartStudy simplifies learning through structured notes,
              PYQs, and collaboration tools for students.
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
              B.Sc IT & B.Sc CS courses with syllabus-focused notes.
            </p>
          </div>

          <div
            style={styles.card}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <h3 style={styles.cardTitle}>Subject Based Quizzes</h3>
            <p style={styles.cardText}>
              Topic-wise quizzes to improve understanding and exam preparation.
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
              Authors upload notes & Q&A, students ask doubts —
              interactive academic ecosystem.
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
    minHeight: "100vh",
    background: "linear-gradient(135deg, #eef2ff, #ecfdf5)", // single calm bg
  },

  /* SEARCH */
  searchSection: {
    padding: "50px 20px 30px 20px", // reduced bottom gap
    textAlign: "center",
  },

  searchTitle: {
    fontSize: "30px",
    fontWeight: "700",
    marginBottom: "25px",
    color: "#1e293b",
  },

  searchWrapper: {
    maxWidth: "850px",
    margin: "0 auto",
    display: "flex",
    borderRadius: "50px",
    overflow: "hidden",
    background: "#ffffff",
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
  },

  searchInput: {
    flex: 1,
    padding: "16px 25px",
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

  /* ABOUT */
  aboutSection: {
    padding: "30px 20px 60px 20px", // reduced top gap
  },

  cardsContainer: {
    maxWidth: "1000px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "35px",
  },

  card: {
    background: "rgba(255,255,255,0.75)",
    backdropFilter: "blur(8px)",
    padding: "30px",
    borderRadius: "14px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },

  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "12px",
    color: "#1e3a8a",
  },

  cardText: {
    fontSize: "14px",
    color: "#475569",
    lineHeight: "1.6",
  },
};