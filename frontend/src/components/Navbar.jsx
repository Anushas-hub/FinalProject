import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setUser(localStorage.getItem("user"));
    setRole(localStorage.getItem("role"));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
  };

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
        <Link to="/pyq">Previous Year Question Papers</Link>
      </div>

      <div className="nav-right">
        {!user ? (
          <Link to="/login" className="nav-btn">
            Login / Signup
          </Link>
        ) : (
          <div className="profile-container" ref={dropdownRef}>
            <div
              className="profile-icon"
              onClick={() => setOpen(!open)}
            >
              {user.charAt(0).toUpperCase()}
            </div>

            {open && (
              <div className="profile-dropdown">
                <button onClick={goToDashboard}>
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="logout-btn"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;