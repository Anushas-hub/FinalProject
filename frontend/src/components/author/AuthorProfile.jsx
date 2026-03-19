import { useEffect, useState } from "react";

export default function AuthorProfile() {

  const username = localStorage.getItem("user");

  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    education: "",
    experience: "",
    skills: "",
    profileImage: null,
    imageFile: null
  });

  const [refresh, setRefresh] = useState(false);
  const [isEditing, setIsEditing] = useState(true);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/author-profile/${username}/`)
      .then(res => res.json())
      .then(data => {

        const hasData =
          data.name || data.bio || data.education || data.experience || data.skills || data.profile_image;

        setProfileData({
          name: data.name || "",
          bio: data.bio || "",
          education: data.education || "",
          experience: data.experience || "",
          skills: data.skills || "",
          profileImage: data.profile_image || null,
          imageFile: null
        });

        setIsEditing(!hasData);
      });
  }, [username, refresh]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setProfileData({
        ...profileData,
        profileImage: URL.createObjectURL(file),
        imageFile: file
      });
    }
  };

  const saveProfile = async () => {

    const formData = new FormData();

    formData.append("username", username);
    formData.append("name", profileData.name);
    formData.append("bio", profileData.bio);
    formData.append("education", profileData.education);
    formData.append("experience", profileData.experience);
    formData.append("skills", profileData.skills);

    if (profileData.imageFile) {
      formData.append("profile_image", profileData.imageFile);
    }

    const res = await fetch("http://127.0.0.1:8000/api/save-author-profile/", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    alert(data.message || "Saved");

    setIsEditing(false);
    setRefresh(!refresh);
  };

  const deleteImage = async () => {

    await fetch("http://127.0.0.1:8000/api/delete-author-image/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username })
    });

    setProfileData(prev => ({
      ...prev,
      profileImage: null,
      imageFile: null
    }));

    setRefresh(!refresh);
  };

  return (

    <div style={styles.container}>

      <h2 style={styles.heading}>Profile Information</h2>

      <div style={styles.card}>

        {/* VIEW MODE */}
        {!isEditing && (
          <>
            <div style={styles.imageSection}>
              {profileData.profileImage ? (
                <img src={profileData.profileImage} style={styles.profileImage} />
              ) : (
                <div style={styles.placeholder}>No Image</div>
              )}
            </div>

            <div style={styles.chipBlock}>
              <span style={styles.chipTitle}>Name</span>
              <span style={styles.chip}>{profileData.name || "Not added"}</span>
            </div>

            <div style={styles.chipBlock}>
              <span style={styles.chipTitle}>Bio</span>
              <span style={styles.chip}>{profileData.bio || "Not added"}</span>
            </div>

            <div style={styles.chipBlock}>
              <span style={styles.chipTitle}>Education</span>
              <span style={styles.chip}>{profileData.education || "Not added"}</span>
            </div>

            <div style={styles.chipBlock}>
              <span style={styles.chipTitle}>Experience</span>
              <span style={styles.chip}>{profileData.experience || "Not added"}</span>
            </div>

            {/* SKILLS */}
            <div style={{ marginTop: "15px" }}>
              <span style={styles.chipTitle}>Skills</span>

              <div style={styles.skillsContainer}>
                {profileData.skills
                  ? profileData.skills.split(",").map((skill, index) => (
                      <span key={index} style={styles.skillChip}>
                        {skill.trim()}
                      </span>
                    ))
                  : <span style={styles.chip}>No skills added</span>}
              </div>
            </div>

            <button
              style={styles.primaryBtn}
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          </>
        )}

        {/* EDIT MODE */}
        {isEditing && (
          <>

            <div style={styles.imageSection}>

              <div style={styles.imageWrapper}>
                {profileData.profileImage ? (
                  <img src={profileData.profileImage} style={styles.profileImage} />
                ) : (
                  <div style={styles.placeholder}>No Image</div>
                )}
              </div>

              {!profileData.profileImage && (
                <label style={styles.imageBtn}>
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={handleImageChange}
                  />
                </label>
              )}

              {profileData.profileImage && (
                <>
                  <label style={styles.imageBtn}>
                    Change Image
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageChange}
                    />
                  </label>

                  <button style={styles.deleteBtn} onClick={deleteImage}>
                    Delete Image
                  </button>
                </>
              )}

            </div>

            {/* FORM */}
            <div style={styles.field}>
              <label>Full Name</label>
              <input
                style={styles.input}
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
              />
            </div>

            <div style={styles.field}>
              <label>Bio</label>
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
                <label>Education</label>
                <input
                  style={styles.input}
                  value={profileData.education}
                  onChange={(e) =>
                    setProfileData({ ...profileData, education: e.target.value })
                  }
                />
              </div>

              <div style={styles.field}>
                <label>Experience</label>
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
              <label>Skills (comma separated)</label>
              <input
                style={styles.input}
                value={profileData.skills}
                onChange={(e) =>
                  setProfileData({ ...profileData, skills: e.target.value })
                }
              />
            </div>

            <button style={styles.primaryBtn} onClick={saveProfile}>
              Save Changes
            </button>

          </>
        )}

      </div>
    </div>
  );
}

const styles = {
  container:{maxWidth:"900px",margin:"0 auto"},
  heading:{marginBottom:"25px"},
  card:{background:"#fff",padding:"30px",borderRadius:"18px",boxShadow:"0 10px 25px rgba(0,0,0,0.06)"},
  imageSection:{display:"flex",alignItems:"center",gap:"25px",marginBottom:"30px"},
  imageWrapper:{width:"120px",height:"120px",borderRadius:"50%",overflow:"hidden",background:"#f1f5f9"},
  profileImage:{width:"120px",height:"120px",borderRadius:"50%",objectFit:"cover"},
  placeholder:{display:"flex",alignItems:"center",justifyContent:"center",height:"120px",width:"120px",borderRadius:"50%",background:"#f1f5f9",color:"#94a3b8"},
  imageBtn:{padding:"10px 18px",borderRadius:"12px",border:"1px solid #4f46e5",cursor:"pointer"},
  deleteBtn:{padding:"10px 18px",borderRadius:"12px",border:"1px solid red",color:"red",cursor:"pointer"},
  field:{marginBottom:"20px",display:"flex",flexDirection:"column"},
  input:{padding:"12px",borderRadius:"10px",border:"1px solid #ddd"},
  textarea:{padding:"12px",borderRadius:"10px",border:"1px solid #ddd",minHeight:"100px"},
  grid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"},
  primaryBtn:{padding:"14px",borderRadius:"14px",border:"none",background:"#4f46e5",color:"#fff",cursor:"pointer"},

  chipBlock:{
    marginTop:"12px",
    display:"flex",
    flexDirection:"column",
    gap:"6px"
  },

  chipTitle:{
    fontSize:"12px",
    fontWeight:"600",
    color:"#6b7280",
    textTransform:"uppercase"
  },

  chip:{
    padding:"8px 14px",
    borderRadius:"20px",
    background:"#c5c7f0",
    fontSize:"13px",
    width:"fit-content"
  },

  skillsContainer:{
    marginTop:"8px",
    display:"flex",
    flexWrap:"wrap",
    gap:"8px"
  },

  skillChip:{
    padding:"6px 12px",
    borderRadius:"20px",
    background:"#c5c7f0",
    fontSize:"12px"
  }
};