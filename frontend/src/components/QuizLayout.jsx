import "./QuizLayout.css";

export default function QuizLayout({ title, children }) {

  return (

    <div className="quiz-container">

      <div className="quiz-card">

        <h1 className="quiz-title">{title}</h1>

        {children}

      </div>

    </div>

  )

}