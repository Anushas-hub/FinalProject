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

<div style={styles.page}>

<div style={styles.hero}>
<h1>Certification Courses</h1>
<p>Upgrade your skills and earn verified certificates</p>
</div>

<div style={styles.container}>

<div style={styles.grid}>

{courses.map(course=>(

<div key={course.id} style={styles.card}>

{course.thumbnail && (
<img
src={`http://127.0.0.1:8000${course.thumbnail}`}
style={styles.image}
/>
)}

<h3>{course.title}</h3>

<p style={styles.desc}>{course.description}</p>

<button
style={styles.btn}
onClick={()=>navigate(`/certification/${course.id}`)}
>
Start Learning
</button>

</div>

))}

</div>

</div>

</div>

)

}



const styles = {

page:{
minHeight:"100vh",
background:"linear-gradient(135deg,#eef2ff,#f0f9ff,#ecfdf5)"
},

hero:{
background:"#4f46e5",
color:"#fff",
padding:"60px",
textAlign:"center"
},

container:{
padding:"60px"
},

grid:{
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",
gap:"30px"
},

card:{
background:"#fff",
padding:"25px",
borderRadius:"16px",
boxShadow:"0 20px 40px rgba(0,0,0,0.08)"
},

image:{
width:"100%",
borderRadius:"10px",
marginBottom:"15px"
},

desc:{
marginTop:"10px",
color:"#475569"
},

btn:{
marginTop:"20px",
padding:"12px",
borderRadius:"10px",
border:"none",
background:"#4f46e5",
color:"#fff",
fontWeight:"600",
cursor:"pointer",
width:"100%"
}

}