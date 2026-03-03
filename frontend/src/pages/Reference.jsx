import { useNavigate } from "react-router-dom";

export default function Reference() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* Go Back */}
      <button onClick={() => navigate("/")} style={styles.backBtn}>
        ← Go Back
      </button>

      <h1 style={styles.title}>References</h1>

      <p style={styles.text}>
        SmartStudy content is created with accuracy, relevance, and academic
        integrity in mind. All materials are designed to align closely with
        university curricula.
      </p>

      <div style={styles.card}>
        <ul style={styles.list}>
          <li>University-approved syllabi and curriculum guidelines</li>
          <li>Standard academic textbooks and reference books</li>
          <li>Faculty-recommended study materials</li>
          <li>Peer-reviewed online educational resources</li>
        </ul>

        <p style={styles.note}>
          All uploaded content is reviewed to maintain quality, reliability, and
          usefulness for students.
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "800px",
    margin: "40px auto",
    padding: "20px",
    color: "#333",
    lineHeight: "1.7",
  },
  backBtn: {
  padding: "12px 20px",
  borderRadius: "20px",
  border: "none",
  background: "#ffffff",
  fontWeight: "600",
  cursor: "pointer",
  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  marginBottom: "20px",
},
  title: {
    fontSize: "30px",
    marginBottom: "15px",
  },
  text: {
    fontSize: "16px",
    marginBottom: "20px",
  },
  card: {
    background: "#f5f7fa",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },
  list: {
    paddingLeft: "20px",
    marginBottom: "15px",
  },
  note: {
    fontSize: "15px",
    color: "#555",
    marginTop: "10px",
  },
};