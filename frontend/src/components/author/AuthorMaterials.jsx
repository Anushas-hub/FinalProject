import { useEffect, useState } from "react";
import UploadMaterial from "./UploadMaterial";

export default function AuthorMaterials() {

  const username = localStorage.getItem("user");
  const [materials, setMaterials] = useState([]);

  const [editingItem, setEditingItem] = useState(null);

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
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  if (editingItem) {
    return (
      <UploadMaterial
        editItem={editingItem}
        onSuccess={() => {
          setEditingItem(null);
          fetchMaterials();
        }}
        onCancel={() => setEditingItem(null)}
      />
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>My Uploaded Materials</h2>

      {materials.length === 0 ? (
        <p>No materials uploaded yet.</p>
      ) : (
        materials.map((item) => (
          <div key={item.id} style={styles.card}>

            <h3>{item.title}</h3>
            <p><b>Subject:</b> {item.subject}</p>
            <p><b>Course:</b> {item.course}</p>
            <p><b>Semester:</b> {item.semester}</p>
            <p>{item.description}</p>

            {/* ✅ OPEN PDF IN NEW TAB */}
            {item.file && (
              <button
                style={styles.viewBtn}
                onClick={() => window.open(item.file, "_blank")}
              >
                View PDF
              </button>
            )}

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              
              <button
                style={styles.editBtn}
                onClick={() => setEditingItem(item)}
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

  viewBtn: {
    padding: "10px 15px",
    border: "none",
    background: "#10b981",
    color: "#fff",
    borderRadius: "10px",
    cursor: "pointer",
    marginTop: "10px"
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
  }
};