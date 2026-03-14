import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./HomeStudyMaterial.css";

function HomeStudyMaterial() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("latest");
  const [topics, setTopics] = useState([]);

  // 🔥 Backend se subjects fetch
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/subjects/")
      .then((res) => res.json())
      .then((data) => {
        setTopics(data);
      })
      .catch((error) => {
        console.error("Error fetching subjects:", error);
      });
  }, []);

  return (
    <>
      <Navbar />

      <div className="study-container">
        <div className="study-hero">
          <h1>Study Materials</h1>
          <p>Easily get access to easy and verified study content</p>
        </div>

        <div className="tabs">
          <button
            className={activeTab === "latest" ? "active" : ""}
            onClick={() => setActiveTab("latest")}
          >
            Latest
          </button>

          <button
            className={activeTab === "mostViewed" ? "active" : ""}
            onClick={() => setActiveTab("mostViewed")}
          >
            Most Viewed
          </button>
        </div>

        <div className="topics-grid">
          {topics.map((topic) => (
            <div className="topic-card" key={topic.id}>
              <h2>{topic.title}</h2>
              <p>{topic.description}</p>
              <button
                className="explore-btn"
                onClick={() => navigate(`/study-material/${topic.id}`)}
              >
                Explore
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default HomeStudyMaterial;