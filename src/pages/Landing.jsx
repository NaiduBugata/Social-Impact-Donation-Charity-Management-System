import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/universal.css";

function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="main-container"> {/* Added wrapper div */}
      {/* ===== Navigation ===== */}
      <header>
        <nav className="navbar">
          <div className="logo">
            🌍 Social<span>Impact</span>
          </div>
          <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
            <li>
              <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
            </li>
            <li>
              <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
            </li>
            <li>
              <a href="#help" onClick={() => setMenuOpen(false)}>Help</a>
            </li>
            <li>
              <Link to="/Role" className="btn" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
            </li>
            {/* <li>
              <Link to="/register" className="btn primary" onClick={() => setMenuOpen(false)}>
                Sign Up
              </Link>
            </li> */}
          </ul>
          <div
            className="menu-toggle"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <i className="fas fa-bars">☰</i>
          </div>
        </nav>
      </header>

      {/* ===== Hero Section ===== */}
      <section className="hero">
        <div className="hero-content">
          <h1>🌍 Social Impact<span> Donation Platform</span></h1>
          <p>
            "Empathy meets technology — building a nation where every good deed leaves a visible footprint."
          </p>
          <p style={{ fontSize: '1.1rem', marginTop: '1rem', opacity: 0.95 }}>
            A transparent, AI-powered, geo-smart ecosystem connecting financial donors, skilled helpers (doctors, teachers, police), 
            and verified receivers through real-time, location-aware engagement.
          </p>
          <div className="hero-buttons">
            <Link to="/donate-anonymous" className="btn primary" style={{
              background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
              fontSize: '1.2rem',
              padding: '15px 40px',
              boxShadow: '0 6px 20px rgba(72, 187, 120, 0.4)',
              animation: 'pulse 2s infinite'
            }}>
              💚 Donate Anonymously (No Login!)
            </Link>
            <Link to="/Role" className="btn">
              🚀 Start Making Impact
            </Link>
            <Link to="/transparency" className="btn">
              📊 View Transparency Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Features Section ===== */}
      <section className="features" id="features">
        <h2>💫 Unique & Innovative Features</h2>
        <div className="feature-grid">
          <div className="feature">
            <i className="fas fa-hands-helping">🤝</i>
            <h3>Dual Contribution System</h3>
            <p>Donate money OR volunteer your time and skills — doctors, teachers, police can all help meaningfully.</p>
          </div>
          <div className="feature">
            <i className="fas fa-robot">🤖</i>
            <h3>AI-Powered Matching</h3>
            <p>Smart algorithms suggest causes and nearby requests tailored to your interests and location.</p>
          </div>
          <div className="feature">
            <i className="fas fa-map-marked-alt">�</i>
            <h3>Geo-Proximity Matching</h3>
            <p>Real-time geolocation connects receivers with the nearest verified donors or helpers instantly.</p>
          </div>
          <div className="feature">
            <i className="fas fa-qrcode">🔲</i>
            <h3>Anonymous QR Tracking</h3>
            <p>Donate anonymously and track your impact via unique QR code — privacy meets transparency.</p>
          </div>
          <div className="feature">
            <i className="fas fa-shield-alt">✅</i>
            <h3>Proof-Based Sanctioning</h3>
            <p>Receivers upload proof before fund release — ensuring zero misuse and complete accountability.</p>
          </div>
          <div className="feature">
            <i className="fas fa-chart-pie">📊</i>
            <h3>Transparency Dashboard</h3>
            <p>Live progress bars, fund utilization charts, and heatmaps — see exactly where every rupee goes.</p>
          </div>
          <div className="feature">
            <i className="fas fa-network-wired">�️</i>
            <h3>AI Trust Graph</h3>
            <p>Visualize social credibility — every verified action adds trust between donors, helpers, and receivers.</p>
          </div>
          <div className="feature">
            <i className="fas fa-trophy">🏆</i>
            <h3>Gamified Impact</h3>
            <p>Earn badges (Silver, Gold, Platinum), track lives impacted, and generate CSR reports for companies.</p>
          </div>
        </div>
      </section>

      {/* ===== How It Works Section ===== */}
      <section className="how-it-works">
        <h2>🚀 How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Choose Your Role</h3>
            <p>Financial Donor, Service Helper (doctor/teacher/police), Receiver, or NGO — everyone has a place.</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Complete KYC Verification</h3>
            <p>Quick verification ensures trust and transparency — upload documents and get verified by admin.</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Engage & Track Impact</h3>
            <p>Donate, volunteer, or request help — then track every action with real-time analytics and QR codes.</p>
          </div>
        </div>
      </section>

      {/* ===== Call to Action ===== */}
      <section className="cta">
        <h2>Ready to create measurable social impact?</h2>
        <Link to="/Role" className="btn primary">
          Join Now
        </Link>
      </section>

      {/* ===== Footer ===== */}
      <footer>
        <p>&copy; 2025 Social Impact Donation & Charity Management System. All rights reserved.</p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
          "Empathy meets technology — building a nation where every good deed leaves a visible footprint."
        </p>
        <div className="footer-links">
          <Link to="/transparency">Transparency</Link>
          <a href="#features">Features</a>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms & Conditions</a>
        </div>
        <div className="socials">
          <a href="#">
            <i className="fab fa-facebook">f</i>
          </a>
          <a href="#">
            <i className="fab fa-twitter">t</i>
          </a>
          <a href="#">
            <i className="fab fa-linkedin">in</i>
          </a>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;