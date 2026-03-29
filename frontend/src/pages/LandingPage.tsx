import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LandingNavbar from "../components/LandingNavbar";
import CircularGallery from "../components/CircularGallery";
import { useLanguage } from "../contexts/LanguageContext";

function Typewriter({ text, speed = 40 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      index++;
      setDisplayedText(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(timer);
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed]);

  return <>{displayedText}</>;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const galleryItems = [
    { image: '/ai care.jpg', text: t("gallery.1") },
    { image: '/Data privacy.webp', text: t("gallery.2") },
    { image: '/instant filling.avif', text: t("gallery.3") },
    { image: '/secure storage.avif', text: t("gallery.4") },
    { image: '/voice ai.jpg', text: t("gallery.5") },
    { image: '/legal accuracy.jfif', text: t("gallery.6") }
  ];

  return (
    <main className="landing-page-root">
      {/* Navigation */}
      <LandingNavbar />

      {/* Hero Section */}
      <section className="landing-hero-container">
        <div className="hero-grid">
          <div className="hero-text-content">
            <h1><Typewriter text={t("hero.title")} speed={60} /></h1>
            <p className="hero-quote" style={{ whiteSpace: "pre-wrap" }}>
              {t("hero.quote")}
            </p>
            <button className="hero-action-btn" onClick={() => navigate("/complaint")}>
              {t("hero.btn")}
            </button>
          </div>
          <div className="hero-logo-content">
            <img
              src="/police_logo_v4.png"
              alt="Ananthapuramu Police 3D Emblem"
              className="hero-emblem"
            />
          </div>
        </div>
      </section>

      {/* Scroll Banner Section */}
      <section className="scroll-banner-section">
        <h3>{t("banner.heading")}</h3>
        <div className="scroll-banner-wrapper">
          <div className="scroll-banner-content">
            <span className="scroll-text">{t("banner.text")}</span>
          </div>
          <div className="scroll-banner-content" aria-hidden="true">
            <span className="scroll-text">{t("banner.text")}</span>
          </div>
        </div>
      </section>

      {/* Access Cards Section */}
      <section className="access-section">
        <div className="access-grid">
          {/* Citizens Card */}
          <div className="access-card">
            <div className="card-icon-container">👥</div>
            <h3>{t("card.citizen.title")}</h3>
            <p>{t("card.citizen.desc")}</p>
            <button
              className="card-button citizen"
              onClick={() => navigate("/complaint")}
            >
              {t("card.citizen.btn")}
            </button>
          </div>

          {/* Law Enforcement Card */}
          <div className="access-card">
            <div className="card-icon-container">👮</div>
            <h3>{t("card.police.title")}</h3>
            <p>{t("card.police.desc")}</p>
            <button
              className="card-button police"
              onClick={() => navigate("/login")}
            >
              {t("card.police.btn")}
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-wrap" id="about">
        <div className="about-head">
          <h2>{t("about.title")}</h2>
          <p>{t("about.desc")}</p>
        </div>

        {/* Interactive sideways scrolling gallery without excessive vertical gaps */}
        <div style={{ width: '100vw', margin: '0 calc(-50vw + 50%)', position: 'relative', overflow: 'hidden' }}>
          <CircularGallery
            items={galleryItems}
            textColor="#0f172a"
            font="bold 28px Inter"
            speed={40} // Consistent speed parameter passing
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <img src="/police_logo_v4.png" alt="Ananthapuramu Police Logo" width="35" />
            <h3>{t("footer.title")}</h3>
          </div>

          <div className="footer-links">
            <a href="#" onClick={(e) => e.preventDefault()}>{t("footer.privacy")}</a>
            <a href="#" onClick={(e) => e.preventDefault()}>{t("footer.terms")}</a>
            <a href="#" onClick={(e) => e.preventDefault()}>{t("footer.support")}</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{t("footer.bottom")}</p>
        </div>
      </footer>
    </main>
  );
}
