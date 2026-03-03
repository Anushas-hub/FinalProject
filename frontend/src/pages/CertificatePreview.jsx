import { useParams } from "react-router-dom";

export default function CertificationPreview() {
  const { id } = useParams();
  const user = localStorage.getItem("user");

  return (
    <div style={styles.container}>
      <div style={styles.certificate}>
        <h1 style={styles.title}>Certificate of Completion</h1>

        <p style={styles.subtitle}>This is to certify that</p>

        <h2 style={styles.name}>{user}</h2>

        <p style={styles.text}>
          has successfully completed the certification course
        </p>

        <h3 style={styles.course}>Course ID: {id}</h3>

        <p style={styles.date}>
          Date: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#f3f4f6",
    padding: "40px",
  },
  certificate: {
    width: "800px",
    padding: "60px",
    borderRadius: "20px",
    background: "#ffffff",
    border: "8px solid #4f46e5",
    textAlign: "center",
    boxShadow: "0 20px 50px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "32px",
    marginBottom: "20px",
    color: "#4f46e5",
    fontWeight: "700",
  },
  subtitle: {
    fontSize: "18px",
    marginBottom: "10px",
    color: "#555",
  },
  name: {
    fontSize: "36px",
    margin: "20px 0",
    color: "#111",
    fontWeight: "600",
  },
  text: {
    fontSize: "18px",
    marginBottom: "15px",
    color: "#444",
  },
  course: {
    fontSize: "20px",
    marginTop: "10px",
    color: "#1e293b",
  },
  date: {
    marginTop: "30px",
    fontSize: "16px",
    color: "#666",
  },
};