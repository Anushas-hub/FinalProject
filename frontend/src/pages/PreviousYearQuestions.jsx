import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useLocation } from "react-router-dom";

export default function PreviousYearQuestions() {

const location = useLocation()

const [courses,setCourses] = useState([])
const [semesters,setSemesters] = useState([])
const [years,setYears] = useState([])
const [subjects,setSubjects] = useState([])

const [course,setCourse] = useState("")
const [semester,setSemester] = useState("")
const [subject,setSubject] = useState("")
const [year,setYear] = useState("")

const [showPDF,setShowPDF] = useState(false)
const [pdfUrl,setPdfUrl] = useState("")

const [pyqCards,setPyqCards] = useState([])



// dropdown options
useEffect(()=>{

fetch("http://127.0.0.1:8000/api/pyq-options/")
.then(res=>res.json())
.then(data=>{

setCourses(data.courses || [])
setSemesters(data.semesters || [])
setYears(data.years || [])

})

},[])



// subjects
useEffect(()=>{

if(!course || !semester) return

fetch(`http://127.0.0.1:8000/api/pyq-subjects/?course=${course}&semester=${semester}`)
.then(res=>res.json())
.then(data=>{

setSubjects(data || [])

})

},[course,semester])



// HOME SEARCH
useEffect(()=>{

const params=new URLSearchParams(location.search)

const subjectParam=params.get("subject")
const yearParam=params.get("year")

if(!subjectParam && !yearParam) return

let url=`http://127.0.0.1:8000/api/pyqs/?`

if(subjectParam){
url+=`subject=${subjectParam}&`
}

if(yearParam){
url+=`year=${yearParam}`
}

fetch(url)
.then(res=>res.json())
.then(data=>{

if(!data || data.length===0) return

setPyqCards(data)

})

},[location.search])



const handleGetPYQ = async () => {

if (!course || !semester || !subject || !year) {
alert("Please select all fields.")
return
}

try{

const res = await fetch(
`http://127.0.0.1:8000/api/pyqs/?course=${course}&semester=${semester}&subject=${subject}&year=${year}`
)

const data = await res.json()

if(!data || data.length===0){
alert("No PYQ found")
return
}

setPyqCards(data)

}catch(err){

console.error(err)
alert("Error fetching PYQ")

}

}



const handleBack=()=>{

setShowPDF(false)
setPdfUrl("")

}



// ✅ FIXED DOWNLOAD
const handleDownload = async (pdf,sub,yr)=>{

const fileUrl="http://127.0.0.1:8000"+pdf

try{

const res=await fetch(fileUrl)
const blob=await res.blob()

const url=window.URL.createObjectURL(blob)

const link=document.createElement("a")

link.href=url
link.download=`${sub}-${yr}.pdf`

document.body.appendChild(link)
link.click()

link.remove()
window.URL.revokeObjectURL(url)

}catch(err){

console.error("Download error",err)

}

}



return(

<div style={styles.wrapper}>

<Navbar/>

<div style={styles.blueBox}>
<h2 style={styles.blueTitle}>Previous Year Questions</h2>
</div>

<div style={styles.mainContainer}>
<div style={styles.cardContainer}>


{/* FORM */}

{pyqCards.length===0 && !showPDF && (

<div style={styles.card}>

<div style={styles.formGroup}>
<label>Course</label>

<select
value={course}
onChange={(e)=>{
setCourse(e.target.value)
setSemester("")
setSubject("")
setYear("")
}}
>

<option value="">Select Course</option>

{courses.map(c=>(

<option key={c.value} value={c.value}>
{c.label}
</option>

))}

</select>
</div>



<div style={styles.formGroup}>
<label>Semester</label>

<select
value={semester}
onChange={(e)=>{
setSemester(e.target.value)
setSubject("")
setYear("")
}}
disabled={!course}
>

<option value="">Select Semester</option>

{semesters.map(s=>(

<option key={s.value} value={s.value}>
{s.label}
</option>

))}

</select>
</div>



<div style={styles.formGroup}>
<label>Subject</label>

<select
value={subject}
onChange={(e)=>setSubject(e.target.value)}
disabled={!semester}
>

<option value="">Select Subject</option>

{subjects.map(s=>(

<option key={s.value} value={s.value}>
{s.label}
</option>

))}

</select>

</div>



<div style={styles.formGroup}>
<label>Year</label>

<select
value={year}
onChange={(e)=>setYear(e.target.value)}
disabled={!semester}
>

<option value="">Select Year</option>

{years.map(y=>(

<option key={y.value} value={y.value}>
{y.label}
</option>

))}

</select>

</div>


<button style={styles.submitBtn} onClick={handleGetPYQ}>
Get PYQ
</button>

</div>

)}



{/* PYQ CARDS */}

{pyqCards.length>0 && !showPDF && (

<div style={styles.grid}>

{pyqCards.map((p,i)=>(

<div key={i} style={styles.pyqCard}>

<h3>{p.subject}</h3>
<p>Year {p.year}</p>

<div style={styles.buttonRow}>

<button
style={styles.viewBtn}
onClick={()=>{

window.open("http://127.0.0.1:8000"+p.pdf,"_blank")

}}
>
View
</button>
<button
style={styles.downloadBtn}
onClick={()=>handleDownload(p.pdf,p.subject,p.year)}
>
Download
</button>

</div>

</div>

))}

</div>

)}



{/* PDF VIEWER */}

{showPDF && (

<div style={styles.card}>

<div style={styles.pdfWrapper}>

<iframe
src={pdfUrl+"#toolbar=0"}
title="PYQ PDF"
style={styles.pdfFrame}
/>

</div>

<div style={styles.buttonRow}>

<button onClick={handleBack} style={styles.backBtn}>
Back
</button>

</div>

</div>

)}

</div>
</div>
</div>

)

}
const styles={

wrapper:{
minHeight:"100vh",
background:"linear-gradient(135deg,#f0f9ff 0%,#f5f3ff 50%,#ecfdf5 100%)"
},

blueBox:{
background:"#4f46e5",
padding:"25px",
textAlign:"center",
color:"white"
},

blueTitle:{
fontSize:"24px"
},

mainContainer:{
display:"flex",
justifyContent:"center",
padding:"30px"
},

cardContainer:{
width:"100%",
maxWidth:"1200px"
},

card:{
background:"white",
padding:"30px",
borderRadius:"18px",
boxShadow:"0 10px 25px rgba(0,0,0,0.08)",
display:"grid",
gap:"18px"
},

formGroup:{
display:"flex",
flexDirection:"column",
gap:"6px"
},

submitBtn:{
padding:"12px",
borderRadius:"30px",
border:"none",
background:"#4f46e5",
color:"#fff",
cursor:"pointer"
},

grid:{
display:"grid",
gridTemplateColumns:"repeat(4,1fr)",
gap:"20px"
},

pyqCard:{
background:"#fff",
padding:"20px",
borderRadius:"14px",
boxShadow:"0 8px 20px rgba(0,0,0,0.08)"
},

pdfWrapper:{
width:"100%",
height:"500px",
border:"1px solid #ddd",
borderRadius:"12px",
overflow:"hidden"
},

pdfFrame:{
width:"100%",
height:"100%",
border:"none"
},

buttonRow:{
display:"flex",
gap:"10px",
marginTop:"10px"
},

viewBtn:{
padding:"8px 16px",
borderRadius:"20px",
border:"none",
background:"#6366f1",
color:"#fff"
},

downloadBtn:{
padding:"8px 16px",
borderRadius:"20px",
border:"none",
background:"#10b981",
color:"#fff"
},

backBtn:{
padding:"10px 20px",
borderRadius:"25px",
border:"none",
background:"#ef4444",
color:"#fff"
}

}
