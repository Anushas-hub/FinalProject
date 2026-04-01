import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";

// ─── AUTO THUMBNAIL GENERATOR ───
function AutoThumbnail({ title }) {
  const gradients = [
    ["#4f46e5", "#7c3aed"],
    ["#0ea5e9", "#6366f1"],
    ["#10b981", "#059669"],
    ["#f59e0b", "#ef4444"],
    ["#8b5cf6", "#ec4899"],
    ["#06b6d4", "#3b82f6"],
    ["#f97316", "#ef4444"],
    ["#14b8a6", "#6366f1"],
  ];

  // Pick gradient based on title
  const idx = title.charCodeAt(0) % gradients.length;
  const [c1, c2] = gradients[idx];

  // Initials — max 2 words
  const words = title.trim().split(" ");
  const initials = words.length >= 2
    ? words[0][0].toUpperCase() + words[1][0].toUpperCase()
    : words[0].slice(0, 2).toUpperCase();

  // Short title (max 22 chars)
  const shortTitle = title.length > 22 ? title.slice(0, 22) + "…" : title;

  return (
    <div style={{
      width: "100%", height: "180px",
      background: `linear-gradient(135deg, ${c1}, ${c2})`,
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      position: "relative", overflow: "hidden",
    }}>
      {/* Decorative circles */}
      <div style={{
        position: "absolute", width: "140px", height: "140px",
        borderRadius: "50%", background: "rgba(255,255,255,0.06)",
        top: "-30px", right: "-30px",
      }} />
      <div style={{
        position: "absolute", width: "100px", height: "100px",
        borderRadius: "50%", background: "rgba(255,255,255,0.06)",
        bottom: "-20px", left: "-20px",
      }} />

      {/* Initials circle */}
      <div style={{
        width: "64px", height: "64px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.2)",
        border: "2px solid rgba(255,255,255,0.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "22px", fontWeight: "800",
        color: "#fff", marginBottom: "10px",
        letterSpacing: "1px",
      }}>
        {initials}
      </div>

      {/* Course short title */}
      <p style={{
        color: "#fff", fontSize: "13px",
        fontWeight: "600", textAlign: "center",
        padding: "0 16px", margin: 0,
        opacity: 0.9, lineHeight: "1.4",
      }}>
        {shortTitle}
      </p>

      {/* SmartStudy badge */}
      <div style={{
        position: "absolute", bottom: "8px", right: "10px",
        background: "rgba(255,255,255,0.15)",
        borderRadius: "20px", padding: "2px 8px",
        fontSize: "10px", color: "#fff",
        fontWeight: "700", letterSpacing: "0.5px",
      }}>
        SmartStudy
      </div>
    </div>
  );
}

