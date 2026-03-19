import { useState } from "react";

export default function UploadMaterial() {

  const username = localStorage.getItem("user");

  const [mode, setMode] = useState("content"); // content | pdf | both

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    content: "",
    file: null,
  });

  const handleUpload = async () => {

    const data = new FormData();

    data.append("username", username);
    data.append("title", formData.title);
    data.append("subject", formData.subject);
    data.append("description", formData.description);

    if (mode === "content" || mode === "both") {
      data.append("content", formData.content);
    }

    if ((mode === "pdf" || mode === "both") && formData.file) {
      data.append("file", formData.file);
    }

    const res = await fetch("http://127.0.0.1:8000/api/upload-material/", {
      method: "POST",
      body: data
    });

    const result = await res.json();

    alert(result.message || result.error);
  };

  return (
    <div style={styles.container}>

      <h2 style={styles.heading}>Upload Study Material</h2>

      <div style={styles.card}>

        {/* MODE SELECT */}
        <div style={styles.modeRow}>
          <button onClick={() => setMode("content")} style={mode === "content" ? styles.activeBtn : styles.modeBtn}>Content</button>
          <button onClick={() => setMode("pdf")} style={mode === "pdf" ? styles.activeBtn : styles.modeBtn}>PDF</button>
          <button onClick={() => setMode("both")} style={mode === "both" ? styles.activeBtn : styles.modeBtn}>Content + PDF</button>
        </div>

        <input
          style={styles.input}
          placeholder="Title"
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <input
          style={styles.input}
          placeholder="Subject"
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        />

        <textarea
          style={styles.textarea}
          placeholder="Description"
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        {(mode === "content" || mode === "both") && (
          <textarea
            style={styles.textarea}
            placeholder="Write Content..."
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          />
        )}

        {(mode === "pdf" || mode === "both") && (
          <input
            type="file"
            style={styles.fileInput}
            onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
          />
        )}

        <button style={styles.primaryBtn} onClick={handleUpload}>
          Upload Material
        </button>

      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: "900px", margin: "0 auto" },
  heading: { marginBottom: "25px" },

  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "18px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "18px",
  },

  modeRow: {
    display: "flex",
    gap: "10px"
  },

  modeBtn: {
    padding: "10px 15px",
    borderRadius: "10px",
    border: "1px solid #4f46e5",
    background: "#fff",
    cursor: "pointer"
  },

  activeBtn: {
    padding: "10px 15px",
    borderRadius: "10px",
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    cursor: "pointer"
  },

  input: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #ddd",
  },

  textarea: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #ddd",
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
    color: "#fff",
    cursor: "pointer",
  },
};