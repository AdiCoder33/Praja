import { useNavigate } from "react-router-dom";

import Carousel from "../components/Carousel";
import Navbar from "../components/Navbar";

export default function LandingPageSimple() {
  const navigate = useNavigate();

  return (
    <main className="landing-page">
      <Carousel />
      <Navbar />

      <section className="landing-hero">
        <h1>AI Voice-Based FIR System</h1>
        <p>File your complaint instantly using voice - no login required</p>

        <button
          className="landing-fir-button"
          type="button"
          onClick={() => navigate("/complaint")}
        >
          File FIR
        </button>
      </section>
    </main>
  );
}
