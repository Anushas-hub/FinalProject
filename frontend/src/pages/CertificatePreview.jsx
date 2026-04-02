import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import Navbar from "../components/Navbar";

export default function CertificatePreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const certRef = useRef(null);

  const [cert, setCert] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/api/certificate/${id}/`)
      .then(res => res.json())
      .then(data => {
        setCert(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={styles.centerMsg}>Loading certificate...</div>
      </>
    );
  }

  if (!cert || cert.error) {
    return (
      <>
        <Navbar />
        <div style={styles.centerMsg}>Certificate not found.</div>
      </>
    );
  }

  return (
    <>
      <div className="no-print">
        <Navbar />
      </div>

      <div style={styles.page}>

        {/* Action buttons */}
        <div style={styles.actionRow} className="no-print">
          <button style={styles.backBtn} onClick={() => navigate(-1)}>
            ← Back
          </button>
          <button style={styles.printBtn} onClick={handlePrint}>
            ️ Print / Download PDF
          </button>
        </div>

        {/* ── CERTIFICATE ── */}
        <div ref={certRef} style={styles.certificate}>
          <div style={styles.outerBorder}>
            <div style={styles.innerBorder}>

              {/* Top bar */}
              <div style={styles.topBar} />

              {/* Header */}
              <div style={styles.certHeader}>
                <div style={styles.logo}>
                  <span style={styles.logoText}>SmartStudy</span>
                </div>
                <p style={styles.issuer}>Official Certificate of Completion</p>
              </div>

              {/* Decor line */}
              <div style={styles.decorLine}>
                <div style={styles.decorDot} />
                <div style={styles.decorLineFill} />
                <div style={styles.decorDot} />
              </div>

              {/* Body */}
              <div style={styles.certBody}>
                <p style={styles.presentedTo}>This is proudly presented to</p>
                <h1 style={styles.studentName}>{cert.student_name}</h1>
                <p style={styles.completionText}>
                  for successfully completing the course
                </p>
                <h2 style={styles.courseName}>
                  {cert.certificate_title || cert.course_title}
                </h2>
                <p style={styles.completionSub}>
                  with dedication and excellence
                </p>
              </div>

              {/* Decor line */}
              <div style={styles.decorLine}>
                <div style={styles.decorDot} />
                <div style={styles.decorLineFill} />
                <div style={styles.decorDot} />
              </div>

              {/* Footer */}
              <div style={styles.certFooter}>

                {/* LEFT — Signature */}
                <div style={styles.footerLeft}>
                  {/* SVG Cursive Signature */}
                  <svg
                    width="160"
                    height="60"
                    viewBox="0 0 160 60"
                    style={{ display: "block", margin: "0 auto 4px auto" }}
                  >
                    <path
                      d="M10,45 C20,10 35,8 45,20 C52,28 48,38 55,32
                         C62,26 65,15 75,18 C82,20 80,35 88,30
                         C95,25 98,12 108,16 C116,19 112,38 120,33
                         C128,28 132,18 142,22 C148,25 146,40 150,38"
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M30,48 C50,44 80,46 110,44 C125,43 138,45 150,43"
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      opacity="0.5"
                    />
                    {/* S of SmartStudy */}
                    <text
                      x="12"
                      y="38"
                      fontFamily="Dancing Script, Brush Script MT, cursive"
                      fontSize="22"
                      fill="#4f46e5"
                      opacity="0.15"
                      fontWeight="bold"
                    >
                      SmartStudy
                    </text>
                  </svg>

                  <div style={styles.signatureLine} />
                  <p style={styles.signatureLabel}>Authorized Signature</p>
                  <p style={styles.signatureName}>SmartStudy Team</p>
                </div>

                {/* CENTER — Seal */}
                <div style={styles.footerCenter}>
                  <div style={styles.seal}>
                    <span style={styles.sealText}>✓</span>
                  </div>
                  <p style={styles.sealLabel}>Verified</p>
                </div>

                {/* RIGHT — Date */}
                <div style={styles.footerRight}>
                  <div style={styles.signatureLine} />
                  <p style={styles.signatureLabel}>Date of Completion</p>
                  <p style={styles.signatureName}>{formatDate(cert.completed_at)}</p>
                </div>

              </div>

              {/* Certificate ID */}
              <div style={styles.certIdRow}>
                <p style={styles.certIdText}>
                  Certificate ID: <strong>{cert.certificate_id}</strong>
                </p>
                <p style={styles.certIdText}>
                  Issued by: {cert.issued_by}
                </p>
              </div>

              {/* Bottom bar */}
              <div style={styles.bottomBar} />

            </div>
          </div>
        </div>

      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap');
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
        }
      `}</style>
    </>
  );
}

