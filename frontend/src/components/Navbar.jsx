import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";
import logo from "../assets/logo.png";

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
      
      {/* LOGO + SMARTSTUDY CLICKABLE HOME */}
      <NavLink to="/" className="nav-left" style={{ textDecoration: "none" }}>
        <img src={logo} alt="SmartStudy Logo" className="logo" />
        <h2>SmartStudy</h2>
      </NavLink>

      <div className="nav-center">
        <NavLink 
          to="/" 
          className={({ isActive }) => isActive ? "active-link" : ""}
        >
          Home
        </NavLink>

        <NavLink 
          to="/study-material"
          className={({ isActive }) => isActive ? "active-link" : ""}
        >
          Study Material
        </NavLink>

        <NavLink 
          to="/previous-year-questions"
          className={({ isActive }) => isActive ? "active-link" : ""}
        >
          Previous Year Question Papers
        </NavLink>
      </div>

      <div className="nav-right">
        {!user ? (
          <NavLink to="/login" className="nav-btn">
            Login / Signup
          </NavLink>
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