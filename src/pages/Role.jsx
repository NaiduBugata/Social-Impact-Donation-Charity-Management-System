// RoleSelection.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/role.css';

const RoleSelection = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const roles = [
    {
      id: 'admin',
      title: '🧠 Admin',
      description: 'Full control over users, donations, and campaigns. Verify NGOs, approve requests, sanction funds.',
      icon: '👨‍💼',
      path: '/admin-login',
      requiresAuth: true
    },
    {
      id: 'donor',
      title: '💰 Financial Donor',
      description: 'Donate to verified campaigns via UPI/card. Track your impact with personalized dashboard.',
      icon: '💸',
      path: '/student-login',
      requiresAuth: true
    },
    {
      id: 'helper',
      title: '🧑‍⚕️ Service Helper',
      description: 'Volunteer your professional skills (doctor, teacher, police). Receive location-based requests nearby.',
      icon: '🤝',
      path: '/student-login',
      requiresAuth: true
    },
    {
      id: 'receiver',
      title: '🙋 Receiver',
      description: 'Submit verified help requests (medical, education, emergency). Upload proofs for fund approval.',
      icon: '🆘',
      path: '/student-login',
      requiresAuth: true
    },
    {
      id: 'ngo',
      title: '🏢 NGO / Organization',
      description: 'Manage campaigns, create bulk requests, and distribute verified assistance to communities.',
      icon: '🌍',
      path: '/organization-register',
      requiresAuth: true
    },
    {
      id: 'anonymous',
      title: '🕵️ Anonymous Donor',
      description: '💚 Donate instantly without login! No account needed. Get QR code to track your impact privately.',
      icon: '🎭',
      path: '/donate-anonymous',
      requiresAuth: false,
      highlight: true
    }
  ];

  const handleRoleSelect = (role) => {
    // Store the selected role for the specific login page
    localStorage.setItem('selectedRole', role.id);
    // Navigate to role-specific login page
    navigate(role.path);
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="role-selection-container">
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
            {/* <li>
              <Link to="/AuthForm" className="btn" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
            </li> */}
          </ul>
          <div
            className="menu-toggle"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            ☰
          </div>
        </nav>
      </header>

      <section className="role-hero">
        <div className="role-content">
          <h2>Select Your <span>Role</span></h2>
          <p><h5>Join the Social Impact ecosystem. Every role creates measurable change.</h5></p>
          
          <div className="role-grid">
            {roles.map((role) => (
              <div 
                key={role.id}
                className={`role-card ${role.highlight ? 'role-card-highlight' : ''}`}
                onClick={() => handleRoleSelect(role)}
              >
                <div className="role-icon">{role.icon}</div>
                <h3>{role.title}</h3>
                {role.highlight && (
                  <div style={{
                    backgroundColor: '#48bb78',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    marginBottom: '10px'
                  }}>
                    ⚡ NO LOGIN REQUIRED
                  </div>
                )}
                <p>{role.description}</p>
                <div className="role-select-button">
                  {role.id === 'ngo' ? 'Apply to Join' : 
                   role.id === 'anonymous' ? '🚀 Donate Now' : 
                   `Select ${role.title}`}
                </div>
                {role.id === 'ngo' && (
                  <div className="existing-org-link">
                    <small>
                      Already have credentials? 
                      <a 
                        href="#" 
                        onClick={(e) => {
                          e.stopPropagation();
                          localStorage.setItem('selectedRole', 'organization');
                          navigate('/organization-login');
                        }}
                        style={{ color: '#FF4DD2', marginLeft: '5px' }}
                      >
                        Login here
                      </a>
                    </small>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* <div className="role-buttons">
            <button className="btn" onClick={handleBack}>Back to Home</button>
          </div> */}
        </div>
      </section>

      <footer>
        <p>© 2025 ODCMS. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact Us</a>
        </div>
      </footer>
    </div>
  );
};

export default RoleSelection;