const styles = {
  centerMsg: {
    textAlign: "center", padding: "80px",
    fontSize: "16px", color: "#64748b",
  },
  page: {
    minHeight: "100vh",
    background: "#f1f5f9",
    padding: "30px 20px 60px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  actionRow: {
    display: "flex", gap: "12px",
    marginBottom: "30px", width: "100%",
    maxWidth: "900px", justifyContent: "space-between",
  },
  backBtn: {
    padding: "10px 20px", borderRadius: "10px",
    border: "1px solid #e2e8f0", background: "#fff",
    color: "#1e293b", fontSize: "14px",
    fontWeight: "600", cursor: "pointer",
  },
  printBtn: {
    padding: "10px 24px", borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    color: "#fff", fontSize: "14px",
    fontWeight: "700", cursor: "pointer",
  },
  certificate: {
    width: "900px",
    maxWidth: "100%",
    background: "#fff",
    borderRadius: "4px",
    boxShadow: "0 30px 80px rgba(0,0,0,0.15)",
  },
  outerBorder: {
    padding: "14px",
    background: "linear-gradient(135deg,#4f46e5,#7c3aed,#06b6d4)",
    borderRadius: "4px",
  },
  innerBorder: {
    background: "#fff",
    borderRadius: "2px",
    overflow: "hidden",
  },
  topBar: {
    height: "8px",
    background: "linear-gradient(90deg,#4f46e5,#7c3aed,#06b6d4,#22c55e)",
  },
  certHeader: {
    textAlign: "center",
    padding: "36px 40px 20px 40px",
  },
  logo: {
    display: "inline-block",
    marginBottom: "8px",
  },
  logoText: {
    fontSize: "32px",
    fontWeight: "800",
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.5px",
  },
  issuer: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "3px",
    margin: 0,
  },
  decorLine: {
    display: "flex",
    alignItems: "center",
    padding: "0 40px",
    gap: "10px",
  },
  decorDot: {
    width: "8px", height: "8px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    flexShrink: 0,
  },
  decorLineFill: {
    flex: 1, height: "1px",
    background: "linear-gradient(90deg,#e0e7ff,#ede9fe,#e0e7ff)",
  },
  certBody: {
    textAlign: "center",
    padding: "36px 60px",
  },
  presentedTo: {
    fontSize: "14px",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "2px",
    fontWeight: "600",
    margin: "0 0 16px 0",
  },
  studentName: {
    fontSize: "44px",
    fontWeight: "800",
    color: "#1e293b",
    margin: "0 0 20px 0",
    fontFamily: "Georgia, serif",
    lineHeight: "1.1",
  },
  completionText: {
    fontSize: "14px",
    color: "#64748b",
    margin: "0 0 12px 0",
  },
  courseName: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#4f46e5",
    margin: "0 0 12px 0",
    lineHeight: "1.3",
  },
  completionSub: {
    fontSize: "13px",
    color: "#94a3b8",
    fontStyle: "italic",
    margin: 0,
  },
  certFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: "24px 60px 20px 60px",
  },
  footerLeft: { textAlign: "center", flex: 1 },
  footerCenter: { textAlign: "center", flex: 0.8 },
  footerRight: { textAlign: "center", flex: 1 },
  signatureLine: {
    height: "1px",
    background: "#cbd5e1",
    marginBottom: "8px",
  },
  signatureLabel: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "1px",
    margin: "0 0 2px 0",
  },
  signatureName: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1e293b",
    margin: 0,
  },
  seal: {
    width: "60px", height: "60px",
    borderRadius: "50%",
    background: "linear-gradient(135deg,#4f46e5,#7c3aed)",
    display: "flex", alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 6px auto",
    border: "3px solid #e0e7ff",
  },
  sealText: {
    color: "#fff", fontSize: "24px", fontWeight: "800",
  },
  sealLabel: {
    fontSize: "10px", fontWeight: "700",
    color: "#4f46e5", textTransform: "uppercase",
    letterSpacing: "1px", margin: 0,
  },
  certIdRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 40px",
    background: "#f8fafc",
    borderTop: "1px solid #f1f5f9",
  },
  certIdText: {
    fontSize: "11px", color: "#94a3b8", margin: 0,
  },
  bottomBar: {
    height: "6px",
    background: "linear-gradient(90deg,#4f46e5,#7c3aed,#06b6d4,#22c55e)",
  },
};