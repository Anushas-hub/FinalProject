import { useEffect, useState } from "react";
import {
  Bar,
  Pie,
  Line
} from "react-chartjs-2";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

import "./Leaderboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function Leaderboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch("/api/author/analytics/");

        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }

        const data = await response.json();

        setAnalytics(data);
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

  // 📊 BAR CHART DATA
  const barData = {
    labels: ["Notes Viewed", "Quiz Attempts", "Questions Asked"],
    datasets: [
      {
        label: "Activity",
        data: [
          analytics.notes_views,
          analytics.quiz_attempts,
          analytics.questions_received,
        ],
      },
    ],
  };

  // 🥧 PIE CHART
  const pieData = {
    labels: ["Notes", "Quiz", "Questions"],
    datasets: [
      {
        data: [
          analytics.notes_views,
          analytics.quiz_attempts,
          analytics.questions_received,
        ],
      },
    ],
  };

  // 📈 LINE CHART (growth simulation / backend future ready)
  const lineData = {
    labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5"],
    datasets: [
      {
        label: "Growth %",
        data: [
          analytics.previous_growth - 10,
          analytics.previous_growth - 5,
          analytics.previous_growth,
          analytics.previous_growth + 5,
          analytics.previous_growth + 10,
        ],
      },
    ],
  };

  return (
    <div className="analytics-container">
      <h2>📊 Author Analytics Dashboard</h2>

      <div style={{ marginBottom: "40px" }}>
        <h3>📊 Activity Overview</h3>
        <Bar data={barData} />
      </div>

      <div style={{ marginBottom: "40px" }}>
        <h3>🥧 Distribution</h3>
        <Pie data={pieData} />
      </div>

      <div style={{ marginBottom: "40px" }}>
        <h3>📈 Growth Trend</h3>
        <Line data={lineData} />
      </div>

      <div className="growth-section">
        <h3>🚀 Overall Growth</h3>
        <p className="growth-number">
          {analytics.previous_growth > 0 ? "+" : ""}
          {analytics.previous_growth}% Improvement
        </p>
      </div>
    </div>
  );
}