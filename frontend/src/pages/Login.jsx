import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <button onClick={() => navigate("/")} style={styles.backBtn}>
        ← Go Back
      </button>

      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>

        <input
          type="text"
          placeholder="Username or Email"
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          style={styles.input}
        />

        <button style={styles.primaryBtn}>Login</button>

        <button style={styles.googleBtn}>
          Continue with Google
        </button>

        <p style={styles.switchText}>
          Don’t have an account?{" "}
          <Link to="/signup" style={styles.link}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "80vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    fontFamily: "Arial, sans-serif",
  },
  backBtn: {
    position: "absolute",
    top: "20px",
    left: "20px",
    background: "none",
    border: "none",
    color: "#2563eb",
    fontSize: "16px",
    cursor: "pointer",
  },
  card: {
    width: "350px",
    padding: "30px",
    borderRadius: "10px",
    background: "#ffffff",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
  title: {
    marginBottom: "20px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
  primaryBtn: {
    width: "100%",
    padding: "10px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "10px",
  },
  googleBtn: {
    width: "100%",
    padding: "10px",
    background: "#f5f5f5",
    border: "1px solid #ccc",
    borderRadius: "6px",
    cursor: "pointer",
  },
  switchText: {
    marginTop: "15px",
    fontSize: "14px",
  },
  link: {
    color: "#2563eb",
    textDecoration: "none",
    fontWeight: "500",
  },
};