import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Blog from "./pages/Blog";
import Connect from "./pages/Connect";
import Reference from "./pages/Reference";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import HomeStudyMaterial from "./pages/HomeStudyMaterial";
import AuthorDashboard from "./pages/AuthorDashboard";
import PreviousYearQuestions from "./pages/PreviousYearQuestions";
import TopicContent from "./pages/TopicContent";
import CertificationQuiz from "./pages/CertificationQuiz";
import ExploreCertification from "./pages/ExploreCertification";
import CertificationResults from "./pages/CertificationResults";
import CertificationCourse from "./pages/CertificationCourse";
import QuizPage from "./pages/QuizPage";
import CertificationSuccess from "./pages/CertificationSuccess";
import CertificationPreview from "./pages/CertificatePreview";
import AuthorMaterialDetail from "./pages/AuthorMaterialDetail";
import AuthorMaterialsPage from "./pages/AuthorMaterialPage";
import AuthorQuizAttempt from "./pages/Authorquizattempt"; // 🆕

function App() {
  return (
    <Routes>

      {/* CERTIFICATION FLOW */}
      <Route path="/certification-quiz/:id" element={<CertificationQuiz />} />
      <Route path="/explore-certification" element={<ExploreCertification />} />
      <Route path="/certifications" element={<CertificationResults />} />
      <Route path="/certification/:id" element={<CertificationCourse />} />
      <Route path="/quiz/:id" element={<QuizPage />} />
      <Route path="/certification/:id/success" element={<CertificationSuccess />} />
      <Route path="/certificate/:id" element={<CertificationPreview />} />

      {/* STUDY MATERIAL */}
      <Route path="/study-material/:id" element={<TopicContent />} />
      <Route path="/study-material" element={<HomeStudyMaterial />} />

      {/* AUTHOR MATERIAL */}
      <Route path="/author-material/:materialId" element={<AuthorMaterialDetail />} />
      <Route path="/author-materials" element={<AuthorMaterialsPage />} />

      {/* 🆕 AUTHOR QUIZ ATTEMPT */}
      <Route path="/author-quiz/:quizId" element={<AuthorQuizAttempt />} />

      {/* OTHER ROUTES */}
      <Route path="/previous-year-questions" element={<PreviousYearQuestions />} />
      <Route path="/author-dashboard" element={<AuthorDashboard />} />
      <Route path="/student-dashboard" element={<StudentDashboard />} />
      <Route path="/" element={<Home />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/connect" element={<Connect />} />
      <Route path="/reference" element={<Reference />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

    </Routes>
  );
}

export default App;