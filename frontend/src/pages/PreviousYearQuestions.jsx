import { useState } from "react";
import Navbar from "../components/Navbar";

export default function PreviousYearQuestions() {
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [showPDF, setShowPDF] = useState(false);

  // Temporary subjects (Later backend se aayega)
  const subjectsData = {
    "1": ["Mathematics I", "Programming in C", "Digital Logic"],
    "2": ["Mathematics II", "Data Structures", "Database Basics"],
    "3": ["Java Programming", "Computer Networks", "OS"],
    "4": ["Python", "Software Engineering", "DBMS"],
    "5": ["Web Development", "AI Basics", "Cloud Computing"],
    "6": ["Machine Learning", "Cyber Security", "Project Management"],
  };

  const handleGetPYQ = () => {
    if (course && semester && subject && year) {
      setShowPDF(true);
    } else {
      alert("Please select all fields.");
    }
  };

  return (
    <div style={styles.wrapper}>
      <Navbar />

      {/* HERO */}
      <div style={styles.hero}>
        <h1 style={styles.title}>Previous Year Questions</h1>
        <p style={styles.subtitle}>
          Practice smarter with semester-wise PYQs
        </p>
      </div>

      <div style={styles.container}>
        {/* SIDE PANEL */}
        <div style={styles.sidebar}>
          <button style={styles.sideBtn}>Previous Year Questions</button>
        </div>

        {/* MAIN CONTENT */}
        <div style={styles.content}>
          <div style={styles.formCard}>
            
            {/* COURSE */}
            <div style={styles.formGroup}>
              <label>Course</label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              >
                <option value="">Select Course</option>
                <option value="BScIT">B.Sc. Information Technology</option>
                <option value="BScCS">B.Sc. Computer Science</option>
              </select>
            </div>

            {/* SEMESTER */}
            <div style={styles.formGroup}>
              <label>Semester</label>
              <select
                value={semester}
                onChange={(e) => {
                  setSemester(e.target.value);
                  setSubject("");
                }}
              >
                <option value="">Select Semester</option>
                {[1, 2, 3, 4, 5, 6].map((sem) => (
                  <option key={sem} value={sem}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>

            {/* SUBJECT */}
            <div style={styles.formGroup}>
              <label>Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={!semester}
              >
                <option value="">Select Subject</option>
                {semester &&
                  subjectsData[semester]?.map((sub, index) => (
                    <option key={index} value={sub}>
                      {sub}
                    </option>
                  ))}
              </select>
            </div>

            {/* YEAR */}
            <div style={styles.formGroup}>
              <label>Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="">Select Year</option>
                {Array.from({ length: 11 }, (_, i) => 2015 + i).map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <button style={styles.submitBtn} onClick={handleGetPYQ}>
              Get PYQ
            </button>
          </div>

          {/* PDF SECTION */}
          {showPDF && (
            <div style={styles.pdfSection}>
              <h2>
                {subject} - Semester {semester} ({year})
              </h2>

              <iframe
                src="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
                title="PYQ PDF"
                width="100%"
                height="500px"
                style={{ borderRadius: "12px", marginTop: "15px" }}
              ></iframe>

              <button style={styles.downloadBtn}>
                Download PDF
              </button>
            </div>
          )}
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

  hero: {
    padding: "30px 80px 10px 80px",
  },

  title: {
    fontSize: "34px",
    color: "#1e293b",
  },

  subtitle: {
    fontSize: "14px",
    color: "#64748b",
  },

  container: {
    display: "flex",
    gap: "30px",
    padding: "20px 80px 60px 80px",
  },

  sidebar: {
    width: "240px",
  },

  sideBtn: {
    padding: "15px",
    width: "100%",
    borderRadius: "18px",
    border: "none",
    background: "#ffffff",
    fontWeight: "600",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },

  content: {
    flex: 1,
  },

  formCard: {
    background: "#ffffff",
    padding: "30px",
    borderRadius: "18px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
    display: "grid",
    gap: "20px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  submitBtn: {
    padding: "12px",
    borderRadius: "30px",
    border: "none",
    background: "#4f46e5",
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
  },

  pdfSection: {
    marginTop: "40px",
    background: "#ffffff",
    padding: "30px",
    borderRadius: "18px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.05)",
  },

  downloadBtn: {
    marginTop: "20px",
    padding: "12px 30px",
    borderRadius: "25px",
    border: "none",
    background: "#10b981",
    color: "#ffffff",
    cursor: "pointer",
  },
};