import { useParams } from "react-router-dom";
import { useState } from "react";
import Navbar from "../components/Navbar";
import "./TopicContent.css";

function TopicContent() {
  const { id } = useParams();

  // 🔥 Dummy Data (Backend se replace hoga)
  const topicData = {
    title: "Data Structures",
    modules: [
      {
        name: "Introduction",
        content: "This is Introduction content. Backend se real content yaha aayega."
      },
      {
        name: "Arrays",
        content: "This is Arrays content."
      },
      {
        name: "Linked List",
        content: "This is Linked List content."
      },
      {
        name: "Stack",
        content: "This is Stack content."
      },
      {
        name: "Queue",
        content: "This is Queue content."
      },
      {
        name: "Trees",
        content: "This is Trees content."
      },
      {
        name: "Graphs",
        content: "This is Graphs content."
      },
      {
        name: "Sorting",
        content: "This is Sorting content."
      },
      {
        name: "Searching",
        content: "This is Searching content."
      },
      {
        name: "Hashing",
        content: "This is Hashing content."
      }
    ]
  };

  const [activeModule, setActiveModule] = useState(topicData.modules[0]);

  return (
    <>
      <Navbar />

      <div className="topic-container">

        {/* 🔵 Centered Blue Header */}
        <div className="topic-header">
          <h1>{topicData.title}</h1>
        </div>

        {/* 🧭 Main Section */}
        <div className="topic-body">

          {/* 📚 Sidebar */}
          <div className="module-sidebar">
            {topicData.modules.map((module, index) => (
              <button
                key={index}
                className={activeModule.name === module.name ? "active-module" : ""}
                onClick={() => setActiveModule(module)}
              >
                {module.name}
              </button>
            ))}
          </div>

          {/* 📖 Content */}
          <div className="module-content">
            <p>{activeModule.content}</p>
          </div>

        </div>

        {/* 🧠 Quiz Section */}
        <div className="quiz-section">
          <h2>Related Quizzes</h2>

          <div className="quiz-grid">
            {Array.from({ length: 10 }).map((_, index) => (
              <button key={index} className="quiz-btn">
                Quiz {index + 1}
              </button>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}

export default TopicContent;