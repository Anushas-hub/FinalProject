import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

export default function PreviousYearQuestions() {

  const [courses,setCourses] = useState([])
  const [semesters,setSemesters] = useState([])
  const [years,setYears] = useState([])
  const [subjects,setSubjects] = useState([])

  const [course, setCourse] = useState("");
  const [semester, setSemester] = useState("");
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("");

  const [showPDF, setShowPDF] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [downloading, setDownloading] = useState(false);

  // load course semester year
  useEffect(()=>{

    fetch("http://127.0.0.1:8000/api/pyq-options/")
    .then(res=>res.json())
    .then(data=>{
      setCourses(data.courses)
      setSemesters(data.semesters)
      setYears(data.years)
    })

  },[])

  // load subjects when course + semester selected
  useEffect(()=>{

    if(!course || !semester) return

    fetch(`http://127.0.0.1:8000/api/pyq-subjects/?course=${course}&semester=${semester}`)
    .then(res=>res.json())
    .then(data=>{
      setSubjects(data)
    })

  },[course,semester])


  const handleGetPYQ = async () => {

    if (!course || !semester || !subject || !year) {
      alert("Please select all fields.");
      return;
    }

    try {

      const res = await fetch(
        `http://127.0.0.1:8000/api/pyqs/?course=${course}&semester=${semester}&subject=${subject}&year=${year}`
      );

      const data = await res.json();

      if (!data || data.length === 0) {
        alert("No PYQ found");
        return;
      }

      const pdf = "http://127.0.0.1:8000" + data[0].pdf;

      setPdfUrl(pdf);
      setShowPDF(true);

    } catch (err) {
      console.error(err);
      alert("Error fetching PYQ");
    }
  };

  const handleBack = () => {
    setShowPDF(false);
    setPdfUrl("");
  };

  const handleDownload = () => {

    setDownloading(true);

    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = `${subject}-${year}.pdf`;
    link.click();

    setTimeout(() => {
      setDownloading(false);
    }, 1200);
  };

  return (
    <div style={styles.wrapper}>
      <Navbar />

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
                  onChange={(e)=>{
                    setCourse(e.target.value)
                    setSemester("")
                    setSubject("")
                    setYear("")
                  }}
                >

                  <option value="">Select Course</option>

                  {courses.map(c=>(
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}

                </select>
              </div>

              {/* Semester */}
              <div style={styles.formGroup}>
                <label>Semester</label>

                <select
                  value={semester}
                  onChange={(e)=>{
                    setSemester(e.target.value)
                    setSubject("")
                    setYear("")
                  }}
                  disabled={!course}
                >

                  <option value="">Select Semester</option>

                  {semesters.map(s=>(
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}

                </select>
              </div>

              {/* Subject */}
              <div style={styles.formGroup}>
                <label>Subject</label>

                <select
                  value={subject}
                  onChange={(e)=>setSubject(e.target.value)}
                  disabled={!semester}
                >

                  <option value="">Select Subject</option>

                  {subjects.map(s=>(
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}

                </select>

              </div>

              {/* Year */}
              <div style={styles.formGroup}>
                <label>Year</label>

                <select
                  value={year}
                  onChange={(e)=>setYear(e.target.value)}
                  disabled={!semester}
                >

                  <option value="">Select Year</option>

                  {years.map(y=>(
                    <option key={y.value} value={y.value}>
                      {y.label}
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
                  src={pdfUrl}
                  title="PYQ PDF"
                  style={styles.pdfFrame}
                />

              </div>

              <div style={styles.buttonRow}>

                <a
                  href={pdfUrl}
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
                    opacity: downloading ? 0.7 : 1
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