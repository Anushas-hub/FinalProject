import { useState } from "react";

export default function AuthorProfile() {
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    education: "",
    experience: "",
    skills: "",
    profileImage: null,
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileData({
        ...profileData,
        profileImage: URL.createObjectURL(file),
      });
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Profile Information</h2>

      <div style={styles.card}>

        {/* 🔥 Profile Image Section */}
        <div style={styles.imageSection}>
          <div style={styles.imageWrapper}>
            {profileData.profileImage ? (
              <img
                src={profileData.profileImage}
                alt="Profile"
                style={styles.profileImage}
              />
            ) : (
              <div style={styles.placeholder}>
                No Image
              </div>
            )}
          </div>

          <label style={styles.imageBtn}>
            {profileData.profileImage ? "Change Image" : "Add Profile Photo"}
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </label>
        </div>

        {/* Existing Fields */}

        <div style={styles.field}>
          <label style={styles.label}>Full Name</label>
          <input
            style={styles.input}
            value={profileData.name}
            onChange={(e) =>
              setProfileData({ ...profileData, name: e.target.value })
            }
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Bio</label>
          <textarea
            style={styles.textarea}
            value={profileData.bio}
            onChange={(e) =>
              setProfileData({ ...profileData, bio: e.target.value })
            }
          />
        </div>

        <div style={styles.grid}>
          <div style={styles.field}>
            <label style={styles.label}>Education</label>
            <input
              style={styles.input}
              value={profileData.education}
              onChange={(e) =>
                setProfileData({ ...profileData, education: e.target.value })
              }
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Experience</label>
            <input
              style={styles.input}
              value={profileData.experience}
              onChange={(e) =>
                setProfileData({ ...profileData, experience: e.target.value })
              }
            />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Skills</label>
          <input
            style={styles.input}
            value={profileData.skills}
            onChange={(e) =>
              setProfileData({ ...profileData, skills: e.target.value })
            }
          />
        </div>

        <button style={styles.primaryBtn}>Save Changes</button>
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
  },

  /* 🔥 Image Section */
  imageSection: {
    display: "flex",
    alignItems: "center",
    gap: "25px",
    marginBottom: "30px",
  },

  imageWrapper: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    overflow: "hidden",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  profileImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  placeholder: {
    color: "#94a3b8",
    fontSize: "14px",
  },

  imageBtn: {
    padding: "10px 18px",
    borderRadius: "12px",
    border: "1px solid #4f46e5",
    background: "#ffffff",
    color: "#4f46e5",
    fontWeight: "600",
    cursor: "pointer",
  },

  field: { marginBottom: "20px", display: "flex", flexDirection: "column" },

  label: { marginBottom: "8px", fontWeight: "600", color: "#334155" },

  input: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    outline: "none",
  },

  textarea: {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    minHeight: "100px",
    resize: "none",
  },

  grid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" },

  primaryBtn: {
    marginTop: "15px",
    padding: "14px",
    borderRadius: "14px",
    border: "none",
    background: "#4f46e5",
    color: "#ffffff",
    fontWeight: "600",
    cursor: "pointer",
  },
};