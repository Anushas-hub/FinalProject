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

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/author-profile/${username}/`)
      .then(res => res.json())
      .then(data => {
        setProfileData({
          name: data.name || "",
          bio: data.bio || "",
          education: data.education || "",
          experience: data.experience || "",
          skills: data.skills || "",
          profileImage: data.profile_image,
          imageFile: null
        });
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

    setRefresh(!refresh); // 🔥 auto refresh after save
  };


  const deleteImage = async () => {

    await fetch("http://127.0.0.1:8000/api/delete-author-image/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username })
    });

    setProfileData({
      ...profileData,
      profileImage: null,
      imageFile: null
    });

  };


  return (

    <div style={styles.container}>

      <h2 style={styles.heading}>Profile Information</h2>

      <div style={styles.card}>

        {/* IMAGE SECTION */}
        <div style={styles.imageSection}>

          <div style={styles.imageWrapper}>
            {profileData.profileImage ? (
              <img
                src={profileData.profileImage}
                alt="Profile"
                style={styles.profileImage}
              />
            ) : (
              <div style={styles.placeholder}>No Image</div>
            )}
          </div>

          {/* CONDITIONAL BUTTONS */}
          {profileData.profileImage ? (
            <div style={{ display: "flex", gap: "10px" }}>

              <label style={styles.imageBtn}>
                Edit
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
              </label>

              <button style={styles.deleteBtn} onClick={deleteImage}>
                Delete
              </button>

            </div>
          ) : (
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
          <label>Skills</label>
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
  profileImage:{width:"100%",height:"100%",objectFit:"cover"},
  placeholder:{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:"#94a3b8"},
  imageBtn:{padding:"10px 18px",borderRadius:"12px",border:"1px solid #4f46e5",cursor:"pointer"},
  deleteBtn:{padding:"10px 18px",borderRadius:"12px",border:"1px solid red",color:"red",cursor:"pointer"},
  field:{marginBottom:"20px",display:"flex",flexDirection:"column"},
  input:{padding:"12px",borderRadius:"10px",border:"1px solid #ddd"},
  textarea:{padding:"12px",borderRadius:"10px",border:"1px solid #ddd",minHeight:"100px"},
  grid:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"20px"},
  primaryBtn:{padding:"14px",borderRadius:"14px",border:"none",background:"#4f46e5",color:"#fff",cursor:"pointer"}
};