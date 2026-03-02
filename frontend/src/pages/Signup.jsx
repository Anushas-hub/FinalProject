import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";

export default function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match ❌");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/signup/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ AUTO LOGIN AFTER SIGNUP
        localStorage.setItem("user", username);

        alert("Account created successfully ✅");

        // ✅ DIRECT HOME
        navigate("/");
      } else {
        alert(data.error || "User already exists ❌");
      }
    } catch (err) {
      alert("Server not reachable ❌");
    }
  };

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
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          style={styles.input}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Confirm Password"
          style={styles.input}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <select
          style={styles.input}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Select Role</option>
          <option value="student">Student</option>
          <option value="author">Author</option>
        </select>

        <button style={styles.primaryBtn} onClick={handleSignup}>
          Create Account
        </button>

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