export default function CertificationResults() {
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const user = localStorage.getItem("user");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/courses/")
      .then(res => res.json())
      .then(data => {
        setCourses(data);
        const params = new URLSearchParams(location.search);
        const search = params.get("search") || "";
        if (search) {
          setFiltered(data.filter(c =>
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.description.toLowerCase().includes(search.toLowerCase())
          ));
        } else {
          setFiltered(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [location.search]);

  const levelColor = (level) => {
    if (level === "beginner") return { bg: "#dcfce7", color: "#166534" };
    if (level === "intermediate") return { bg: "#fef9c3", color: "#854d0e" };
    return { bg: "#fee2e2", color: "#991b1b" };
  };

  return (
    <div style={styles.page}>
      <Navbar />

      {/* HERO */}
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <p style={styles.heroTag}>SmartStudy Certifications</p>
          <h1 style={styles.heroTitle}>Advance Your Career with Certified Courses</h1>
          <p style={styles.heroSub}>
            Industry-aligned certification programs designed for BSc IT & BSc CS students
          </p>
          <div style={styles.statsRow}>
            <div style={styles.statBox}>
              <span style={styles.statNum}>{courses.length}+</span>
              <span style={styles.statLabel}>Courses</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statBox}>
              <span style={styles.statNum}>100%</span>
              <span style={styles.statLabel}>Free</span>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statBox}>
              <span style={styles.statNum}>Verified</span>
              <span style={styles.statLabel}>Certificate</span>
            </div>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={styles.body}>
        <div style={styles.sectionHead}>
          <h2 style={styles.sectionTitle}>All Certification Courses</h2>
          <p style={styles.sectionSub}>
            {filtered.length} course{filtered.length !== 1 ? "s" : ""} available
          </p>
        </div>

        {loading && <p style={styles.msg}>Loading courses...</p>}
        {!loading && filtered.length === 0 && (
          <p style={styles.msg}>No courses found.</p>
        )}

        {/* COURSE GRID */}
        <div style={styles.grid}>
          {filtered.map(course => {
            const lc = levelColor(course.level);
            const skills = course.skills
              ? course.skills.split(",").map(s => s.trim()).filter(Boolean)
              : [];

            return (
              <div key={course.id} style={styles.card}>

                {/* ── THUMBNAIL — auto-generated if no upload ── */}
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    style={styles.thumb}
                  />
                ) : (
                  <AutoThumbnail title={course.title} />
                )}

                <div style={styles.cardBody}>
                  {/* Level + Duration */}
                  <div style={styles.metaRow}>
                    <span style={{
                      ...styles.levelBadge,
                      background: lc.bg,
                      color: lc.color,
                    }}>
                      {course.level?.charAt(0).toUpperCase() + course.level?.slice(1)}
                    </span>
                    <span style={styles.duration}>⏱ {course.duration}</span>
                  </div>

                  {/* Title */}
                  <h3 style={styles.cardTitle}>{course.title}</h3>

                  {/* Description */}
                  <p style={styles.cardDesc}>
                    {course.description?.length > 100
                      ? course.description.slice(0, 100) + "..."
                      : course.description}
                  </p>

                  {/* Stats */}
                  <div style={styles.courseStats}>
                    <span style={styles.stat}>
                      📚 {course.total_modules || 0} Modules
                    </span>
                    <span style={styles.stat}>
                      📝 {course.total_quizzes || 0} Quizzes
                    </span>
                    <span style={styles.stat}>🏆 Certificate</span>
                  </div>

                  {/* Skills */}
                  {skills.length > 0 && (
                    <div style={styles.skillsRow}>
                      {skills.slice(0, 3).map((skill, i) => (
                        <span key={i} style={styles.skillTag}>{skill}</span>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <button
                    style={styles.startBtn}
                    onClick={() => {
                      if (!user) {
                        navigate("/login", {
                          state: { message: "Please login to start a certification course." }
                        });
                      } else {
                        navigate(`/certification/${course.id}`);
                      }
                    }}
                  >
                    Start Learning →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#f0f9ff,#f5f3ff,#ecfdf5)",
  },
  hero: {
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    color: "#fff",
    padding: "60px 20px",
    textAlign: "center",
  },
  heroInner: { maxWidth: "700px", margin: "0 auto" },
  heroTag: {
    fontSize: "13px", fontWeight: "700",
    letterSpacing: "2px", textTransform: "uppercase",
    color: "#c4b5fd", marginBottom: "12px",
  },
  heroTitle: {
    fontSize: "36px", fontWeight: "800",
    margin: "0 0 14px 0", lineHeight: "1.2",
  },
  heroSub: {
    fontSize: "16px", opacity: 0.85,
    marginBottom: "30px", lineHeight: "1.6",
  },
  statsRow: {
    display: "flex", justifyContent: "center",
    alignItems: "center",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "16px", padding: "16px 30px",
  },
  statBox: { textAlign: "center", padding: "0 28px" },
  statNum: { display: "block", fontSize: "22px", fontWeight: "800" },
  statLabel: { fontSize: "12px", opacity: 0.8 },
  statDivider: {
    width: "1px", height: "40px",
    background: "rgba(255,255,255,0.3)",
  },
  body: { maxWidth: "1100px", margin: "0 auto", padding: "50px 20px" },
  sectionHead: { marginBottom: "30px" },
  sectionTitle: {
    fontSize: "24px", fontWeight: "700",
    color: "#1e293b", margin: "0 0 6px 0",
  },
  sectionSub: { fontSize: "14px", color: "#64748b", margin: 0 },
  msg: {
    textAlign: "center", color: "#64748b",
    fontSize: "15px", padding: "40px 0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "28px",
  },
  card: {
    background: "#fff", borderRadius: "18px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.07)",
    overflow: "hidden", cursor: "pointer",
  },
  thumb: { width: "100%", height: "180px", objectFit: "cover" },
  cardBody: { padding: "22px" },
  metaRow: {
    display: "flex", alignItems: "center",
    gap: "10px", marginBottom: "10px",
  },
  levelBadge: {
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "11px", fontWeight: "700",
  },
  duration: { fontSize: "12px", color: "#64748b" },
  cardTitle: {
    fontSize: "17px", fontWeight: "700",
    color: "#1e293b", margin: "0 0 8px 0", lineHeight: "1.4",
  },
  cardDesc: {
    fontSize: "13px", color: "#64748b",
    lineHeight: "1.6", margin: "0 0 14px 0",
  },
  courseStats: {
    display: "flex", gap: "12px",
    flexWrap: "wrap", marginBottom: "12px",
  },
  stat: { fontSize: "12px", color: "#475569", fontWeight: "500" },
  skillsRow: {
    display: "flex", gap: "6px",
    flexWrap: "wrap", marginBottom: "16px",
  },
  skillTag: {
    background: "#f1f5f9", color: "#4f46e5",
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "11px", fontWeight: "600",
  },
  startBtn: {
    width: "100%", padding: "12px",
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    color: "#fff", border: "none",
    borderRadius: "10px", fontSize: "14px",
    fontWeight: "700", cursor: "pointer",
  },
};