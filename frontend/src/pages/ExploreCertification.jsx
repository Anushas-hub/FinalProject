import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ExploreCertification() {
  const navigate = useNavigate();
  const user = localStorage.getItem("user");

  const [search, setSearch] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!search.trim()) return;
    navigate(`/certifications?search=${search}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>
          Hello, {user}  <br />
          What are you opting to learn today?
        </h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            placeholder="Search Certification Course..."
            style={styles.input}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

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
  },
  card: {
    width: "450px",
    padding: "35px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.95)",
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
    padding: "14px",
    borderRadius: "10px",
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
  },
};