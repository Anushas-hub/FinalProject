import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AuthorMaterialsPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const loggedInUser = localStorage.getItem("user");

  // get author username from URL: /author-materials?author=username
  const params = new URLSearchParams(location.search);
  const authorUsername = params.get("author") || "";

  const [materials, setMaterials] = useState([]);
  const [authorInfo, setAuthorInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ── Fetch this author's materials ───────────────────────────────
  useEffect(() => {
    if (!authorUsername) {
      setLoading(false);
      return;
    }

    setLoading(true);

    fetch(
      `http://127.0.0.1:8000/api/author/public-materials/?author=${authorUsername}`
    )
      .then((res) => res.json())
      .then((data) => {
        setMaterials(data);

        // pick author info from first material
        if (data.length > 0) {
          setAuthorInfo({
            name: data[0].author_name,
            username: data[0].author_username,
            image: data[0].author_image,
            follower_count: data[0].follower_count,
          });
          setFollowerCount(data[0].follower_count || 0);
        }

        setLoading(false);

        // check follow status
        if (loggedInUser && authorUsername) {
          fetch(
            `http://127.0.0.1:8000/api/follow-status/${loggedInUser}/${authorUsername}/`
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
  }, [authorUsername, loggedInUser]);

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
        author: authorUsername,
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

  // ── Client-side search filter ───────────────────────────────────
  const filteredMaterials = materials.filter((m) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      m.title?.toLowerCase().includes(term) ||
      m.subject?.toLowerCase().includes(term) ||
      m.description?.toLowerCase().includes(term)
    );
  });

  // ── No author provided ──────────────────────────────────────────
  if (!authorUsername) {
    return (
      <>
        <Navbar />
        <div style={styles.centerMsg}>No author specified.</div>
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

        {/* ── AUTHOR HEADER CARD ── */}
        {authorInfo && (
          <div style={styles.authorHeader}>

            {/* Avatar */}
            {authorInfo.image ? (
              <img
                src={authorInfo.image}
                alt="author"
                style={styles.avatarImg}
              />
            ) : (
              <div style={styles.avatarFallback}>
                {authorInfo.name?.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Info */}
            <div style={styles.authorInfo}>
              <h1 style={styles.authorName}>{authorInfo.name}</h1>
              <p style={styles.authorUsername}>@{authorInfo.username}</p>
              <div style={styles.followerPill}>
                👥 {followerCount} Followers
              </div>
            </div>

            {/* Follow button */}
            {loggedInUser && loggedInUser !== authorUsername && (
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

          </div>
        )}

        {/* ── PAGE TITLE ── */}
        <div style={styles.titleRow}>
          <h2 style={styles.pageTitle}>
            Materials by{" "}
            <span style={{ color: "#4f46e5" }}>
              {authorInfo?.name || authorUsername}
            </span>
          </h2>
          <span style={styles.countBadge}>
            {filteredMaterials.length} Material{filteredMaterials.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* ── SEARCH BAR ── */}
        <div style={styles.searchWrapper}>
          <input
            type="text"
            placeholder="Search materials by title, subject..."
            style={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* ── LOADING ── */}
        {loading && (
          <div style={styles.centerMsg}>Loading materials...</div>
        )}

        {/* ── EMPTY ── */}
        {!loading && filteredMaterials.length === 0 && (
          <div style={styles.emptyBox}>
            <p style={styles.emptyText}>No materials found.</p>
            <p style={styles.emptySubText}>
              {searchTerm
                ? "Try a different search term."
                : "This author hasn't uploaded any materials yet."}
            </p>
          </div>
        )}

        {/* ── MATERIALS GRID ── */}
        {!loading && filteredMaterials.length > 0 && (
          <div style={styles.grid}>
            {filteredMaterials.map((material) => (
              <div key={material.id} style={styles.card}>

                {/* Tags */}
                <div style={styles.tagRow}>
                  <span style={styles.tag}>📚 {material.subject}</span>
                  {material.course && (
                    <span style={styles.tag}>{material.course.toUpperCase()}</span>
                  )}
                  {material.semester && (
                    <span style={styles.tag}>{material.semester.toUpperCase()}</span>
                  )}
                </div>

                {/* Title */}
                <h3 style={styles.cardTitle}>{material.title}</h3>

                {/* Description */}
                {material.description && (
                  <p style={styles.cardDesc}>{material.description}</p>
                )}

                {/* Date */}
                <p style={styles.cardDate}>
                  {new Date(material.created_at).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>

                {/* View button */}
                <button
                  style={styles.viewBtn}
                  onClick={() => navigate(`/author-material/${material.id}`)}
                >
                  View Material →
                </button>

              </div>
            ))}
          </div>
        )}

      </div>
    </>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#f0f9ff,#f5f3ff,#ecfdf5)",
    padding: "30px 40px",
    maxWidth: "1200px",
    margin: "0 auto",
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
    marginBottom: "24px",
    padding: "0",
  },

  // Author header
  authorHeader: {
    background: "#fff",
    borderRadius: "20px",
    padding: "28px 32px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    display: "flex",
    alignItems: "center",
    gap: "24px",
    marginBottom: "30px",
    flexWrap: "wrap",
  },
  avatarImg: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
  },
  avatarFallback: {
    width: "90px",
    height: "90px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#4f46e5,#06b6d4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: "36px",
    fontWeight: "700",
    flexShrink: 0,
  },
  authorInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  authorName: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  authorUsername: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },
  followerPill: {
    display: "inline-block",
    background: "#e0e7ff",
    color: "#4f46e5",
    padding: "5px 14px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "600",
    marginTop: "6px",
    width: "fit-content",
  },
  followBtn: {
    padding: "12px 28px",
    borderRadius: "25px",
    border: "none",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
    flexShrink: 0,
  },

  // Title row
  titleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "10px",
  },
  pageTitle: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  countBadge: {
    background: "#e0e7ff",
    color: "#4f46e5",
    padding: "6px 16px",
    borderRadius: "20px",
    fontSize: "13px",
    fontWeight: "700",
  },

  // Search
  searchWrapper: {
    marginBottom: "28px",
  },
  searchInput: {
    width: "100%",
    padding: "14px 22px",
    borderRadius: "50px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    fontSize: "14px",
    outline: "none",
    boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
    boxSizing: "border-box",
  },

  // Empty state
  emptyBox: {
    textAlign: "center",
    padding: "70px 20px",
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.04)",
  },
  emptyText: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#1e293b",
    margin: "0 0 8px 0",
  },
  emptySubText: {
    fontSize: "14px",
    color: "#64748b",
    margin: 0,
  },

  // Grid
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "24px",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  tagRow: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    marginBottom: "4px",
  },
  tag: {
    background: "#e0e7ff",
    color: "#3730a3",
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0",
    lineHeight: "1.4",
  },
  cardDesc: {
    fontSize: "13px",
    color: "#64748b",
    lineHeight: "1.5",
    margin: "0",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  cardDate: {
    fontSize: "12px",
    color: "#94a3b8",
    margin: "0",
  },
  viewBtn: {
    marginTop: "8px",
    padding: "10px 0",
    borderRadius: "20px",
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
    transition: "background 0.2s ease",
  },
};