import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      {/* Navigation Links */}
      <div style={styles.linksContainer}>
        <Link to="/blog" style={styles.link}>Blog</Link>
        <Link to="/connect" style={styles.link}>Connect With Us</Link>
        <Link to="/reference" style={styles.link}>Reference</Link>
      </div>

      {/* Bottom Text */}
      <div style={styles.bottom}>
        Thank You For Visiting
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: "#f5f5f5",
    padding: "40px 20px 20px",
    textAlign: "center",
  },

  /* FIX: linksContainer was missing */
  linksContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "40px",
    fontSize: "16px",
    marginBottom: "20px",
  },

  link: {
    textDecoration: "none",
    color: "#333",
    fontWeight: "500",
  },

  /* SIZE THODA BADA KIYA */
  bottom: {
    fontSize: "18px",   // increased from 16px
    color: "#6b7280",
    fontWeight: "500",
    marginTop: "10px",
  },
};