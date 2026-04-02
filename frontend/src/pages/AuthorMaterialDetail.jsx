import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AuthorMaterialDetail() {
  const { materialId } = useParams();
  const navigate = useNavigate();

  const loggedInUser = localStorage.getItem("user");
  const loggedInRole = localStorage.getItem("role");

  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  // ── Q&A state ──────────────────────────────────────────────────
  const [questions, setQuestions] = useState([]);
  const [questionText, setQuestionText] = useState("");
  const [questionLoading, setQuestionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("qa");

  // ── Peer Notes state ───────────────────────────────────────────
  const [peerComments, setPeerComments] = useState([]);
  const [peerText, setPeerText] = useState("");
  const [peerLoading, setPeerLoading] = useState(false);

  // ── Linked Quizzes state ───────────────────────────────────────
  const [linkedQuizzes, setLinkedQuizzes] = useState([]);
  const [quizzesLoading, setQuizzesLoading] = useState(false);

  // ── Fetch material ─────────────────────────────────────────────
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/author/public-materials/${materialId}/`)
      .then((res) => res.json())
      .then((data) => {
        setMaterial(data);
        setFollowerCount(data.follower_count || 0);
        setLoading(false);
        if (loggedInUser && data.author_username) {
          fetch(`http://127.0.0.1:8000/api/follow-status/${loggedInUser}/${data.author_username}/`)
            .then((r) => r.json())
            .then((d) => setIsFollowing(d.following))
            .catch(() => {});
        }
      })
      .catch((err) => { console.error(err); setLoading(false); });
  }, [materialId, loggedInUser]);

  // ── Fetch Q&A ──────────────────────────────────────────────────
  useEffect(() => {
    if (!materialId) return;
    fetch(`http://127.0.0.1:8000/api/author/questions/${materialId}/`)
      .then((r) => r.json())
      .then((d) => setQuestions(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [materialId]);

  // ── Fetch Peer Comments ────────────────────────────────────────
  useEffect(() => {
    if (!materialId) return;
    fetch(`http://127.0.0.1:8000/api/author/peer-comments/${materialId}/`)
      .then((r) => r.json())
      .then((d) => setPeerComments(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, [materialId]);

  // ── Fetch Linked Quizzes ───────────────────────────────────────
  useEffect(() => {
    if (!materialId) return;
    setQuizzesLoading(true);
    fetch(`http://127.0.0.1:8000/api/author/material-quizzes/${materialId}/`)
      .then((r) => r.json())
      .then((d) => { setLinkedQuizzes(Array.isArray(d) ? d : []); setQuizzesLoading(false); })
      .catch(() => setQuizzesLoading(false));
  }, [materialId]);

  // ── Follow / Unfollow ──────────────────────────────────────────
  const handleFollowToggle = () => {
    if (!loggedInUser) {
      navigate("/login", { state: { message: "Please login to follow authors." } });
      return;
    }
    setFollowLoading(true);
    const endpoint = isFollowing
      ? "http://127.0.0.1:8000/api/unfollow/"
      : "http://127.0.0.1:8000/api/follow/";
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ follower: loggedInUser, author: material.author_username }),
    })
      .then((r) => r.json())
      .then(() => {
        setIsFollowing((p) => !p);
        setFollowerCount((p) => (isFollowing ? p - 1 : p + 1));
        setFollowLoading(false);
      })
      .catch(() => setFollowLoading(false));
  };

  // ── Post Question ──────────────────────────────────────────────
  const handleAskQuestion = () => {
    if (!loggedInUser) {
      navigate("/login", { state: { message: "Please login to ask questions." } });
      return;
    }
    if (!questionText.trim()) return;
    setQuestionLoading(true);
    fetch("http://127.0.0.1:8000/api/author/ask-question/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: loggedInUser, material_id: materialId, question: questionText.trim() }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.question_id) {
          setQuestions((prev) => [{ id: d.question_id, question: questionText.trim(), asked_by: loggedInUser, created_at: new Date().toISOString(), answers: [] }, ...prev]);
          setQuestionText("");
        }
        setQuestionLoading(false);
      })
      .catch(() => setQuestionLoading(false));
  };

  // ── Post Peer Comment ──────────────────────────────────────────
  const handlePeerComment = () => {
    if (!loggedInUser) {
      navigate("/login", { state: { message: "Please login to add peer notes." } });
      return;
    }
    if (!peerText.trim()) return;
    setPeerLoading(true);
    fetch("http://127.0.0.1:8000/api/author/peer-comment/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: loggedInUser, material_id: materialId, comment: peerText.trim() }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.comment_id) {
          setPeerComments((prev) => [{ id: d.comment_id, comment: peerText.trim(), commented_by: loggedInUser, commenter_name: loggedInUser, commenter_image: null, created_at: new Date().toISOString() }, ...prev]);
          setPeerText("");
        }
        setPeerLoading(false);
      })
      .catch(() => setPeerLoading(false));
  };

  // ── Download PDF handler (fetch + blob — forces download) ──────
  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName || "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
      // fallback: open in new tab
      window.open(fileUrl, "_blank");
    }
  };

  if (loading) return <><Navbar /><div style={styles.centerMsg}>Loading material...</div></>;
  if (!material || material.error) return <><Navbar /><div style={styles.centerMsg}>Material not found.</div></>;

  const isAuthor = loggedInRole === "author";
  const isOwner = loggedInUser === material.author_username;
  const diffColor = {
    easy: { bg: "#dcfce7", text: "#166534" },
    medium: { bg: "#fef9c3", text: "#854d0e" },
    hard: { bg: "#fee2e2", text: "#991b1b" },
  };

  const getPdfName = (url) => {
    if (!url) return "Document.pdf";
    const parts = url.split("/");
    const raw = decodeURIComponent(parts[parts.length - 1]) || "Document.pdf";
    // strip query params if any
    return raw.split("?")[0];
  };

  return (
    <>
      <Navbar />
      <div style={styles.page}>
        <button style={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>

        <div style={styles.wrapper}>

          {/* ── LEFT COL ── */}
          <div style={styles.leftCol}>

            {/* ── MATERIAL CONTENT BOX ── */}
            <div style={styles.contentBox}>
              <div style={styles.tagRow}>
                <span style={styles.tag}> {material.subject}</span>
                <span style={styles.tag}>{material.course?.toUpperCase()}</span>
                <span style={styles.tag}>{material.semester?.toUpperCase()}</span>
              </div>

              <h1 style={styles.title}>{material.title}</h1>
              {material.description && <p style={styles.description}>{material.description}</p>}
              <p style={styles.date}>
                Published: {new Date(material.created_at).toLocaleDateString("en-IN", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </p>

              {/* Text Content */}
              {material.content && (
                <div style={styles.contentSection}>
                  <h3 style={styles.sectionHeading}>Content</h3>
                  <div style={styles.contentText}>{material.content}</div>
                </div>
              )}

              {/* ── PDF CARD — blue, download fixed ── */}
              {material.file && (
                <div style={styles.pdfSection}>
                  <h3 style={styles.sectionHeading}>PDF Material</h3>

                  <div style={styles.pdfCard}>

                    {/* PDF Icon */}
                    <div style={styles.pdfIconBox}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                        <rect width="24" height="24" rx="6" fill="#e0e7ff" />
                        <path
                          d="M6 4h8l4 4v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z"
                          stroke="#4f46e5"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14 4v4h4"
                          stroke="#4f46e5"
                          strokeWidth="1.5"
                          fill="none"
                          strokeLinejoin="round"
                        />
                        <text x="5" y="18" fontSize="5.5" fill="#4f46e5" fontWeight="bold" fontFamily="sans-serif">PDF</text>
                      </svg>
                    </div>

                    {/* File info */}
                    <div style={styles.pdfInfo}>
                      <p style={styles.pdfName}>{getPdfName(material.file)}</p>
                      <p style={styles.pdfMeta}>
                        PDF Document &nbsp;·&nbsp; Uploaded by {material.author_name}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div style={styles.pdfBtns}>
                      {/* View — opens in new tab */}
                      <a
                        href={material.file}
                        target="_blank"
                        rel="noreferrer"
                        style={styles.viewPdfBtn}
                      >
                        View PDF ↗
                      </a>

                      {/* Download — forces file download via blob */}
                      <button
                        style={styles.downloadPdfBtn}
                        onClick={() => handleDownload(material.file, getPdfName(material.file))}
                      >
                        ⬇ Download
                      </button>
                    </div>

                  </div>

                  <p style={styles.pdfHint}>
                     Click <strong>View PDF</strong> to read in a new tab, or <strong>Download</strong> to save it.
                  </p>
                </div>
              )}

              {!material.content && !material.file && (
                <div style={styles.emptyContent}>No content available for this material.</div>
              )}
            </div>

            {/* ── LINKED QUIZZES SECTION ── */}
            {(quizzesLoading || linkedQuizzes.length > 0) && (
              <div style={styles.quizSection}>
                <div style={styles.quizSectionHeader}>
                  <div style={styles.quizSectionLeft}>
                    <div>
                      <h3 style={styles.quizSectionTitle}> Test Your Knowledge</h3>
                      <p style={styles.quizSectionSub}>
                        Quizzes linked to this material — attempt to check your understanding
                      </p>
                    </div>
                  </div>
                  {linkedQuizzes.length > 0 && (
                    <span style={styles.quizCountBadge}>
                      {linkedQuizzes.length} Quiz{linkedQuizzes.length > 1 ? "zes" : ""}
                    </span>
                  )}
                </div>

                {quizzesLoading && <p style={styles.quizLoadingMsg}>Loading quizzes...</p>}

                <div style={styles.quizGrid}>
                  {linkedQuizzes.map((quiz) => {
                    const dc = diffColor[quiz.difficulty] || diffColor.easy;
                    return (
                      <div key={quiz.id} style={styles.quizCard}>
                        <div style={styles.quizCardTop}>
                          <span style={{ ...styles.diffBadge, background: dc.bg, color: dc.text }}>
                            {quiz.difficulty === "easy" ? "" : quiz.difficulty === "medium" ? "" : ""}{" "}
                            {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
                          </span>
                          <span style={styles.timeBadge}>⏱ {quiz.time_limit} min</span>
                        </div>

                        <h4 style={styles.quizCardTitle}>{quiz.title}</h4>
                        {quiz.description && <p style={styles.quizCardDesc}>{quiz.description}</p>}

                        <div style={styles.quizStats}>
                          <div style={styles.quizStat}>
                            <span style={styles.quizStatNum}>{quiz.total_questions}</span>
                            <span style={styles.quizStatLabel}>Questions</span>
                          </div>
                          <div style={styles.quizStatDivider} />
                          <div style={styles.quizStat}>
                            <span style={styles.quizStatNum}>{quiz.total_marks}</span>
                            <span style={styles.quizStatLabel}>Marks</span>
                          </div>
                          <div style={styles.quizStatDivider} />
                          <div style={styles.quizStat}>
                            <span style={styles.quizStatNum}>{quiz.time_limit}m</span>
                            <span style={styles.quizStatLabel}>Time</span>
                          </div>
                        </div>

                        <button
                          style={styles.attemptBtn}
                          onClick={() => {
                            if (!loggedInUser) {
                              navigate("/login", { state: { message: "Please login to attempt quizzes." } });
                              return;
                            }
                            navigate(`/author-quiz/${quiz.id}`);
                          }}
                        >
                          Attempt Quiz →
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── DISCUSS BOX ── */}
            <div style={styles.discussBox}>
              <div style={styles.tabRow}>
                <button style={activeTab === "qa" ? styles.tabActive : styles.tab} onClick={() => setActiveTab("qa")}>
                   Ask & Discuss
                  {questions.length > 0 && <span style={styles.tabBadge}>{questions.length}</span>}
                </button>
                {isAuthor && (
                  <button style={activeTab === "peer" ? styles.tabActive : styles.tab} onClick={() => setActiveTab("peer")}>
                     Peer Notes
                    {peerComments.length > 0 && <span style={styles.tabBadge}>{peerComments.length}</span>}
                  </button>
                )}
              </div>

              {activeTab === "qa" && (
                <div>
                  <p style={styles.boxSubtitle}>Have a doubt? Ask the author directly.</p>
                  {loggedInUser ? (
                    <div style={styles.inputArea}>
                      <div style={styles.inputRow}>
                        <div style={styles.userAvatar}>{loggedInUser.charAt(0).toUpperCase()}</div>
                        <textarea
                          style={styles.textarea}
                          placeholder="Type your question or doubt here..."
                          value={questionText}
                          onChange={(e) => setQuestionText(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <div style={{ textAlign: "right", marginTop: "10px" }}>
                        <button
                          style={{ ...styles.postBtn, opacity: questionLoading || !questionText.trim() ? 0.6 : 1 }}
                          onClick={handleAskQuestion}
                          disabled={questionLoading || !questionText.trim()}
                        >
                          {questionLoading ? "Posting..." : "Post Question →"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={styles.loginNudge}>
                      <button style={styles.loginNudgeBtn} onClick={() => navigate("/login")}>
                        Login to ask a question
                      </button>
                    </div>
                  )}
                  <div style={{ marginTop: "24px" }}>
                    {questions.length === 0 && (
                      <p style={styles.emptyMsg}>No questions yet. Be the first to ask! </p>
                    )}
                    {questions.map((q) => (
                      <QuestionCard
                        key={q.id}
                        q={q}
                        loggedInUser={loggedInUser}
                        isOwner={isOwner}
                        onAnswerPosted={(qId, newAnswer) => {
                          setQuestions((prev) =>
                            prev.map((item) =>
                              item.id === qId
                                ? { ...item, answers: [...item.answers, newAnswer] }
                                : item
                            )
                          );
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "peer" && isAuthor && (
                <div>
                  <p style={styles.boxSubtitle}>
                    Collaborate with fellow authors — share insights, suggestions, or feedback.
                  </p>
                  <div style={styles.inputArea}>
                    <div style={styles.inputRow}>
                      <div style={{ ...styles.userAvatar, background: "linear-gradient(135deg,#06b6d4,#4f46e5)" }}>
                        {loggedInUser?.charAt(0).toUpperCase()}
                      </div>
                      <textarea
                        style={styles.textarea}
                        placeholder="Share a note, suggestion, or collaboration idea..."
                        value={peerText}
                        onChange={(e) => setPeerText(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div style={{ textAlign: "right", marginTop: "10px" }}>
                      <button
                        style={{ ...styles.postBtn, background: "linear-gradient(135deg,#06b6d4,#4f46e5)", opacity: peerLoading || !peerText.trim() ? 0.6 : 1 }}
                        onClick={handlePeerComment}
                        disabled={peerLoading || !peerText.trim()}
                      >
                        {peerLoading ? "Posting..." : "Add Peer Note →"}
                      </button>
                    </div>
                  </div>
                  <div style={{ marginTop: "24px" }}>
                    {peerComments.length === 0 && (
                      <p style={styles.emptyMsg}>No peer notes yet. Start the collaboration! </p>
                    )}
                    {peerComments.map((c) => (
                      <div key={c.id} style={styles.peerCard}>
                        <div style={styles.peerHeaderRow}>
                          {c.commenter_image ? (
                            <img src={c.commenter_image} alt="" style={styles.peerAvatar} />
                          ) : (
                            <div style={{ ...styles.userAvatar, background: "linear-gradient(135deg,#06b6d4,#4f46e5)", width: "34px", height: "34px", fontSize: "13px" }}>
                              {c.commented_by?.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p style={styles.peerName}>
                              {c.commenter_name || c.commented_by}
                              <span style={styles.authorTag}> · Author</span>
                            </p>
                            <p style={styles.peerDate}>
                              {new Date(c.created_at).toLocaleDateString("en-IN", {
                                year: "numeric", month: "short", day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <p style={styles.peerComment}>{c.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* ── RIGHT: Author card ── */}
          <div style={styles.authorCard}>
            <h3 style={styles.authorCardTitle}>About the Author</h3>
            <div style={styles.avatarWrapper}>
              {material.author_image ? (
                <img src={material.author_image} alt="author" style={styles.avatarImg} />
              ) : (
                <div style={styles.avatarFallback}>
                  {material.author_name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <h2 style={styles.authorName}>{material.author_name}</h2>
            <p style={styles.authorUsername}>@{material.author_username}</p>

            <div style={styles.followerRow}>
              <span style={styles.followerCount}>{followerCount}</span>
              <span style={styles.followerLabel}>Followers</span>
            </div>

            {loggedInUser && loggedInUser !== material.author_username && (
              <button
                style={{ ...styles.followBtn, background: isFollowing ? "#e0e7ff" : "#4f46e5", color: isFollowing ? "#4f46e5" : "#fff", opacity: followLoading ? 0.7 : 1 }}
                onClick={handleFollowToggle}
                disabled={followLoading}
              >
                {followLoading ? "..." : isFollowing ? "Following ✓" : "+ Follow Author"}
              </button>
            )}

            {!loggedInUser && (
              <button
                style={styles.followBtn}
                onClick={() => navigate("/login", { state: { message: "Please login to follow authors." } })}
              >
                Login to Follow
              </button>
            )}

            <button
              style={styles.moreBtn}
              onClick={() => navigate(`/author-materials?author=${material.author_username}`)}
            >
              More by this Author
            </button>

            <div style={styles.statBox}>
              <div style={styles.statItem}>
                <span style={styles.statNum}>{linkedQuizzes.length}</span>
                <span style={styles.statLabel}>Quizzes</span>
              </div>
              <div style={styles.statItem}>
                <span style={styles.statNum}>{questions.length}</span>
                <span style={styles.statLabel}>Questions</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}

// ── Question Card ──────────────────────────────────────────────────────────
function QuestionCard({ q, loggedInUser, isOwner, onAnswerPosted }) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  const handleReply = () => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    fetch("http://127.0.0.1:8000/api/author/answer-question/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: loggedInUser, question_id: q.id, answer: replyText.trim() }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.answer_id) {
          onAnswerPosted(q.id, {
            id: d.answer_id,
            answer: replyText.trim(),
            answered_by: loggedInUser,
            created_at: new Date().toISOString(),
          });
          setReplyText("");
          setShowReply(false);
        }
        setReplyLoading(false);
      })
      .catch(() => setReplyLoading(false));
  };

  return (
    <div style={qS.card}>
      <div style={qS.header}>
        <div style={qS.avatar}>{q.asked_by?.charAt(0).toUpperCase()}</div>
        <div style={{ flex: 1 }}>
          <p style={qS.name}>{q.asked_by}</p>
          <p style={qS.date}>
            {new Date(q.created_at).toLocaleDateString("en-IN", {
              year: "numeric", month: "short", day: "numeric",
            })}
          </p>
        </div>
        <span style={qS.badge}>Question</span>
      </div>

      <p style={qS.questionText}>{q.question}</p>

      {q.answers?.length > 0 && (
        <div style={qS.answersBlock}>
          {q.answers.map((a) => (
            <div key={a.id} style={qS.answerCard}>
              <div style={qS.answerHeader}>
                <div style={{ ...qS.avatar, background: "linear-gradient(135deg,#4f46e5,#06b6d4)", width: "28px", height: "28px", fontSize: "12px" }}>
                  {a.answered_by?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p style={qS.answerBy}>{a.answered_by}<span style={qS.authorTag}> · Author</span></p>
                  <p style={qS.date}>
                    {new Date(a.created_at).toLocaleDateString("en-IN", {
                      year: "numeric", month: "short", day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <p style={qS.answerText}>{a.answer}</p>
            </div>
          ))}
        </div>
      )}

      {isOwner && (
        <div style={{ marginTop: "10px" }}>
          {!showReply ? (
            <button style={qS.replyBtn} onClick={() => setShowReply(true)}>↩ Reply</button>
          ) : (
            <div style={qS.replyBox}>
              <textarea
                style={qS.replyTextarea}
                placeholder="Write your answer..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={3}
              />
              <div style={{ display: "flex", gap: "8px", marginTop: "8px", justifyContent: "flex-end" }}>
                <button style={qS.cancelBtn} onClick={() => { setShowReply(false); setReplyText(""); }}>
                  Cancel
                </button>
                <button
                  style={{ ...qS.submitBtn, opacity: replyLoading || !replyText.trim() ? 0.6 : 1 }}
                  onClick={handleReply}
                  disabled={replyLoading || !replyText.trim()}
                >
                  {replyLoading ? "Posting..." : "Post Answer"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const qS = {
  card: { background: "#f8fafc", borderRadius: "14px", padding: "18px", marginBottom: "14px", border: "1px solid #e2e8f0" },
  header: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" },
  avatar: { width: "34px", height: "34px", borderRadius: "50%", background: "linear-gradient(135deg,#64748b,#94a3b8)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: "13px", flexShrink: 0 },
  name: { fontSize: "13px", fontWeight: "600", color: "#1e293b", margin: 0 },
  date: { fontSize: "11px", color: "#94a3b8", margin: 0 },
  badge: { background: "#fef3c7", color: "#92400e", padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: "600" },
  questionText: { fontSize: "14px", color: "#334155", lineHeight: "1.6", margin: "0 0 10px 0" },
  answersBlock: { marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #e2e8f0" },
  answerCard: { background: "#fff", borderRadius: "10px", padding: "12px", marginBottom: "8px", border: "1px solid #e0e7ff" },
  answerHeader: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" },
  answerBy: { fontSize: "12px", fontWeight: "600", color: "#4f46e5", margin: 0 },
  authorTag: { fontSize: "11px", color: "#94a3b8", fontWeight: "400" },
  answerText: { fontSize: "13px", color: "#334155", lineHeight: "1.6", margin: 0 },
  replyBtn: { background: "none", border: "1px solid #e0e7ff", color: "#4f46e5", padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  replyBox: { background: "#fff", borderRadius: "10px", padding: "12px", border: "1px solid #e0e7ff" },
  replyTextarea: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px", outline: "none", resize: "vertical", boxSizing: "border-box", fontFamily: "inherit" },
  cancelBtn: { padding: "7px 16px", borderRadius: "20px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
  submitBtn: { padding: "7px 16px", borderRadius: "20px", border: "none", background: "#4f46e5", color: "#fff", fontSize: "12px", fontWeight: "600", cursor: "pointer" },
};

const styles = {
  page: { minHeight: "100vh", background: "linear-gradient(135deg,#f0f9ff,#f5f3ff,#ecfdf5)", padding: "30px 40px" },
  centerMsg: { textAlign: "center", marginTop: "80px", fontSize: "16px", color: "#64748b" },
  backBtn: { background: "none", border: "none", color: "#4f46e5", fontSize: "15px", fontWeight: "600", cursor: "pointer", marginBottom: "20px", padding: "0" },
  wrapper: { display: "flex", gap: "30px", alignItems: "flex-start", maxWidth: "1100px", margin: "0 auto" },
  leftCol: { flex: 1, display: "flex", flexDirection: "column", gap: "24px" },

  contentBox: { background: "#fff", borderRadius: "16px", padding: "35px", boxShadow: "0 10px 25px rgba(0,0,0,0.06)" },
  tagRow: { display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "14px" },
  tag: { background: "#e0e7ff", color: "#3730a3", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  title: { fontSize: "26px", fontWeight: "700", color: "#1e293b", marginBottom: "10px" },
  description: { fontSize: "15px", color: "#475569", lineHeight: "1.7", marginBottom: "10px" },
  date: { fontSize: "12px", color: "#94a3b8", marginBottom: "20px" },
  sectionHeading: { fontSize: "16px", fontWeight: "700", color: "#1e293b", marginBottom: "12px", borderBottom: "2px solid #e0e7ff", paddingBottom: "6px" },
  contentSection: { marginBottom: "30px" },
  contentText: { fontSize: "15px", color: "#334155", lineHeight: "1.8", whiteSpace: "pre-wrap" },
  emptyContent: { textAlign: "center", color: "#94a3b8", fontSize: "14px", padding: "40px 0" },

  // ── PDF Card — blue theme, download fixed ──
  pdfSection: { marginTop: "20px" },
  pdfCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    background: "linear-gradient(135deg,#eff6ff,#fff)",
    border: "1.5px solid #bfdbfe",
    borderRadius: "14px",
    padding: "20px 22px",
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  pdfIconBox: { flexShrink: 0 },
  pdfInfo: { flex: 1, minWidth: "140px" },
  pdfName: { fontSize: "14px", fontWeight: "700", color: "#1e293b", margin: "0 0 4px 0", wordBreak: "break-word" },
  pdfMeta: { fontSize: "12px", color: "#94a3b8", margin: 0 },
  pdfBtns: { display: "flex", gap: "10px", flexWrap: "wrap", flexShrink: 0 },
  viewPdfBtn: {
    padding: "10px 20px",
    borderRadius: "20px",
    background: "#4f46e5",
    color: "#fff",
    fontSize: "13px",
    fontWeight: "700",
    textDecoration: "none",
    display: "inline-block",
    cursor: "pointer",
  },
  downloadPdfBtn: {
    padding: "10px 20px",
    borderRadius: "20px",
    background: "#fff",
    color: "#4f46e5",
    border: "1.5px solid #c7d2fe",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    display: "inline-block",
  },
  pdfHint: { fontSize: "12px", color: "#94a3b8", margin: "4px 0 0 0" },

  // Quiz section
  quizSection: { background: "#fff", borderRadius: "16px", padding: "28px", boxShadow: "0 10px 25px rgba(0,0,0,0.06)" },
  quizSectionHeader: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "22px", flexWrap: "wrap", gap: "12px" },
  quizSectionLeft: { display: "flex", alignItems: "flex-start", gap: "14px" },
  quizSectionTitle: { fontSize: "18px", fontWeight: "700", color: "#1e293b", margin: "0 0 4px 0" },
  quizSectionSub: { fontSize: "13px", color: "#64748b", margin: 0 },
  quizCountBadge: { background: "#e0e7ff", color: "#4f46e5", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "700", flexShrink: 0 },
  quizLoadingMsg: { color: "#64748b", fontSize: "14px" },
  quizGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "16px" },
  quizCard: { background: "linear-gradient(135deg,#f8fafc,#f0f9ff)", borderRadius: "14px", padding: "20px", border: "1px solid #e0e7ff", display: "flex", flexDirection: "column", gap: "10px" },
  quizCardTop: { display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" },
  diffBadge: { padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" },
  timeBadge: { padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", background: "#f1f5f9", color: "#475569" },
  quizCardTitle: { fontSize: "15px", fontWeight: "700", color: "#1e293b", margin: 0, lineHeight: "1.4" },
  quizCardDesc: { fontSize: "13px", color: "#64748b", margin: 0, lineHeight: "1.5" },
  quizStats: { display: "flex", alignItems: "center", background: "#fff", borderRadius: "10px", padding: "10px", border: "1px solid #e2e8f0" },
  quizStat: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center" },
  quizStatNum: { fontSize: "18px", fontWeight: "700", color: "#4f46e5" },
  quizStatLabel: { fontSize: "10px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase" },
  quizStatDivider: { width: "1px", height: "30px", background: "#e2e8f0" },
  attemptBtn: { marginTop: "4px", padding: "11px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", fontSize: "14px", fontWeight: "700", cursor: "pointer", width: "100%", letterSpacing: "0.3px" },

  // Discuss box
  discussBox: { background: "#fff", borderRadius: "16px", padding: "28px", boxShadow: "0 10px 25px rgba(0,0,0,0.06)" },
  tabRow: { display: "flex", gap: "10px", marginBottom: "20px" },
  tab: { padding: "9px 20px", borderRadius: "25px", border: "2px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: "13px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
  tabActive: { padding: "9px 20px", borderRadius: "25px", border: "2px solid #4f46e5", background: "#e0e7ff", color: "#4f46e5", fontSize: "13px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" },
  tabBadge: { background: "#4f46e5", color: "#fff", borderRadius: "50%", width: "18px", height: "18px", fontSize: "10px", fontWeight: "700", display: "inline-flex", alignItems: "center", justifyContent: "center" },
  boxSubtitle: { fontSize: "13px", color: "#64748b", marginBottom: "16px", marginTop: 0 },
  inputArea: { background: "#f8fafc", borderRadius: "12px", padding: "16px", border: "1px solid #e2e8f0" },
  inputRow: { display: "flex", gap: "12px", alignItems: "flex-start" },
  userAvatar: { width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: "14px", flexShrink: 0 },
  textarea: { flex: 1, padding: "10px 14px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "14px", outline: "none", resize: "vertical", fontFamily: "inherit", lineHeight: "1.5" },
  postBtn: { padding: "10px 22px", borderRadius: "25px", border: "none", background: "linear-gradient(135deg,#4f46e5,#06b6d4)", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  loginNudge: { textAlign: "center", padding: "20px 0" },
  loginNudgeBtn: { padding: "10px 24px", borderRadius: "25px", border: "2px solid #4f46e5", background: "#fff", color: "#4f46e5", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  emptyMsg: { textAlign: "center", color: "#94a3b8", fontSize: "14px", padding: "20px 0" },
  peerCard: { background: "#f0f9ff", borderRadius: "12px", padding: "16px", marginBottom: "12px", border: "1px solid #bae6fd" },
  peerHeaderRow: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" },
  peerAvatar: { width: "34px", height: "34px", borderRadius: "50%", objectFit: "cover" },
  peerName: { fontSize: "13px", fontWeight: "600", color: "#1e293b", margin: 0 },
  authorTag: { fontSize: "11px", color: "#4f46e5", fontWeight: "600" },
  peerDate: { fontSize: "11px", color: "#94a3b8", margin: 0 },
  peerComment: { fontSize: "14px", color: "#334155", lineHeight: "1.6", margin: 0 },

  // Author card
  authorCard: { width: "270px", background: "#fff", borderRadius: "16px", padding: "28px 20px", boxShadow: "0 10px 25px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", position: "sticky", top: "20px" },
  authorCardTitle: { fontSize: "13px", color: "#94a3b8", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px", alignSelf: "flex-start" },
  avatarWrapper: { marginTop: "6px" },
  avatarImg: { width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover" },
  avatarFallback: { width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg,#4f46e5,#06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "30px", fontWeight: "700" },
  authorName: { fontSize: "18px", fontWeight: "700", color: "#1e293b", margin: "0", textAlign: "center" },
  authorUsername: { fontSize: "13px", color: "#64748b", margin: "0" },
  followerRow: { display: "flex", flexDirection: "column", alignItems: "center", background: "#f8fafc", padding: "10px 30px", borderRadius: "12px", width: "100%" },
  followerCount: { fontSize: "24px", fontWeight: "700", color: "#4f46e5" },
  followerLabel: { fontSize: "12px", color: "#64748b" },
  followBtn: { width: "100%", padding: "12px", borderRadius: "25px", border: "none", fontSize: "14px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s ease", textAlign: "center" },
  moreBtn: { width: "100%", padding: "11px", borderRadius: "25px", border: "2px solid #e0e7ff", background: "#fff", color: "#4f46e5", fontSize: "13px", fontWeight: "600", cursor: "pointer" },
  statBox: { display: "flex", gap: "12px", width: "100%", justifyContent: "center", marginTop: "4px" },
  statItem: { display: "flex", flexDirection: "column", alignItems: "center", background: "#f8fafc", padding: "10px 14px", borderRadius: "12px", flex: 1 },
  statNum: { fontSize: "20px", fontWeight: "700", color: "#4f46e5" },
  statLabel: { fontSize: "11px", color: "#64748b" },
};