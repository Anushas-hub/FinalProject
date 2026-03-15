import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Home() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");

  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = "scale(1.04)";
    e.currentTarget.style.boxShadow =
      "0 20px 40px rgba(0,0,0,0.08)";
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = "scale(1)";
    e.currentTarget.style.boxShadow =
      "0 10px 25px rgba(0,0,0,0.05)";
  };

  const handleExploreClick = () => {
    const user = localStorage.getItem("user");

    if (user) {
      navigate("/explore-certification");
    } else {
      navigate("/login", {
        state: {
          message:
            "To complete the course and quizzes for certification, please login or sign up. We require your details to generate your certificate.",
        },
      });
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) return;

    navigate(`/study-material?search=${searchTerm}`);
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
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button style={styles.searchButton} onClick={handleSearch}>
            Search
          </button>
        </div>
      </section>

      {/* About Section */}
      <section style={styles.aboutSection}>
        <div style={styles.cardsContainer}>
          {[
            {
              title: "Purpose",
              text: "SmartStudy simplifies learning through structured notes, PYQs, and collaboration tools for students.",
            },
            {
              title: "Syllabus Aligned Notes (Mumbai University)",
              text: "B.Sc IT & B.Sc CS courses with syllabus-focused notes.",
            },
            {
              title: "Subject Based Quizzes",
              text: "Topic-wise quizzes to improve understanding and exam preparation.",
            },
            {
              title: "Student–Author Collaboration",
              text: "Authors upload notes & Q&A, students ask doubts — interactive academic ecosystem.",
            },
          ].map((card, index) => (
            <div
              key={index}
              style={styles.card}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <h3 style={styles.cardTitle}>{card.title}</h3>
              <p style={styles.cardText}>{card.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Certification Section */}
      <section style={styles.certSection}>
        <div style={styles.certBox}>
          <h2 style={styles.certTitle}>
            Get Certified in Your Preferred Topics
          </h2>

          <button
            style={styles.certButton}
            onClick={handleExploreClick}
          >
            Click to Explore
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #f0f9ff 0%, #f5f3ff 50%, #ecfdf5 100%)",
  },

  searchSection: {
    padding: "50px 20px 30px 20px",
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
    background: "#4f46e5",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
  },

  aboutSection: {
    padding: "30px 20px",
  },

  cardsContainer: {
    maxWidth: "1000px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "35px",
  },

  card: {
    background: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(10px)",
    padding: "30px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    transition: "all 0.3s ease",
    cursor: "pointer",
  },

  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    marginBottom: "12px",
    color: "#3730a3",
  },

  cardText: {
    fontSize: "14px",
    color: "#475569",
    lineHeight: "1.6",
  },

  certSection: {
    padding: "40px 20px",
    display: "flex",
    justifyContent: "center",
  },

  certBox: {
    width: "100%",
    maxWidth: "700px",
    background: "rgba(255,255,255,0.9)",
    padding: "40px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
    textAlign: "center",
  },

  certTitle: {
    fontSize: "22px",
    fontWeight: "700",
    marginBottom: "25px",
    color: "#1e293b",
  },

  certButton: {
    padding: "12px 40px",
    borderRadius: "30px",
    border: "none",
    background: "#4f46e5",
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "500",
    cursor: "pointer",
  },
};
