import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CertificationResults(){

const [courses,setCourses] = useState([])
const navigate = useNavigate()

useEffect(()=>{

fetch("http://127.0.0.1:8000/api/courses/")
.then(res=>res.json())
.then(data=>setCourses(data))

},[])

return(

<div style={{padding:"40px"}}>

<h2>Certification Courses</h2>

<div style={{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",
gap:"20px",
marginTop:"30px"
}}>

{courses.map(course=>(

<div key={course.id} style={{
background:"#fff",
padding:"20px",
borderRadius:"12px",
boxShadow:"0 10px 20px rgba(0,0,0,0.05)"
}}>

{course.thumbnail && (
<img
src={`http://127.0.0.1:8000${course.thumbnail}`}
style={{width:"100%",borderRadius:"10px"}}
/>
)}

<h3>{course.title}</h3>

<p>{course.description}</p>

<button
onClick={()=>navigate(`/certification/${course.id}`)}
>
Start Course
</button>

</div>

))}

</div>

</div>

)

}
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#eef2ff,#f0f9ff,#ecfdf5)"
  },

  hero: {
    background: "#4f46e5",
    color: "#fff",
    padding: "50px 20px",
    textAlign: "center",
  },

  container: {
    padding: "50px 40px"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
    gap: "30px",
  },

  card: {
    background: "#ffffff",
    padding: "30px",
    borderRadius: "18px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
    transition: "0.3s ease",
  },

  desc: {
    marginTop: "10px",
    color: "#475569"
  },

  meta: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
    fontSize: "14px",
    color: "#64748b"
  },

  btn: {
    marginTop: "25px",
    padding: "12px 20px",
    borderRadius: "10px",
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%"
  },
};