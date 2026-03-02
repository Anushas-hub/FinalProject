import { useNavigate } from "react-router-dom";

export default function Blog() {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      {/* Go Back Button */}
      <button onClick={() => navigate("/")} style={styles.backBtn}>
        ← Go Back
      </button>

      {/* Blog Content */}
      <h1 style={styles.title}>SmartStudy – Learn Smarter, Not Harder</h1>

      <p style={styles.paragraph}>
        In today’s fast-paced academic world, students need more than just
        textbooks and scattered PDFs to succeed. They need structured, reliable,
        and syllabus-aligned resources that are easy to access anytime,
        anywhere. That’s where <strong>SmartStudy</strong> comes in.
      </p>

      <h2 style={styles.heading}>What is SmartStudy?</h2>
      <p style={styles.paragraph}>
        SmartStudy is an online learning and collaboration platform designed
        especially for students who want organized, exam-oriented, and authentic
        study material in one place.
      </p>

      <p style={styles.paragraph}>
        Instead of searching endlessly across the internet, SmartStudy provides
        a centralized hub for notes, quizzes, and self-study resources that
        actually match the university syllabus.
      </p>

      <h2 style={styles.heading}>Purpose of SmartStudy</h2>
      <ul style={styles.list}>
        <li>Eliminate confusion from scattered resources</li>
        <li>Provide syllabus-specific notes and quizzes</li>
        <li>Support self-learning and exam preparation</li>
        <li>Encourage knowledge sharing and improvement</li>
      </ul>

      <h2 style={styles.heading}>How to Use SmartStudy</h2>
      <p style={styles.paragraph}>
        Students can register, browse materials, attempt quizzes, and track
        performance. Authors can upload verified content and improve it based on
        feedback. Guest users can explore preview content.
      </p>

      <h2 style={styles.heading}>Why SmartStudy Matters</h2>
      <p style={styles.paragraph}>
        SmartStudy bridges traditional classroom learning with modern digital
        education and empowers students to take control of their learning.
      </p>

      {/* Feedback Section */}
      <div style={styles.feedbackBox}>
        <h2 style={styles.heading}>Feedback</h2>
        <textarea
          placeholder="Share your feedback..."
          style={styles.textarea}
        ></textarea>
        <button style={styles.submitBtn}>Submit</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "40px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    lineHeight: "1.7",
    color: "#333",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#2563eb",
    fontSize: "16px",
    cursor: "pointer",
    marginBottom: "20px",
  },
  title: {
    fontSize: "32px",
    marginBottom: "20px",
  },
  heading: {
    fontSize: "22px",
    marginTop: "30px",
  },
  paragraph: {
    fontSize: "16px",
    marginTop: "10px",
  },
  list: {
    marginTop: "10px",
    paddingLeft: "20px",
  },
  feedbackBox: {
    marginTop: "50px",
    padding: "20px",
    background: "#f5f5f5",
    borderRadius: "8px",
  },
  textarea: {
    width: "100%",
    minHeight: "100px",
    padding: "10px",
    marginTop: "10px",
  },
  submitBtn: {
    marginTop: "10px",
    padding: "10px 20px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
};