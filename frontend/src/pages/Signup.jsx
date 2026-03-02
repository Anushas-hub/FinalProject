import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <button onClick={() => navigate("/")} style={styles.backBtn}>
        ← Go Back
      </button>

      <div style={styles.card}>
        <h2 style={styles.title}>Sign Up</h2>

        <input
          type="text"
          placeholder="Username"
          style={styles.input}
        />

        <input
          type="email"
          placeholder="Email"
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Password"
          style={styles.input}
        />

        <select style={styles.input}>
          <option value="">Select Role</option>
          <option value="student">Student</option>
          <option value="author">Author</option>
        </select>

        <button style={styles.primaryBtn}>Create Account</button>

        <button style={styles.googleBtn}>
          Continue with Google
        </button>

        <p style={styles.switchText}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Login
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
    width: "380px",
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