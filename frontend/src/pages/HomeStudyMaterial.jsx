import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import "./HomeStudyMaterial.css";

function HomeStudyMaterial() {

  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState("latest");
  const [topics, setTopics] = useState([]);
  const [filteredTopics, setFilteredTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    fetch("http://127.0.0.1:8000/api/subjects/")
      .then((res) => res.json())
      .then((data) => {

        setTopics(data);

        const params = new URLSearchParams(location.search);
        const search = params.get("search");

        if (search) {

          const filtered = data.filter((subject) =>
            subject.title.toLowerCase().includes(search.toLowerCase())
          );

          setFilteredTopics(filtered);

        } else {

          setFilteredTopics(data);

        }

        setLoading(false);

      })
      .catch((err) => {
        console.error("Error fetching subjects:", err);
        setLoading(false);
      });

  }, [location.search]);

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

        {/* LOADING */}
        {loading && (
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            Loading subjects...
          </div>
        )}

        {/* NO RESULT */}
        {!loading && filteredTopics.length === 0 && (
          <div style={{ textAlign: "center", marginTop: "40px" }}>
            No study material found.
          </div>
        )}

        {/* SUBJECTS */}
        <div className="topics-grid">

          {filteredTopics.map((topic) => (

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
