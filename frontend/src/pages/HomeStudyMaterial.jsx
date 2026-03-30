import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./HomeStudyMaterial.css";

function HomeStudyMaterial() {

  const navigate = useNavigate();
  const location = useLocation();

  const loggedInUser = localStorage.getItem("user");

  // ── tabs: "latest" | "mostViewed" (author tab removed — materials show in same grid)
  const [activeTab, setActiveTab] = useState("latest");

  // admin/system subjects
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);

  // author materials
  const [authorMaterials, setAuthorMaterials] = useState([]);
  const [filteredAuthorMaterials, setFilteredAuthorMaterials] = useState([]);
  const [followStatus, setFollowStatus] = useState({});

  const [loading, setLoading] = useState(true);
  const [authorLoading, setAuthorLoading] = useState(false);

  // ── Fetch system subjects (unchanged) ──────────────────────────
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/subjects/")
      .then((res) => res.json())
      .then((data) => {
        setTopics(data);

        const params = new URLSearchParams(location.search);
        const search = params.get("search");

        if (search) {
          const filtered = data.filter((s) =>
            s.title.toLowerCase().includes(search.toLowerCase())
          );
          setFilteredTopics(filtered);
        } else {
          setFilteredTopics(data);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching subjects:", err);
        setLoading(false);
      });
  }, [location.search]);

  // ── Fetch author materials on page load ────────────────────────
  useEffect(() => {
    setAuthorLoading(true);

    const params = new URLSearchParams(location.search);
    const search = params.get("search") || "";
    const url = search
      ? `http://127.0.0.1:8000/api/author/public-materials/?search=${search}`
      : "http://127.0.0.1:8000/api/author/public-materials/";

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setAuthorMaterials(data);
        setFilteredAuthorMaterials(data);
        setAuthorLoading(false);

        // fetch follow status for each unique author if logged in
        if (loggedInUser) {
          const uniqueAuthors = [...new Set(data.map((m) => m.author_username))];
          uniqueAuthors.forEach((authorUsername) => {
            fetch(
              `http://127.0.0.1:8000/api/follow-status/${loggedInUser}/${authorUsername}/`
            )
              .then((r) => r.json())
              .then((d) => {
                setFollowStatus((prev) => ({
                  ...prev,
                  [authorUsername]: d.following,
                }));
              })
              .catch(() => {});
          });
        }
      })
      .catch((err) => {
        console.error("Error fetching author materials:", err);
        setAuthorLoading(false);
      });
  }, [location.search, loggedInUser]);

  // ── Follow / Unfollow ───────────────────────────────────────────
  const handleFollowToggle = (authorUsername) => {
    if (!loggedInUser) {
      navigate("/login", {
        state: { message: "Please login to follow authors." },
      });
      return;
    }

    const isFollowing = followStatus[authorUsername];
    const endpoint = isFollowing
      ? "http://127.0.0.1:8000/api/unfollow/"
      : "http://127.0.0.1:8000/api/follow/";

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        follower: loggedInUser,
        author: authorUsername,
      }),
    })
      .then((r) => r.json())
      .then(() => {
        setFollowStatus((prev) => ({
          ...prev,
          [authorUsername]: !isFollowing,
        }));

        // update follower_count in list
        setFilteredAuthorMaterials((prev) =>
          prev.map((m) => {
            if (m.author_username === authorUsername) {
              return {
                ...m,
                follower_count: isFollowing
                  ? m.follower_count - 1
                  : m.follower_count + 1,
              };
            }
            return m;
          })
        );
      })
      .catch((err) => console.error(err));
  };

  // ── Open author material detail ─────────────────────────────────
  const handleAuthorMaterialClick = (materialId) => {
    navigate(`/author-material/${materialId}`);
  };

  return (
    <>
      <Navbar />

      <div className="study-container">

        <div className="study-hero">
          <h1>Study Materials</h1>
          <p>Easily get access to easy and verified study content</p>
        </div>

        {/* ── TABS (only Latest & Most Viewed — no author tab) ── */}
        <div className="tabs">
          <button
            className={activeTab === "latest" ? "active" : ""}
            onClick={() => setActiveTab("latest")}
          >
            Latest
          </button>

          <button
            className={activeTab === "mostViewed" ? "active" : ""}
            onClick={() => setActiveTab("mostViewed")}
          >
            Most Viewed
          </button>
        </div>

        {/* ── LOADING ── */}
        {loading && (
          <div style={styles.centerMsg}>Loading subjects...</div>
        )}

        {/* ── SINGLE GRID: system subjects + author materials together ── */}
        {!loading && (
          <>
            {filteredTopics.length === 0 && filteredAuthorMaterials.length === 0 && (
              <div style={styles.centerMsg}>No study material found.</div>
            )}

            <div className="topics-grid">

              {/* ── Admin/system subject cards (exactly same as before) ── */}
              {filteredTopics.map((topic) => (
                <div className="topic-card" key={`subject-${topic.id}`}>
                  <h2>{topic.title}</h2>
                  <p>{topic.description}</p>
                  <button
                    className="explore-btn"
                    onClick={() => navigate(`/study-material/${topic.id}`)}
                  >
                    Explore
                  </button>
                </div>
              ))}

              {/* ── Author material cards in same grid ── */}
              {!authorLoading && filteredAuthorMaterials.map((material) => (
                <div className="topic-card" key={`author-${material.id}`} style={styles.authorCard}>

                  {/* Author info row */}
                  <div style={styles.authorRow}>
                    {material.author_image ? (
                      <img
                        src={material.author_image}
                        alt="author"
                        style={styles.authorAvatar}
                      />
                    ) : (
                      <div style={styles.authorAvatarFallback}>
                        {material.author_name?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div style={{ flex: 1 }}>
                      <p style={styles.uploadedBy}>Uploaded by</p>
                      <p style={styles.authorName}>{material.author_name}</p>
                    </div>

                    <div style={styles.followerBadge}>
                      {material.follower_count}
                    </div>
                  </div>

                  {/* Material info */}
                  <h2 style={{ marginTop: "10px" }}>{material.title}</h2>
                  <p style={styles.subjectTag}>
                    📚 {material.subject} &nbsp;|&nbsp; {material.course?.toUpperCase()} &nbsp;|&nbsp; {material.semester?.toUpperCase()}
                  </p>
                  {material.description && (
                    <p style={styles.descText}>{material.description}</p>
                  )}

                  {/* Action buttons */}
                  <div style={styles.btnRow}>
                    <button
                      className="explore-btn"
                      onClick={() => handleAuthorMaterialClick(material.id)}
                    >
                      View Material
                    </button>

                    {/* Follow button — only if logged in and not the author themselves */}
                    {loggedInUser && loggedInUser !== material.author_username && (
                      <button
                        style={{
                          ...styles.followBtn,
                          background: followStatus[material.author_username]
                            ? "#e0e7ff"
                            : "#4f46e5",
                          color: followStatus[material.author_username]
                            ? "#4f46e5"
                            : "#fff",
                        }}
                        onClick={() =>
                          handleFollowToggle(material.author_username)
                        }
                      >
                        {followStatus[material.author_username]
                          ? "Following ✓"
                          : "+ Follow"}
                      </button>
                    )}
                  </div>

                </div>
              ))}

            </div>
          </>
        )}

      </div>
    </>
  );
}

const styles = {
  centerMsg: {
    textAlign: "center",
    marginTop: "40px",
    color: "#64748b",
    fontSize: "15px",
  },
  authorCard: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  authorRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 0",
    borderBottom: "1px solid #f1f5f9",
    marginBottom: "6px",
  },
  authorAvatar: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  authorAvatarFallback: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#4f46e5,#06b6d4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "700",
    fontSize: "16px",
    flexShrink: 0,
  },
  uploadedBy: {
    fontSize: "11px",
    color: "#94a3b8",
    margin: 0,
  },
  authorName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1e293b",
    margin: 0,
  },
  followerBadge: {
    fontSize: "12px",
    color: "#64748b",
    background: "#f1f5f9",
    padding: "4px 10px",
    borderRadius: "20px",
    whiteSpace: "nowrap",
  },
  subjectTag: {
    fontSize: "12px",
    color: "#4f46e5",
    fontWeight: "600",
    margin: "4px 0",
  },
  descText: {
    fontSize: "13px",
    color: "#64748b",
    margin: "4px 0",
    lineHeight: "1.5",
  },
  btnRow: {
    display: "flex",
    gap: "10px",
    marginTop: "12px",
    flexWrap: "wrap",
  },
  followBtn: {
    padding: "9px 18px",
    borderRadius: "20px",
    border: "none",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
};

export default HomeStudyMaterial;