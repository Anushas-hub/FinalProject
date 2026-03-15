import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import QuizLayout from "../components/QuizLayout";

function CertificationQuiz() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz,setQuiz] = useState(null);
  const [answers,setAnswers] = useState({});
  const [submitted,setSubmitted] = useState(false);

  useEffect(()=>{

    fetch(`http://127.0.0.1:8000/api/course-quiz/${id}/`)
    .then(res=>res.json())
    .then(data=>{

      const formatted = {
        title:data.title,
        questions:data.questions.map(q=>({
          question:q.question,
          options:[
            q.option1,
            q.option2,
            q.option3,
            q.option4
          ],
          answer:q.correct_answer
        }))
      }

      setQuiz(formatted)

    })

  },[id])


  const handleSelect=(qIndex,opt)=>{

    setAnswers({
      ...answers,
      [qIndex]:opt
    })

  }


  const submitQuiz=()=>{
    setSubmitted(true)
  }


  if(!quiz){

    return(
      <>
      <Navbar/>
      <p style={{padding:"40px"}}>Loading Quiz...</p>
      </>
    )

  }


  const score = quiz.questions.filter(
    (q,i)=>answers[i]===q.answer
  ).length


  return(

    <>
    <Navbar/>

    <QuizLayout title={quiz.title}>

      {!submitted && (

        <>
        {quiz.questions.map((q,i)=>(

          <div key={i}>

            <h3 className="quiz-question">{q.question}</h3>

            {q.options.map((opt,index)=>(

              <div
              key={index}
              className="quiz-option"
              onClick={()=>handleSelect(i,opt)}
              >

              <input
              type="radio"
              name={`q${i}`}
              value={opt}
              />

              {opt}

              </div>

            ))}

          </div>

        ))}

        <button
        className="quiz-submit"
        onClick={submitQuiz}
        >
        Submit Quiz
        </button>

        </>

      )}



      {submitted && (

        <div>

          <h2>Score : {score} / {quiz.questions.length}</h2>

          {quiz.questions.map((q,i)=>{

            const correct = answers[i]===q.answer

            return(

              <div key={i} style={{marginTop:"20px"}}>

                <p><b>{q.question}</b></p>

                <p>
                Your Answer : {answers[i] || "Not Answered"}
                </p>

                <p style={{
                  color: correct ? "green" : "red"
                }}>
                Correct Answer : {q.answer}
                </p>

              </div>

            )

          })}

          <button
          className="quiz-submit"
          style={{marginTop:"30px"}}
          onClick={()=>navigate(-1)}
          >
          Move to Next Module →
          </button>

        </div>

      )}

    </QuizLayout>

    </>

  )

}

export default CertificationQuiz