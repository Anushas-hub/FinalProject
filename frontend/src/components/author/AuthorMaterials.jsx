import { useEffect, useState } from "react";

export default function AuthorMaterials() {

  const username = localStorage.getItem("user");
  const [materials, setMaterials] = useState([]);

  // 🔥 EDIT STATE
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  const fetchMaterials = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/author/my-materials/${username}/`);
      const data = await res.json();
      setMaterials(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this material?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/author/delete-material/${id}/`, {
        method: "DELETE"
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        fetchMaterials();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting material");
    }
  };

  // 🔥 START EDIT
  const startEdit = (item) => {
    setEditingId(item.id);
    setEditData(item);
  };

  // 🔥 UPDATE MATERIAL
  const handleUpdate = async () => {
    try {
      const data = new FormData();

      data.append("title", editData.title);
      data.append("subject", editData.subject);
      data.append("course", editData.course);
      data.append("semester", editData.semester);
      data.append("description", editData.description);
      data.append("content", editData.content);

      const res = await fetch(`http://127.0.0.1:8000/api/author/update-material/${editingId}/`, {
        method: "PUT",
        body: data
      });

      const result = await res.json();

      if (res.ok) {
        alert(result.message);
        setEditingId(null);
        fetchMaterials();
      } else {
        alert(result.error);
      }

    } catch (error) {
      console.error(error);
      alert("Update failed");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>My Uploaded Materials</h2>

      {materials.length === 0 ? (
        <p>No materials uploaded yet.</p>
      ) : (
        materials.map((item) => (
          <div key={item.id} style={styles.card}>

            {/* 🔥 EDIT MODE */}
            {editingId === item.id ? (
              <>
                <input
                  style={styles.input}
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                />

                <input
                  style={styles.input}
                  value={editData.subject}
                  onChange={(e) => setEditData({ ...editData, subject: e.target.value })}
                />

                <input
                  style={styles.input}
                  value={editData.course}
                  onChange={(e) => setEditData({ ...editData, course: e.target.value })}
                />

                <input
                  style={styles.input}
                  value={editData.semester}
                  onChange={(e) => setEditData({ ...editData, semester: e.target.value })}
                />

                <textarea
                  style={styles.textarea}
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                />

                <textarea
                  style={styles.textarea}
                  value={editData.content}
                  onChange={(e) => setEditData({ ...editData, content: e.target.value })}
                />

                <button style={styles.primaryBtn} onClick={handleUpdate}>
                  Save
                </button>

                <button
                  style={styles.cancelBtn}
                  onClick={() => setEditingId(null)}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <h3>{item.title}</h3>
                <p><b>Subject:</b> {item.subject}</p>
                <p><b>Course:</b> {item.course}</p>
                <p><b>Semester:</b> {item.semester}</p>
                <p>{item.description}</p>

                {item.file && (
                  <a href={item.file} target="_blank" rel="noreferrer">
                    View PDF
                  </a>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button
                    style={styles.editBtn}
                    onClick={() => startEdit(item)}
                  >
                    Edit
                  </button>

                  <button
                    style={styles.deleteBtn}
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}

          </div>
        ))
      )}
    </div>
  );
}

const styles = {
  container: { maxWidth: "900px", margin: "0 auto" },
  heading: { marginBottom: "25px" },

  card: {
    background: "#fff",
    padding: "20px",
    borderRadius: "15px",
    marginBottom: "15px",
    boxShadow: "0 6px 15px rgba(0,0,0,0.05)",
  },

  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd"
  },

  textarea: {
    width: "100%",
    padding: "10px",
    marginBottom: "10px",
    borderRadius: "8px",
    border: "1px solid #ddd"
  },

  editBtn: {
    padding: "10px 15px",
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    borderRadius: "10px",
    cursor: "pointer"
  },

  deleteBtn: {
    padding: "10px 15px",
    border: "none",
    background: "red",
    color: "#fff",
    borderRadius: "10px",
    cursor: "pointer"
  },

  primaryBtn: {
    padding: "10px 15px",
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    borderRadius: "10px",
    cursor: "pointer",
    marginRight: "10px"
  },

  cancelBtn: {
    padding: "10px 15px",
    border: "none",
    background: "#999",
    color: "#fff",
    borderRadius: "10px",
    cursor: "pointer"
  }
};