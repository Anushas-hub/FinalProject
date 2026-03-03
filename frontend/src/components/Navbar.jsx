import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    setUser(localStorage.getItem("user"));
    setRole(localStorage.getItem("role"));
  }, []);

  const goToDashboard = () => {
    if (role === "student") navigate("/student-dashboard");
    else if (role === "author") navigate("/author-dashboard");
  };

  return (
    <div className="navbar">
      <div className="nav-left">
        <h2>SmartStudy</h2>
      </div>

      <div className="nav-center">
        <Link to="/">Home</Link>
        <Link to="/study-material">Study Material</Link>
        <Link to="/previous-year-questions">Previous Year Question Papers</Link>
      </div>

      <div className="nav-right">
        {!user ? (
          <Link to="/login" className="nav-btn">
            Login / Signup
          </Link>
        ) : (
          <button onClick={goToDashboard} className="dashboard-btn">
            Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;