import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import "./Leaderboard.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const STAT_CARDS = [
  { key: "materials_uploaded",  label: "Materials Uploaded",  icon: "📁", color: "#4f46e5" },
  { key: "quizzes_created",     label: "Quizzes Created",     icon: "📝", color: "#0891b2" },
  { key: "questions_received",  label: "Q&A Received",        icon: "💬", color: "#7c3aed" },
  { key: "peer_comments",       label: "Peer Notes",          icon: "📓", color: "#059669" },
  { key: "followers_count",     label: "Followers",           icon: "👥", color: "#d97706" },
  { key: "engaged_students",    label: "Engaged Students",    icon: "🎓", color: "#dc2626" },
];

export default function Leaderboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  const username = localStorage.getItem("user");

  useEffect(() => {
    if (!username) return;

    fetch(`http://127.0.0.1:8000/api/author/leaderboard/${username}/`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed");
        return res.json();
      })
      .then((data) => { setAnalytics(data); setLoading(false); })
      .catch(() => { setError("Unable to load analytics"); setLoading(false); });
  }, [username]);

  if (loading) return (
    <div className="lb-center">
      <div className="lb-spinner" />
      <p>Loading analytics...</p>
    </div>
  );

  if (error) return (
    <div className="lb-center lb-error">
      <p>⚠️ {error}</p>
    </div>
  );

  // ── BAR CHART ──
  const barData = {
    labels: analytics.bar_labels,
    datasets: [{
      label: "Total Count",
      data: analytics.bar_data,
      backgroundColor: [
        "#6366f1","#06b6d4","#8b5cf6",
        "#10b981","#f59e0b","#ef4444",
      ],
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: {
        label: (ctx) => ` ${ctx.parsed.y} total`
      }},
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
        grid: { color: "#f1f5f9" },
      },
      x: { grid: { display: false } },
    },
  };

  // ── LINE CHART ──
  const lineData = {
    labels: analytics.line_labels,
    datasets: [
      {
        label: "Materials Uploaded",
        data: analytics.line_materials,
        borderColor: "#4f46e5",
        backgroundColor: "rgba(79,70,229,0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#4f46e5",
        pointRadius: 5,
      },
      {
        label: "Q&A Received",
        data: analytics.line_questions,
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "#10b981",
        pointRadius: 5,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: { usePointStyle: true, padding: 20 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 },
        grid: { color: "#f1f5f9" },
      },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="lb-wrapper">

      {/* ── HEADER ── */}
      <div className="lb-header">
        <div>
          <h2 className="lb-title">📊 Author Analytics</h2>
          <p className="lb-subtitle">Your complete activity overview</p>
        </div>
        <div className="lb-badge">@{username}</div>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="lb-cards">
        {STAT_CARDS.map((card) => (
          <div className="lb-card" key={card.key}>
            <div className="lb-card-icon" style={{ background: card.color + "18" }}>
              <span style={{ fontSize: "26px" }}>{card.icon}</span>
            </div>
            <div className="lb-card-info">
              <p className="lb-card-value" style={{ color: card.color }}>
                {analytics[card.key] ?? 0}
              </p>
              <p className="lb-card-label">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── BAR CHART ── */}
      <div className="lb-chart-box">
        <h3 className="lb-chart-title">📊 Activity Overview</h3>
        <p className="lb-chart-sub">All-time totals across your content</p>
        <Bar data={barData} options={barOptions} />
      </div>

      {/* ── LINE CHART ── */}
      <div className="lb-chart-box">
        <h3 className="lb-chart-title">📈 Growth Trend (Last 6 Months)</h3>
        <p className="lb-chart-sub">Monthly uploads vs Q&A activity</p>
        <Line data={lineData} options={lineOptions} />
      </div>

    </div>
  );
}