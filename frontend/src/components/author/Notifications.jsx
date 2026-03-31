import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Notifications() {
  const navigate = useNavigate();
  const user = localStorage.getItem("user");

  const [activeTab, setActiveTab] = useState("qa"); // "qa" | "peer"

  // ── Q&A state ──────────────────────────────────────────────────
  const [qaData, setQaData] = useState({ unread_count: 0, questions: [] });
  const [qaLoading, setQaLoading] = useState(true);

  // ── Peer Notes state ───────────────────────────────────────────
  const [peerData, setPeerData] = useState({ unread_count: 0, comments: [] });
  const [peerLoading, setPeerLoading] = useState(true);

  // ── Reply state ────────────────────────────────────────────────
  const [replyingTo, setReplyingTo] = useState(null); // question id
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  // ── Fetch Q&A notifications ────────────────────────────────────
  const fetchQA = () => {
    setQaLoading(true);
    fetch(`http://127.0.0.1:8000/api/author/qa-notifications/${user}/`)
      .then((r) => r.json())
      .then((d) => { setQaData(d); setQaLoading(false); })
      .catch(() => setQaLoading(false));
  };

  // ── Fetch Peer notifications ───────────────────────────────────
  const fetchPeer = () => {
    setPeerLoading(true);
    fetch(`http://127.0.0.1:8000/api/author/peer-notifications/${user}/`)
      .then((r) => r.json())
      .then((d) => { setPeerData(d); setPeerLoading(false); })
      .catch(() => setPeerLoading(false));
  };

  useEffect(() => {
    if (!user) return;
    fetchQA();
    fetchPeer();
  }, [user]);

  // ── Mark Q&A as read ───────────────────────────────────────────
  const markQARead = () => {
    fetch("http://127.0.0.1:8000/api/author/mark-questions-read/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user }),
    })
      .then(() => fetchQA())
      .catch(() => {});
  };

  // ── Mark Peer as read ──────────────────────────────────────────
  const markPeerRead = () => {
    fetch("http://127.0.0.1:8000/api/author/mark-peer-read/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user }),
    })
      .then(() => fetchPeer())
      .catch(() => {});
  };

  // ── Post answer to a question ──────────────────────────────────
  const handleReply = (questionId) => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    fetch("http://127.0.0.1:8000/api/author/answer-question/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: user,
        question_id: questionId,
        answer: replyText.trim(),
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.answer_id) {
          // update local state optimistically
          setQaData((prev) => ({
            ...prev,
            questions: prev.questions.map((q) =>
              q.id === questionId
                ? {
                    ...q,
                    answers: [
                      ...q.answers,
                      {
                        id: d.answer_id,
                        answer: replyText.trim(),
                        answered_by: user,
                        created_at: new Date().toISOString(),
                      },
                    ],
                    is_read: true,
                  }
                : q
            ),
          }));
          setReplyText("");
          setReplyingTo(null);
        }
        setReplyLoading(false);
      })
      .catch(() => setReplyLoading(false));
  };

  const totalUnread = (qaData.unread_count || 0) + (peerData.unread_count || 0);

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.heading}>Notifications</h2>
          {totalUnread > 0 && (
            <p style={styles.unreadHint}>{totalUnread} unread notification{totalUnread > 1 ? "s" : ""}</p>
          )}
        </div>
        <button style={styles.refreshBtn} onClick={() => { fetchQA(); fetchPeer(); }}>
          ↻ Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={styles.tabRow}>
        <button
          style={activeTab === "qa" ? styles.tabActive : styles.tab}
          onClick={() => { setActiveTab("qa"); if (qaData.unread_count > 0) markQARead(); }}
        >
          💬 Student Questions
          {qaData.unread_count > 0 && (
            <span style={styles.unreadBadge}>{qaData.unread_count}</span>
          )}
        </button>

        <button
          style={activeTab === "peer" ? styles.tabActive : styles.tab}
          onClick={() => { setActiveTab("peer"); if (peerData.unread_count > 0) markPeerRead(); }}
        >
          🤝 Peer Notes
          {peerData.unread_count > 0 && (
            <span style={styles.unreadBadge}>{peerData.unread_count}</span>
          )}
        </button>
      </div>

      {/* ── STUDENT QUESTIONS TAB ── */}
      {activeTab === "qa" && (
        <>
          {qaLoading && <div style={styles.loadingMsg}>Loading questions...</div>}

          {!qaLoading && qaData.questions?.length === 0 && (
            <div style={styles.emptyCard}>
              <p style={styles.emptyTitle}>No student questions yet</p>
              <p style={styles.emptySubtitle}>
                When students ask doubts on your materials, they will appear here.
              </p>
            </div>
          )}

          {!qaLoading && qaData.questions?.map((q) => (
            <div
              key={q.id}
              style={{ ...styles.card, borderLeft: q.is_read ? "4px solid #e2e8f0" : "4px solid #4f46e5" }}
            >
              {/* Card header */}
              <div style={styles.cardHeader}>
                <div style={styles.avatarStudent}>
                  {q.asked_by?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={styles.cardName}>{q.asked_by}</p>
                  <p style={styles.cardMeta}>
                    Asked on{" "}
                    <span
                      style={styles.materialLink}
                      onClick={() => navigate(`/author-material/${q.material_id}`)}
                    >
                      {q.material_title}
                    </span>
                  </p>
                  <p style={styles.cardDate}>
                    {new Date(q.created_at).toLocaleDateString("en-IN", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </p>
                </div>
                {!q.is_read && <span style={styles.newBadge}>New</span>}
              </div>

              {/* Question text */}
              <div style={styles.questionBox}>
                <p style={styles.questionText}>{q.question}</p>
              </div>

              {/* Existing answers */}
              {q.answers?.length > 0 && (
                <div style={styles.answersSection}>
                  <p style={styles.answersLabel}>Your Replies ({q.answers.length})</p>
                  {q.answers.map((a) => (
                    <div key={a.id} style={styles.answerCard}>
                      <div style={styles.answerHeader}>
                        <div style={styles.avatarAuthor}>
                          {a.answered_by?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={styles.answerBy}>
                            {a.answered_by}
                            <span style={styles.authorTag}> · Author</span>
                          </p>
                          <p style={styles.cardDate}>
                            {new Date(a.created_at).toLocaleDateString("en-IN", {
                              year: "numeric", month: "short", day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <p style={styles.answerText}>{a.answer}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Reply section */}
              <div style={{ marginTop: "12px" }}>
                {replyingTo !== q.id ? (
                  <button style={styles.replyBtn} onClick={() => setReplyingTo(q.id)}>
                    ↩ Reply to this question
                  </button>
                ) : (
                  <div style={styles.replyBox}>
                    <textarea
                      style={styles.replyTextarea}
                      placeholder="Write your answer..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                    />
                    <div style={styles.replyActions}>
                      <button
                        style={styles.cancelBtn}
                        onClick={() => { setReplyingTo(null); setReplyText(""); }}
                      >
                        Cancel
                      </button>
                      <button
                        style={{ ...styles.postBtn, opacity: replyLoading || !replyText.trim() ? 0.6 : 1 }}
                        onClick={() => handleReply(q.id)}
                        disabled={replyLoading || !replyText.trim()}
                      >
                        {replyLoading ? "Posting..." : "Post Answer"}
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ))}
        </>
      )}

      {/* ── PEER NOTES TAB ── */}
      {activeTab === "peer" && (
        <>
          {peerLoading && <div style={styles.loadingMsg}>Loading peer notes...</div>}

          {!peerLoading && peerData.comments?.length === 0 && (
            <div style={styles.emptyCard}>
              <p style={styles.emptyTitle}>No peer notes yet</p>
              <p style={styles.emptySubtitle}>
                When fellow authors leave collaboration notes on your materials, they will appear here.
              </p>
            </div>
          )}

          {!peerLoading && peerData.comments?.map((c) => (
            <div
              key={c.id}
              style={{ ...styles.card, borderLeft: c.is_read ? "4px solid #e2e8f0" : "4px solid #06b6d4" }}
            >
              <div style={styles.cardHeader}>
                <div style={{ ...styles.avatarStudent, background: "linear-gradient(135deg,#06b6d4,#4f46e5)" }}>
                  {c.commented_by?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={styles.cardName}>
                    {c.commenter_name || c.commented_by}
                    <span style={{ ...styles.authorTag, marginLeft: "6px" }}>· Author</span>
                  </p>
                  <p style={styles.cardMeta}>
                    Commented on{" "}
                    <span
                      style={styles.materialLink}
                      onClick={() => navigate(`/author-material/${c.material_id}`)}
                    >
                      {c.material_title}
                    </span>
                  </p>
                  <p style={styles.cardDate}>
                    {new Date(c.created_at).toLocaleDateString("en-IN", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </p>
                </div>
                {!c.is_read && <span style={{ ...styles.newBadge, background: "#e0f2fe", color: "#0369a1" }}>New</span>}
              </div>

              <div style={{ ...styles.questionBox, background: "#f0f9ff", border: "1px solid #bae6fd" }}>
                <p style={styles.questionText}>{c.comment}</p>
              </div>

              <button
                style={{ ...styles.replyBtn, color: "#0369a1", borderColor: "#bae6fd" }}
                onClick={() => navigate(`/author-material/${c.material_id}`)}
              >
                View Material & Respond →
              </button>
            </div>
          ))}
        </>
      )}

    </div>
  );
}

const styles = {
  container: { maxWidth: "900px", margin: "0 auto" },

  header: {
    display: "flex", alignItems: "flex-start",
    justifyContent: "space-between", marginBottom: "24px",
  },
  heading: { fontSize: "22px", fontWeight: "700", color: "#1e293b", margin: "0 0 4px 0" },
  unreadHint: { fontSize: "13px", color: "#4f46e5", fontWeight: "600", margin: 0 },
  refreshBtn: {
    padding: "8px 18px", borderRadius: "20px",
    border: "1px solid #e2e8f0", background: "#fff",
    color: "#64748b", fontSize: "13px", fontWeight: "600",
    cursor: "pointer",
  },

  // Tabs
  tabRow: { display: "flex", gap: "10px", marginBottom: "24px" },
  tab: {
    padding: "10px 22px", borderRadius: "25px",
    border: "2px solid #e2e8f0", background: "#fff",
    color: "#64748b", fontSize: "13px", fontWeight: "600",
    cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
  },
  tabActive: {
    padding: "10px 22px", borderRadius: "25px",
    border: "2px solid #4f46e5", background: "#e0e7ff",
    color: "#4f46e5", fontSize: "13px", fontWeight: "700",
    cursor: "pointer", display: "flex", alignItems: "center", gap: "8px",
  },
  unreadBadge: {
    background: "#4f46e5", color: "#fff",
    borderRadius: "50%", minWidth: "20px", height: "20px",
    padding: "0 5px", fontSize: "11px", fontWeight: "700",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
  },

  // Loading
  loadingMsg: { color: "#64748b", fontSize: "14px", padding: "20px 0" },

  // Empty state
  emptyCard: {
    background: "#fff", padding: "50px 30px",
    borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    textAlign: "center",
  },
  emptyTitle: { fontSize: "17px", fontWeight: "600", color: "#1e293b", margin: "0 0 8px 0" },
  emptySubtitle: { fontSize: "13px", color: "#64748b", margin: 0 },

  // Notification card
  card: {
    background: "#fff", borderRadius: "16px",
    padding: "22px", marginBottom: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  },
  cardHeader: { display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "14px" },
  avatarStudent: {
    width: "40px", height: "40px", borderRadius: "50%",
    background: "linear-gradient(135deg,#64748b,#94a3b8)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: "700", fontSize: "15px", flexShrink: 0,
  },
  avatarAuthor: {
    width: "28px", height: "28px", borderRadius: "50%",
    background: "linear-gradient(135deg,#4f46e5,#06b6d4)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: "700", fontSize: "12px", flexShrink: 0,
  },
  cardName: { fontSize: "14px", fontWeight: "700", color: "#1e293b", margin: "0 0 2px 0" },
  cardMeta: { fontSize: "12px", color: "#64748b", margin: "0 0 2px 0" },
  materialLink: { color: "#4f46e5", fontWeight: "600", cursor: "pointer", textDecoration: "underline" },
  cardDate: { fontSize: "11px", color: "#94a3b8", margin: 0 },
  newBadge: {
    background: "#e0e7ff", color: "#4f46e5",
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "11px", fontWeight: "700", flexShrink: 0,
  },

  // Question box
  questionBox: {
    background: "#f8fafc", borderRadius: "10px",
    padding: "14px 16px", border: "1px solid #e2e8f0",
    marginBottom: "12px",
  },
  questionText: { fontSize: "14px", color: "#334155", lineHeight: "1.6", margin: 0 },

  // Answers
  answersSection: { marginBottom: "12px" },
  answersLabel: { fontSize: "12px", fontWeight: "600", color: "#64748b", marginBottom: "8px" },
  answerCard: {
    background: "#f0f9ff", borderRadius: "10px",
    padding: "12px", marginBottom: "8px",
    border: "1px solid #bae6fd",
  },
  answerHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" },
  answerBy: { fontSize: "12px", fontWeight: "600", color: "#4f46e5", margin: 0 },
  authorTag: { fontSize: "11px", color: "#94a3b8", fontWeight: "400" },
  answerText: { fontSize: "13px", color: "#334155", lineHeight: "1.6", margin: 0 },

  // Reply
  replyBtn: {
    background: "none", border: "1px solid #e0e7ff",
    color: "#4f46e5", padding: "7px 16px",
    borderRadius: "20px", fontSize: "12px",
    fontWeight: "600", cursor: "pointer",
  },
  replyBox: {
    background: "#f8fafc", borderRadius: "12px",
    padding: "14px", border: "1px solid #e2e8f0",
  },
  replyTextarea: {
    width: "100%", padding: "10px 14px",
    borderRadius: "10px", border: "1px solid #e2e8f0",
    fontSize: "14px", outline: "none",
    resize: "vertical", fontFamily: "inherit",
    lineHeight: "1.5", boxSizing: "border-box",
  },
  replyActions: {
    display: "flex", gap: "8px",
    justifyContent: "flex-end", marginTop: "10px",
  },
  cancelBtn: {
    padding: "8px 18px", borderRadius: "20px",
    border: "1px solid #e2e8f0", background: "#fff",
    color: "#64748b", fontSize: "13px",
    fontWeight: "600", cursor: "pointer",
  },
  postBtn: {
    padding: "8px 18px", borderRadius: "20px",
    border: "none", background: "#4f46e5",
    color: "#fff", fontSize: "13px",
    fontWeight: "600", cursor: "pointer",
  },
};