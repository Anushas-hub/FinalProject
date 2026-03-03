import { useState } from "react";

export default function UploadMaterial() {
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    file: null,
  });

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Upload Study Material</h2>

      <div style={styles.card}>

        <input
          style={styles.input}
          placeholder="Title"
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
        />

        <input
          style={styles.input}
          placeholder="Subject"
          onChange={(e) =>
            setFormData({ ...formData, subject: e.target.value })
          }
        />

        <textarea
          style={styles.textarea}
          placeholder="Description"
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />

        <input
          type="file"
          style={styles.fileInput}
          onChange={(e) =>
            setFormData({ ...formData, file: e.target.files[0] })
          }
        />

        <button style={styles.primaryBtn}>Upload Material</button>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "900px", margin: "0 auto" },
  heading: { marginBottom: "25px", color: "#1e293b" },

  card: {
    background: "#ffffff",
    padding: "30px",
    borderRadius: "18px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  input: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
  },

  textarea: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    minHeight: "100px",
  },

  fileInput: {
    padding: "10px",
  },

  primaryBtn: {
    padding: "14px",
    borderRadius: "14px",
    border: "none",
    background: "#4f46e5",
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
  },
};