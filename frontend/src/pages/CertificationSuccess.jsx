import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function CertificationSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = localStorage.getItem("user");

  const certificate_id = location.state?.certificate_id;
  const course_title = location.state?.course_title || "Certification Course";

  return (
    <>
      <Navbar />
      <div style={styles.page}>

        {/* Confetti-style top bar */}
        <div style={styles.topBar} />

        <div style={styles.card}>

          {/* Icon */}
          <div style={styles.iconWrapper}>
            <span style={styles.icon}>🏆</span>
          </div>

          <h1 style={styles.congrats}>Congratulations!</h1>
          <h2 style={styles.name}>{user}</h2>

          <p style={styles.message}>
            You have successfully completed
          </p>
          <h3 style={styles.courseTitle}>{course_title}</h3>

          <div style={styles.divider} />

          {certificate_id && (
            <div style={styles.certIdBox}>
              <p style={styles.certIdLabel}>Certificate ID</p>
              <p style={styles.certId}>{certificate_id}</p>
            </div>
          )}

          <p style={styles.subMsg}>
            Your verified SmartStudy certificate has been issued.
            You can view and download it below.
          </p>

          <div style={styles.btnRow}>
            {certificate_id && (
              <button
                style={styles.primaryBtn}
                onClick={() => navigate(`/certificate/${certificate_id}`)}
              >
                📄 View Certificate
              </button>
            )}
            <button
              style={styles.secondaryBtn}
              onClick={() => navigate("/certifications")}
            >
              Explore More Courses
            </button>
          </div>

        </div>

      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#f0f9ff,#f5f3ff,#ecfdf5)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    paddingTop: "60px",
    paddingBottom: "60px",
  },
  topBar: {
    position: "fixed", top: 0, left: 0, right: 0,
    height: "4px",
    background: "linear-gradient(90deg,#4f46e5,#7c3aed,#22c55e,#06b6d4)",
    zIndex: 999,
  },
  card: {
    background: "#fff",
    borderRadius: "24px",
    padding: "50px 40px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
    maxWidth: "520px",
    width: "90%",
    textAlign: "center",
  },
  iconWrapper: {
    width: "90px", height: "90px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#fef9c3,#fde047)",
    display: "flex", alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 20px auto",
  },
  icon: { fontSize: "45px" },
  congrats: {
    fontSize: "30px", fontWeight: "800",
    color: "#1e293b", margin: "0 0 6px 0",
  },
  name: {
    fontSize: "22px", fontWeight: "700",
    color: "#4f46e5", margin: "0 0 16px 0",
  },
  message: { fontSize: "15px", color: "#64748b", margin: "0 0 4px 0" },
  courseTitle: {
    fontSize: "18px", fontWeight: "700",
    color: "#1e293b", margin: "0 0 24px 0",
    lineHeight: "1.4",
  },
  divider: {
    height: "1px", background: "#f1f5f9",
    margin: "0 0 20px 0",
  },
  certIdBox: {
    background: "#f8fafc", borderRadius: "12px",
    padding: "14px 20px", marginBottom: "20px",
  },
  certIdLabel: {
    fontSize: "11px", fontWeight: "700",
    color: "#94a3b8", textTransform: "uppercase",
    letterSpacing: "1px", margin: "0 0 4px 0",
  },
  certId: {
    fontSize: "16px", fontWeight: "700",
    color: "#4f46e5", margin: 0,
    letterSpacing: "1px",
  },
  subMsg: {
    fontSize: "13px", color: "#64748b",
    lineHeight: "1.6", marginBottom: "28px",
  },
  btnRow: { display: "flex", flexDirection: "column", gap: "12px" },
  primaryBtn: {
    padding: "14px",
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    color: "#fff", border: "none",
    borderRadius: "12px", fontSize: "15px",
    fontWeight: "700", cursor: "pointer",
  },
  secondaryBtn: {
    padding: "13px",
    background: "#fff", color: "#4f46e5",
    border: "2px solid #e0e7ff",
    borderRadius: "12px", fontSize: "15px",
    fontWeight: "600", cursor: "pointer",
  },
};