import { useEffect, useState } from "react";
import "./Leaderboard.css";

export default function Leaderboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/author/analytics/", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access")}`, // if using JWT
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }

        const data = await response.json();

        // 🔥 Backend raw counts expected:
        // {
        //   notes_views: 120,
        //   quiz_attempts: 80,
        //   questions_received: 35,
        //   previous_growth: 15
        // }

        const total =
          data.notes_views +
          data.quiz_attempts +
          data.questions_received;

        const calculatePercent = (value) =>
          total > 0 ? Math.round((value / total) * 100) : 0;

        setAnalytics({
          notesViews: data.notes_views,
          quizAttempts: data.quiz_attempts,
          questionsReceived: data.questions_received,
          notesPercent: calculatePercent(data.notes_views),
          quizPercent: calculatePercent(data.quiz_attempts),
          questionsPercent: calculatePercent(data.questions_received),
          growth: data.previous_growth,
        });
      } catch (err) {
        setError("Unable to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) return <p className="analytics-container">Loading...</p>;
  if (error) return <p className="analytics-container">{error}</p>;

  return (
    <div className="analytics-container">
      <h2>📊 Author Analytics (Last 5 Days)</h2>

      <div className="analytics-cards">
        <CircleCard
          title="Notes Viewed"
          percentage={analytics.notesPercent}
          count={analytics.notesViews}
        />

        <CircleCard
          title="Quiz Attempts"
          percentage={analytics.quizPercent}
          count={analytics.quizAttempts}
        />

        <CircleCard
          title="Questions Asked"
          percentage={analytics.questionsPercent}
          count={analytics.questionsReceived}
        />
      </div>

      <div className="growth-section">
        <h3>🚀 Overall Growth</h3>
        <p className="growth-number">
          {analytics.growth > 0 ? "+" : ""}
          {analytics.growth}% Improvement
        </p>
      </div>
    </div>
  );
}

function CircleCard({ title, percentage, count }) {
  return (
    <div className="circle-card">
      <div
        className="circle"
        style={{
          background: `conic-gradient(
            #4CAF50 ${percentage}%,
            #e6e6e6 ${percentage}% 100%
          )`,
        }}
      >
        <div className="inner-circle">
          <div>
            <span>{percentage}%</span>
            <p className="circle-count">{count}</p>
          </div>
        </div>
      </div>
      <p>{title}</p>
    </div>
  );
}