import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import Connect from "./pages/Connect";
import Reference from "./pages/Reference";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ExploreCertification from "./pages/ExploreCertification";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/connect" element={<Connect />} />
      <Route path="/reference" element={<Reference />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/explore-certification" element={<ExploreCertification />} />
    </Routes>
  );
}

export default App;