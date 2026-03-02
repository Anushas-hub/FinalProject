import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="nav-left">
        <h2>SmartStudy</h2>
      </div>

      <div className="nav-center">
        <Link to="/">Home</Link>
        <Link to="/study-material">Study Material</Link>
        <Link to="/pyq">Previous Year Question Papers</Link>
      </div>

      <div className="nav-right">
        <Link to="/login" className="nav-btn">
          Login / Signup
        </Link>
      </div>
    </div>
  );
};

export default Navbar;