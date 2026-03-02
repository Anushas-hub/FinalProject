import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />

      {/* Body section – backend data will come here later */}
      <div style={{ minHeight: "400px" }}></div>
      
      <Footer />
    </>
  );
}