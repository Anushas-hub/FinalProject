import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import Connect from "./pages/Connect";
import Reference from "./pages/Reference";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ExploreCertification from "./pages/ExploreCertification";
import StudentDashboard from "./pages/StudentDashboard";
import HomeStudyMaterial from "./pages/HomeStudyMaterial";
import AuthorDashboard from "./pages/AuthorDashboard";
import PreviousYearQuestions from "./pages/PreviousYearQuestions"; 
import TopicContent from "./pages/TopicContent";

function App() {
  return (
    <Routes>
      <Route path="/study-material/:id" element={<TopicContent />} />
      <Route path="/previous-year-questions" element={<PreviousYearQuestions />} />
      <Route path="/author-dashboard" element={<AuthorDashboard />} />
      <Route path="/" element={<Home />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/connect" element={<Connect />} />
      <Route path="/reference" element={<Reference />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/explore-certification" element={<ExploreCertification />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      
      {/* NEW ROUTE */}
      <Route path="/study-material" element={<HomeStudyMaterial />} />
    </Routes>
  );
}

export default App;