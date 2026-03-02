import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.linksContainer}>
        <Link to="/blog" style={styles.link}>Blog</Link>
        <Link to="/connect" style={styles.link}>Connect With Us</Link>
        <Link to="/reference" style={styles.link}>Reference</Link>
      </div>

      <div style={styles.bottom}>
        Thank You For Visiting
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    background: "#ffffff",
    padding: "50px 20px 30px",
    textAlign: "center",
    marginTop: "60px",
    boxShadow: "0 -2px 8px rgba(0,0,0,0.05)",
    fontFamily: "Arial, sans-serif",
  },
  linksContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "50px",
    fontSize: "16px",
    marginBottom: "20px",
  },
  link: {
    textDecoration: "none",
    color: "#1c58da",
    fontWeight: "500",
  },
  bottom: {
    fontSize: "16px",
    color: "#222a39",
  },
};