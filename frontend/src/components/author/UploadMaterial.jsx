import { useState, useEffect } from "react";

export default function UploadMaterial({ editItem, onSuccess, onCancel }) {

  const username = localStorage.getItem("user");

  const [mode, setMode] = useState("content");

  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    description: "",
    course: "bsc_it",
    semester: "sem1",
    content: "",
    file: null,
  });

  // 🔥 PREFILL WHEN EDITING
  useEffect(() => {
    if (editItem) {
      setFormData({
        title: editItem.title || "",
        subject: editItem.subject || "",
        description: editItem.description || "",
        course: editItem.course || "bsc_it",
        semester: editItem.semester || "sem1",
        content: editItem.content || "",
        file: null,
      });
    }
  }, [editItem]);

  const handleSubmit = async () => {
    try {
      const data = new FormData();

      data.append("username", username);
      data.append("title", formData.title);
      data.append("subject", formData.subject);
      data.append("description", formData.description);
      data.append("course", formData.course);
      data.append("semester", formData.semester);

      if (mode === "content" || mode === "both") {
        data.append("content", formData.content);
      }

      if ((mode === "pdf" || mode === "both") && formData.file) {
        data.append("file", formData.file);
      }

      // 🔥 SWITCH API (CREATE vs UPDATE)
      const url = editItem
        ? `http://127.0.0.1:8000/api/author/update-material/${editItem.id}/`
        : "http://127.0.0.1:8000/api/author/upload-material/";

      const method = editItem ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: data
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message || "Success");

        // 🔥 RESET ONLY IF CREATE
        if (!editItem) {
          setFormData({
            title: "",
            subject: "",
            description: "",
            course: "bsc_it",
            semester: "sem1",
            content: "",
            file: null,
          });
        }

        if (onSuccess) onSuccess();

      } else {
        alert(result.error || "Failed");
      }

    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };

  return (
    <div style={styles.container}>

      <h2 style={styles.heading}>
        {editItem ? "Edit Material" : "Upload Study Material"}
      </h2>

      <div style={styles.card}>

        <div style={styles.modeRow}>
          <button onClick={() => setMode("content")} style={mode === "content" ? styles.activeBtn : styles.modeBtn}>Content</button>
          <button onClick={() => setMode("pdf")} style={mode === "pdf" ? styles.activeBtn : styles.modeBtn}>PDF</button>
          <button onClick={() => setMode("both")} style={mode === "both" ? styles.activeBtn : styles.modeBtn}>Content + PDF</button>
        </div>

        <input
          style={styles.input}
          placeholder="Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <input
          style={styles.input}
          placeholder="Subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
        />

        <select
          style={styles.input}
          value={formData.course}
          onChange={(e) => setFormData({ ...formData, course: e.target.value })}
        >
          <option value="bsc_it">BSc IT</option>
          <option value="bsc_cs">BSc CS</option>
        </select>

        <select
          style={styles.input}
          value={formData.semester}
          onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
        >
          <option value="sem1">Sem 1</option>
          <option value="sem2">Sem 2</option>
          <option value="sem3">Sem 3</option>
          <option value="sem4">Sem 4</option>
          <option value="sem5">Sem 5</option>
          <option value="sem6">Sem 6</option>
        </select>

        <textarea
          style={styles.textarea}
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        {(mode === "content" || mode === "both") && (
          <textarea
            style={styles.textarea}
            placeholder="Write Content..."
            value={formData.content}
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

        <button style={styles.primaryBtn} onClick={handleSubmit}>
          {editItem ? "Update Material" : "Upload Material"}
        </button>

        {/* 🔥 CANCEL BUTTON ONLY IN EDIT */}
        {editItem && (
          <button style={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
        )}

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

  cancelBtn: {
    padding: "12px",
    borderRadius: "12px",
    border: "none",
    background: "#999",
    color: "#fff",
    cursor: "pointer",
  }
};