import { useState } from "react";
import Navbar from "../components/Navbar";

export default function PreviousYearQuestions() {
  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");
  const [showPDF, setShowPDF] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const dummyPDF =
    "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

  const subjectsData = {
    "1": ["Mathematics I", "Programming in C", "Digital Logic"],
    "2": ["Mathematics II", "Data Structures", "Database Basics"],
    "3": ["Java Programming", "Computer Networks", "Operating System"],
    "4": ["Python", "Software Engineering", "DBMS"],
    "5": ["Web Development", "AI Basics", "Cloud Computing"],
    "6": ["Machine Learning", "Cyber Security", "Project Management"],
  };

  const handleGetPYQ = () => {
    if (!course || !semester || !subject || !year) {
      alert("Please select all fields.");
      return;
    }
    setShowPDF(true);
  };

  const handleBack = () => {
    setShowPDF(false);
  };

  const handleDownload = () => {
    setDownloading(true);

    const link = document.createElement("a");
    link.href = dummyPDF;
    link.download = `${subject}-${year}.pdf`;
    link.click();

    setTimeout(() => {
      setDownloading(false);
    }, 1500);
  };

  return (
    <div style={styles.wrapper}>
      <Navbar />

      {/* Header */}
      <div style={styles.blueBox}>
        <h2 style={styles.blueTitle}>Previous Year Questions</h2>
      </div>

      <div style={styles.mainContainer}>
        <div style={styles.cardContainer}>

          {!showPDF && (
            <div style={styles.card}>
              {/* Course */}
              <div style={styles.formGroup}>
                <label>Course</label>
                <select
                  value={course}
                  onChange={(e) => {
                    setCourse(e.target.value);
                    setSemester("");
                    setSubject("");
                    setYear("");
                  }}
                >
                  <option value="">Select Course</option>
                  <option value="BScIT">B.Sc. Information Technology</option>
                  <option value="BScCS">B.Sc. Computer Science</option>
                </select>
              </div>

              {/* Semester */}
              <div style={styles.formGroup}>
                <label>Semester</label>
                <select
                  value={semester}
                  onChange={(e) => {
                    setSemester(e.target.value);
                    setSubject("");
                    setYear("");
                  }}
                  disabled={!course}
                >
                  <option value="">Select Semester</option>
                  {[1, 2, 3, 4, 5, 6].map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
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

              {/* Year */}
              <div style={styles.formGroup}>
                <label>Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  disabled={!course || !semester}
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
          )}

          {showPDF && (
            <div style={styles.card}>
              <h3 style={styles.pdfTitle}>
                {subject} - Semester {semester} ({year})
              </h3>

              <div style={styles.pdfWrapper}>
                <iframe
                  src={dummyPDF}
                  title="PYQ PDF"
                  style={styles.pdfFrame}
                />
              </div>

              <div style={styles.buttonRow}>
                <a
                  href={dummyPDF}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.viewBtn}
                >
                  View
                </a>

                <button
                  onClick={handleDownload}
                  style={{
                    ...styles.downloadBtn,
                    opacity: downloading ? 0.7 : 1,
                  }}
                  disabled={downloading}
                >
                  {downloading ? "Downloading..." : "Download"}
                </button>

                <button onClick={handleBack} style={styles.backBtn}>
                  Back
                </button>
              </div>
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

  blueBox: {
    background: "#4f46e5",
    padding: "25px 20px",
    textAlign: "center",
    color: "white",
  },

  blueTitle: {
    fontSize: "24px",
    fontWeight: "600",
  },

  mainContainer: {
    display: "flex",
    justifyContent: "center",
    padding: "25px 20px 50px 20px",
  },

  cardContainer: {
    width: "100%",
    maxWidth: "820px",
  },

  card: {
    background: "white",
    padding: "30px",
    borderRadius: "18px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    display: "grid",
    gap: "18px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  submitBtn: {
    padding: "14px",
    borderRadius: "30px",
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },

  pdfTitle: {
    marginBottom: "5px",
  },

  pdfWrapper: {
    width: "100%",
    height: "480px",
    borderRadius: "14px",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
    boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
  },

  pdfFrame: {
    width: "100%",
    height: "100%",
    border: "none",
  },

  buttonRow: {
    marginTop: "15px",
    display: "flex",
    gap: "12px",
  },

  viewBtn: {
    padding: "10px 25px",
    borderRadius: "25px",
    background: "#6366f1",
    color: "#ffffff",
    textDecoration: "none",
  },

  downloadBtn: {
    padding: "10px 25px",
    borderRadius: "25px",
    border: "none",
    background: "#10b981",
    color: "#ffffff",
    cursor: "pointer",
  },

  backBtn: {
    padding: "10px 25px",
    borderRadius: "25px",
    border: "none",
    background: "#ef4444",
    color: "#ffffff",
    cursor: "pointer",
  },
};