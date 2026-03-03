import { useState } from "react";
import Navbar from "../components/Navbar";

export default function HomeStudyMaterial() {
  const [search, setSearch] = useState("");

  const topics = [
    { id: 1, title: "Study Topic 1" },
    { id: 2, title: "Study Topic 2" },
    { id: 3, title: "Study Topic 3" },
    { id: 4, title: "Study Topic 4" },
  ];

  const filteredTopics = topics.filter((topic) =>
    topic.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={styles.wrapper}>
      <Navbar />

      {/* SEARCH */}
      <div style={styles.searchSection}>
        <input
          type="text"
          placeholder="Search study materials, subjects, courses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
        <button style={styles.searchBtn}>Search</button>
      </div>

      {/* HEADING */}
      <div style={styles.hero}>
        <h1 style={styles.title}>StudyMaterial</h1>
        <p style={styles.subtitle}>
          SmartStudy lets learn and collaborate
        </p>
      </div>

      {/* MAIN BODY */}
      <div style={styles.container}>
        {/* SIDE PANEL */}
        <div style={styles.sidebar}>
          <button style={styles.sideBtn}>Latest</button>
          <button style={styles.sideBtn}>By Top Authors</button>
          <button style={styles.sideBtn}>By SmartStudy</button>
          <button style={styles.sideBtn}>Top Viewed Study Courses</button>
        </div>

        {/* CONTENT */}
        <div style={styles.content}>
          <div style={styles.grid}>
            {filteredTopics.map((topic) => (
              <div key={topic.id} style={styles.card}>
                <h3 style={styles.cardTitle}>{topic.title}</h3>
                <p>Structured notes, quizzes and PYQs available.</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f0f9ff 0%, #f5f3ff 50%, #ecfdf5 100%)",
  },

  /* 🔥 GAP REDUCED */
  searchSection: {
    maxWidth: "900px",
    margin: "25px auto 10px auto", // reduced top & bottom gap
    display: "flex",
    borderRadius: "50px",
    overflow: "hidden",
    background: "#ffffff",
    boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
  },

  searchInput: {
    flex: 1,
    padding: "14px 22px",
    border: "none",
    outline: "none",
    fontSize: "15px",
  },

  searchBtn: {
    padding: "0 30px",
    border: "none",
    background: "#4f46e5",
    color: "#ffffff",
    fontSize: "14px",
    cursor: "pointer",
  },

  hero: {
    padding: "5px 80px 15px 80px", // reduced bottom gap
  },

  title: {
    fontSize: "36px",
    marginBottom: "3px",
    color: "#1e293b",
  },

  subtitle: {
    fontSize: "14px",
    color: "#64748b",
  },

  container: {
    display: "flex",
    gap: "30px",
    padding: "0 80px 40px 80px", // reduced bottom spacing
  },

  sidebar: {
    width: "240px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  sideBtn: {
    padding: "14px",
    borderRadius: "18px",
    border: "none",
    background: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },

  content: {
    flex: 1,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "20px", // reduced gap between cards
  },

  card: {
    background: "#ffffff",
    padding: "22px",
    borderRadius: "18px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
  },

  cardTitle: {
    color: "#4f46e5",
    marginBottom: "8px",
  },
};