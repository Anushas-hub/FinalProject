import { useParams, useNavigate } from "react-router-dom";

export default function CertificationSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = localStorage.getItem("user");

  return (
    <div style={styles.container}>
      <h1>🎉 Congratulations {user}!</h1>
      <p>You have completed Course #{id}</p>

      <button
        style={styles.btn}
        onClick={()=>navigate(`/certificate/${id}`)}
      >
        Download Certificate
      </button>
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: "60px",
  },
  btn: {
    marginTop: "20px",
    padding: "15px 30px",
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
  },
};