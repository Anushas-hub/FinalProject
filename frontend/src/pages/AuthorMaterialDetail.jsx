import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AuthorMaterialDetail() {
  const { materialId } = useParams();
  const navigate = useNavigate();

  const loggedInUser = localStorage.getItem("user");

  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  // ── Fetch material detail ───────────────────────────────────────
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/author/public-materials/${materialId}/`)
      .then((res) => res.json())
      .then((data) => {
        setMaterial(data);
        setFollowerCount(data.follower_count || 0);
        setLoading(false);

        // check follow status
        if (loggedInUser && data.author_username) {
          fetch(
            `http://127.0.0.1:8000/api/follow-status/${loggedInUser}/${data.author_username}/`
          )
            .then((r) => r.json())
            .then((d) => setIsFollowing(d.following))
            .catch(() => {});
        }
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [materialId, loggedInUser]);

  // ── Follow / Unfollow ───────────────────────────────────────────
  const handleFollowToggle = () => {
    if (!loggedInUser) {
      navigate("/login", {
        state: { message: "Please login to follow authors." },
      });
      return;
    }

    setFollowLoading(true);

    const endpoint = isFollowing
      ? "http://127.0.0.1:8000/api/unfollow/"
      : "http://127.0.0.1:8000/api/follow/";

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        follower: loggedInUser,
        author: material.author_username,
      }),
    })
      .then((r) => r.json())
      .then(() => {
        setIsFollowing((prev) => !prev);
        setFollowerCount((prev) => (isFollowing ? prev - 1 : prev + 1));
        setFollowLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setFollowLoading(false);
      });
  };

  // ── Loading ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.centerMsg}>Loading material...</div>
      </>
    );
  }

  // ── Not found ───────────────────────────────────────────────────
  if (!material || material.error) {
    return (
      <>
        <Navbar />
        <div style={styles.centerMsg}>Material not found.</div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div style={styles.page}>

        {/* Back button */}
        <button style={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div style={styles.wrapper}>

          {/* ── LEFT: Material content ── */}
          <div style={styles.contentBox}>

            {/* Subject + course tags */}
            <div style={styles.tagRow}>
              <span style={styles.tag}>📚 {material.subject}</span>
              <span style={styles.tag}>{material.course?.toUpperCase()}</span>
              <span style={styles.tag}>{material.semester?.toUpperCase()}</span>
            </div>

            <h1 style={styles.title}>{material.title}</h1>

            {material.description && (
              <p style={styles.description}>{material.description}</p>
            )}

            <p style={styles.date}>
              Published:{" "}
              {new Date(material.created_at).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            {/* Text content */}
            {material.content && (
              <div style={styles.contentSection}>
                <h3 style={styles.sectionHeading}>Content</h3>
                <div style={styles.contentText}>{material.content}</div>
              </div>
            )}

            {/* PDF Viewer */}
            {material.file && (
              <div style={styles.pdfSection}>
                <h3 style={styles.sectionHeading}>PDF Material</h3>
                <iframe
                  src={material.file}
                  style={styles.pdfFrame}
                  title="Study Material PDF"
                />
                <a
                  href={material.file}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.downloadLink}
                >
                  Open PDF in new tab ↗
                </a>
              </div>
            )}

            {!material.content && !material.file && (
              <div style={styles.emptyContent}>
                No content available for this material.
              </div>
            )}

          </div>

          {/* ── RIGHT: Author info card ── */}
          <div style={styles.authorCard}>

            <h3 style={styles.authorCardTitle}>About the Author</h3>

            {/* Avatar */}
            <div style={styles.avatarWrapper}>
              {material.author_image ? (
                <img
                  src={material.author_image}
                  alt="author"
                  style={styles.avatarImg}
                />
              ) : (
                <div style={styles.avatarFallback}>
                  {material.author_name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <h2 style={styles.authorName}>{material.author_name}</h2>
            <p style={styles.authorUsername}>@{material.author_username}</p>

            {/* Follower count */}
            <div style={styles.followerRow}>
              <span style={styles.followerCount}>{followerCount}</span>
              <span style={styles.followerLabel}>Followers</span>
            </div>

            {/* Follow button */}
            {loggedInUser && loggedInUser !== material.author_username && (
              <button
                style={{
                  ...styles.followBtn,
                  background: isFollowing ? "#e0e7ff" : "#4f46e5",
                  color: isFollowing ? "#4f46e5" : "#fff",
                  opacity: followLoading ? 0.7 : 1,
                }}
                onClick={handleFollowToggle}
                disabled={followLoading}
              >
                {followLoading
                  ? "..."
                  : isFollowing
                  ? "Following ✓"
                  : "+ Follow Author"}
              </button>
            )}

            {/* Not logged in nudge */}
            {!loggedInUser && (
              <button
                style={styles.followBtn}
                onClick={() =>
                  navigate("/login", {
                    state: { message: "Please login to follow authors." },
                  })
                }
              >
                Login to Follow
              </button>
            )}

            {/* ✅ FIXED: "More by this Author" — ab sirf us author ki materials dikhegi */}
            <button
              style={styles.moreBtn}
              onClick={() =>
                navigate(
                  `/author-materials?author=${material.author_username}`
                )
              }
            >
              More by this Author
            </button>

          </div>

        </div>

      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#f0f9ff,#f5f3ff,#ecfdf5)",
    padding: "30px 40px",
  },
  centerMsg: {
    textAlign: "center",
    marginTop: "80px",
    fontSize: "16px",
    color: "#64748b",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#4f46e5",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginBottom: "20px",
    padding: "0",
  },
  wrapper: {
    display: "flex",
    gap: "30px",
    alignItems: "flex-start",
    maxWidth: "1100px",
    margin: "0 auto",
  },
  contentBox: {
    flex: 1,
    background: "#fff",
    borderRadius: "16px",
    padding: "35px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
  },
  tagRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "14px",
  },
  tag: {
    background: "#e0e7ff",
    color: "#3730a3",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },
  title: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "10px",
  },
  description: {
    fontSize: "15px",
    color: "#475569",
    lineHeight: "1.7",
    marginBottom: "10px",
  },
  date: {
    fontSize: "12px",
    color: "#94a3b8",
    marginBottom: "20px",
  },
  sectionHeading: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "12px",
    borderBottom: "2px solid #e0e7ff",
    paddingBottom: "6px",
  },
  contentSection: {
    marginBottom: "30px",
  },
  contentText: {
    fontSize: "15px",
    color: "#334155",
    lineHeight: "1.8",
    whiteSpace: "pre-wrap",
  },
  pdfSection: {
    marginTop: "20px",
  },
  pdfFrame: {
    width: "100%",
    height: "520px",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    marginBottom: "10px",
  },
  downloadLink: {
    color: "#4f46e5",
    fontSize: "13px",
    fontWeight: "600",
    textDecoration: "none",
  },
  emptyContent: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "14px",
    padding: "40px 0",
  },

  // Author card
  authorCard: {
    width: "270px",
    background: "#fff",
    borderRadius: "16px",
    padding: "28px 20px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    position: "sticky",
    top: "20px",
  },
  authorCardTitle: {
    fontSize: "13px",
    color: "#94a3b8",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    alignSelf: "flex-start",
  },
  avatarWrapper: {
    marginTop: "6px",
  },
  avatarImg: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  avatarFallback: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#4f46e5,#06b6d4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "30px",
    fontWeight: "700",
  },
  authorName: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0",
    textAlign: "center",
  },
  authorUsername: {
    fontSize: "13px",
    color: "#64748b",
    margin: "0",
  },
  followerRow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "#f8fafc",
    padding: "10px 30px",
    borderRadius: "12px",
    width: "100%",
  },
  followerCount: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#4f46e5",
  },
  followerLabel: {
    fontSize: "12px",
    color: "#64748b",
  },
  followBtn: {
    width: "100%",
    padding: "12px",
    borderRadius: "25px",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    textAlign: "center",
  },
  moreBtn: {
    width: "100%",
    padding: "11px",
    borderRadius: "25px",
    border: "2px solid #e0e7ff",
    background: "#fff",
    color: "#4f46e5",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
};