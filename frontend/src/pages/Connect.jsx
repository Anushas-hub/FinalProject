import { useNavigate } from "react-router-dom";

export default function Connect() {

  const navigate = useNavigate();

  return (
    <div style={styles.container}>

      {/* Go Back */}
      <button onClick={() => navigate(-1)} style={styles.backBtn}>
        ← Go Back
      </button>

      <h1 style={styles.title}>Connect With Us</h1>

      <p style={styles.text}>
        SmartStudy is built for students, by understanding students.
        We value your feedback, suggestions, and ideas to make learning better.
      </p>

      <div style={styles.card}>

        <h3> Email</h3>

        <p>
        <a
        href="https://mail.google.com/mail/?view=cm&fs=1&to=smartstudy.info.com@gmail.com&su=SmartStudy%20Support&body=Hello%20SmartStudy%20Team,"
         target="_blank"
         rel="noopener noreferrer"
        style={styles.email}
       >
  smartstudy.info.com@gmail.com
</a>
        </p>

        <h3> Support</h3>

        <p>
          If you face any issues, have improvement ideas, or want to collaborate
          with us as an author, feel free to reach out.
        </p>

        <h3> Our Promise</h3>

        <p>
          We aim to provide authentic, syllabus-aligned, and student-friendly
          learning resources that help you study smarter.
        </p>

      </div>

    </div>
  );
}

const styles = {
  container:{
    maxWidth:"800px",
    margin:"40px auto",
    padding:"20px",
    color:"#333",
    lineHeight:"1.7"
  },
 backBtn:{
  background:"none",
  border:"none",
  color:"#2563eb",
  fontSize:"16px",
  cursor:"pointer",
  marginBottom:"20px",
  fontWeight:"500"
},
  title:{
    fontSize:"30px",
    marginBottom:"15px"
  },
  text:{
    fontSize:"16px",
    marginBottom:"25px"
  },
  card:{
    background:"#f5f7fa",
    padding:"25px",
    borderRadius:"10px",
    boxShadow:"0 4px 10px rgba(0,0,0,0.05)"
  },
  email:{
    fontWeight:"600",
    color:"#2563eb",
    marginBottom:"15px"
  }
};