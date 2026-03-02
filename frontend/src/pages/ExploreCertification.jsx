import { useNavigate } from "react-router-dom";

export default function ExploreCertification() {
  const navigate = useNavigate();
  const user = localStorage.getItem("user");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Course flow will connect here next 🚀");
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          Hello, {user} 👋 <br />
          What are you opting to learn today?
        </h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input placeholder="Which Course?" style={styles.input} />
          <input placeholder="Subject?" style={styles.input} />
          <input placeholder="Topic?" style={styles.input} />

          <button style={styles.btn}>
            Explore Course
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "80vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Arial",
  },
  card: {
    width: "450px",
    padding: "35px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.9)",
    boxShadow: "0 15px 35px rgba(0,0,0,0.08)",
    textAlign: "center",
  },
  title: {
    fontSize: "22px",
    marginBottom: "25px",
    color: "#1e293b",
  },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: {
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid #ccc",
  },
  btn: {
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
  },
};