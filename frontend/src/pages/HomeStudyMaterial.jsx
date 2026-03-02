import React from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

const StudyMaterial = () => {
  return (
    <>
      <Navbar />

      <div style={styles.wrapper}>
        {/* Hero Section */}
        <div style={styles.hero}>
          <h1 style={styles.title}>StudyMaterial</h1>
          <p style={styles.subtitle}>
            SmartStudy lets learn and collaborate
          </p>
        </div>

        {/* Main Layout */}
        <div style={styles.container}>
          
          {/* Side Panel */}
          <div style={styles.sidebar}>
            <button style={styles.sideBtn}>Latest</button>
            <button style={styles.sideBtn}>By Top Authors</button>
            <button style={styles.sideBtn}>By SmartStudy</button>
            <button style={styles.sideBtn}>Top Viewed Study Courses</button>
          </div>

          {/* Right Content */}
          <div style={styles.content}>
            
            {/* Search Bar */}
            <div style={styles.searchBox}>
              <input
                type="text"
                placeholder="Search study materials, subjects, courses..."
                style={styles.searchInput}
              />
              <button style={styles.searchBtn}>Search</button>
            </div>

            {/* Study Topic Cards */}
            <div style={styles.grid}>
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Study Topic 1</h3>
                <p>Structured notes, quizzes and PYQs available.</p>
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Study Topic 2</h3>
                <p>Structured notes, quizzes and PYQs available.</p>
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Study Topic 3</h3>
                <p>Structured notes, quizzes and PYQs available.</p>
              </div>

              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Study Topic 4</h3>
                <p>Structured notes, quizzes and PYQs available.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

const styles = {
  wrapper: {
    background: "#f4f6fb",
    minHeight: "100vh",
    paddingBottom: "40px"
  },

  hero: {
    padding: "40px 80px 10px 80px"
  },

  title: {
    fontSize: "48px",
    marginBottom: "5px",
    color: "#1c1c3a"
  },

  subtitle: {
    fontSize: "18px",
    color: "#555"
  },

  container: {
    display: "flex",
    gap: "40px",
    padding: "20px 80px"
  },

  sidebar: {
    width: "260px",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },

  sideBtn: {
    padding: "16px",
    borderRadius: "20px",
    border: "none",
    background: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
    transition: "0.3s"
  },

  content: {
    flex: 1
  },

  searchBox: {
    display: "flex",
    marginBottom: "30px",
    marginTop: "0px"
  },

  searchInput: {
    flex: 1,
    padding: "16px",
    borderRadius: "30px 0 0 30px",
    border: "none",
    outline: "none",
    fontSize: "16px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
  },

  searchBtn: {
    padding: "16px 30px",
    borderRadius: "0 30px 30px 0",
    border: "none",
    background: "linear-gradient(90deg,#5f5fff,#7a5fff)",
    color: "white",
    fontWeight: "600",
    cursor: "pointer"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "30px"
  },

  card: {
    background: "white",
    padding: "25px",
    borderRadius: "20px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
    cursor: "pointer",
    transition: "0.3s"
  },

  cardTitle: {
    color: "#4a4aff",
    marginBottom: "10px"
  }
};

export default StudyMaterial;