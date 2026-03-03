import { useParams } from "react-router-dom";
import "./certificate.css";

export default function CertificatePreview() {
  const { id } = useParams();

  // 🔥 Replaceable Course Data (future me backend se aayega)
  const courses = [
    { id: "1", name: "Web Development Certification" },
    { id: "2", name: "Data Structures Certification" },
    { id: "3", name: "Java Programming Certification" },
  ];

  // 🔥 Safe Course Fetch
  const course = courses.find((c) => c.id === id);
  const courseName = course ? course.name : "Certification Course";

  // 🔥 Safe User Fetch (crash proof)
  let studentName = "Student";
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      studentName = user?.name || "Student";
    }
  } catch (err) {
    studentName = "Student";
  }

  const date = new Date().toLocaleDateString();

  return (
    <div className="certificate-wrapper">
      <div className="certificate-card">

        <div className="certificate-header">
          <h2>SmartStudy</h2>
        </div>

        <h1 className="certificate-title">
          Certificate of Completion
        </h1>

        <p className="certificate-sub">
          This is proudly presented to
        </p>

        <h2 className="certificate-name">
          {studentName}
        </h2>

        <p className="certificate-text">
          for successfully completing
        </p>

        <h3 className="course-name">
          {courseName}
        </h3>

        <div className="certificate-footer">
          <span>Date: {date}</span>
          <span className="signature">
            Authorized Signature
          </span>
        </div>

      </div>
    </div>
  );
}