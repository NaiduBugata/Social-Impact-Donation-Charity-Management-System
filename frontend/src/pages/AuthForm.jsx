import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/universal.css';

// Custom styles for better form alignment
const formFieldStyle = {
  marginBottom: '25px',
  width: '100%'
};

const AuthForm = () => {
  const [isActive, setIsActive] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [registerData, setRegisterData] = useState({ username: '', email: '', password: '' });
  const [userRole, setUserRole] = useState('');
  const [loading, setLoading] = useState(false);
  // Initialize dark mode state from localStorage
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });
  const navigate = useNavigate();

  // Get selected role from localStorage on component mount
  React.useEffect(() => {
    const selectedRole = localStorage.getItem('selectedRole');
    if (selectedRole) {
      setUserRole(selectedRole);
    }
  }, []);

  // Apply theme to body class and persist to localStorage
  React.useEffect(() => {
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    
    try {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  }, [isDark]);

  // Role-specific configurations
  const getRoleConfig = () => {
    const configs = {
      admin: {
        icon: '👨‍💼',
        title: 'Admin',
        color: '#4299e1',
        gradient: 'linear-gradient(135deg, #4299e1 0%, #667eea 100%)',
        loginWelcome: 'ADMIN PORTAL',
        loginDesc: 'Manage platform, verify users, approve campaigns',
        registerWelcome: 'JOIN AS ADMIN',
        registerDesc: 'Get admin access to control platform operations',
        registerFields: ['username', 'email', 'password', 'adminCode']
      },
      donor: {
        icon: '💰',
        title: 'Financial Donor',
        color: '#f093fb',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        loginWelcome: 'WELCOME DONOR!',
        loginDesc: 'Donate to verified campaigns & track your impact',
        registerWelcome: 'BECOME A FINANCIAL DONOR',
        registerDesc: 'Support campaigns via UPI, card, or Razorpay. Get QR-based impact tracking.',
        registerFields: ['username', 'email', 'password', 'phone']
      },
      helper: {
        icon: '🧑‍⚕️',
        title: 'Service Donor (Helper)',
        color: '#667eea',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        loginWelcome: 'SERVICE DONOR PORTAL',
        loginDesc: 'Volunteer your skills: Doctor, Teacher, Police, or any profession',
        registerWelcome: 'BECOME A SERVICE DONOR',
        registerDesc: 'Professionals can volunteer time & expertise. Get geo-matched with nearby receivers.',
        registerFields: ['username', 'email', 'password', 'profession', 'phone', 'license']
      },
      receiver: {
        icon: '🙋',
        title: 'Receiver',
        color: '#f5576c',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        loginWelcome: 'RECEIVER PORTAL',
        loginDesc: 'Submit help requests (medical, educational, social)',
        registerWelcome: 'REGISTER AS RECEIVER',
        registerDesc: 'Submit verified requests for help. KYC required. Upload proof for fund sanction.',
        registerFields: ['username', 'email', 'password', 'phone', 'address', 'aadhar']
      },
      organization: {
        icon: '🏢',
        title: 'NGO / Organization',
        color: '#38b2ac',
        gradient: 'linear-gradient(135deg, #38b2ac 0%, #4299e1 100%)',
        loginWelcome: 'NGO PORTAL',
        loginDesc: 'Manage campaigns, create bulk requests, distribute verified assistance',
        registerWelcome: 'REGISTER YOUR NGO',
        registerDesc: 'Verified NGOs can run campaigns, manage beneficiaries, and track impact. Admin approval required.',
        registerFields: ['orgName', 'email', 'password', 'registrationNumber', 'phone', 'website']
      }
    };
    return configs[userRole] || configs.donor;
  };

  const roleConfig = getRoleConfig();

  const handleBackToRoles = () => {
    localStorage.removeItem('selectedRole');
    navigate('/Role');
  };

  const handleRegisterClick = () => setIsActive(true);
  const handleLoginClick = () => setIsActive(false);

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({ ...registerData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!userRole) {
      alert('⚠ Please select a role from the role selection page');
      navigate('/Role');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.username, // Using username field as email
          password: loginData.password
        })
      });

      const data = await response.json();

      if (data.success) {
        // Verify that the logged-in user's role matches the selected role
        if (data.user.role !== userRole) {
          alert(`❌ Login failed: Invalid credentials for ${roleConfig.title}.\n\nYou are trying to login as "${roleConfig.title}" but these credentials belong to a "${data.user.role}" account.\n\nPlease select the correct role or use the right credentials.`);
          setLoading(false);
          return;
        }

        // Store token and user in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        
        // Clear the stored role after successful login
        localStorage.removeItem('selectedRole');
        
        alert(`✅ Login successful! Welcome back, ${data.user.name}!`);
        // Navigate based on user role
        navigate(`/${data.user.role}`);
      } else {
        alert(`❌ Login failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('❌ Error during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!userRole) {
      alert('⚠ Please select a role from the role selection page');
      navigate('/Role');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registerData.username, // Using username field as name
          email: registerData.email,
          password: registerData.password,
          role: userRole
        })
      });

      const data = await response.json();

      if (data.success) {
        // Auto-login after registration
        localStorage.setItem('token', data.token);
        localStorage.setItem('currentUser', JSON.stringify(data.user));
        localStorage.removeItem('selectedRole');
        
        alert('✅ Registration successful! Welcome to Social Impact!');
        navigate(`/${data.user.role}`);
      } else {
        alert(`❌ Registration failed: ${data.message}`);
        if (data.errors) {
          data.errors.forEach(error => console.error('Validation error:', error.msg));
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('❌ Error during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Navbar */}
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
          </ul>
          
          {/* Theme Toggle Button */}
          <button
            className="theme-toggle"
            onClick={() => setIsDark((v) => !v)}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle dark mode"
          >
            {isDark ? '☀' : '🌙'}
          </button>
          
          <div
            className="menu-toggle"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            ☰
          </div>
        </nav>
      </header>

      {/* Auth Form */}
      <div className={`container ${isActive ? 'active' : ''}`}>
        <div className="curved-shape"></div>
        <div className="curved-shape2"></div>

        {/* Back Button */}
        <button 
          onClick={handleBackToRoles}
          style={{
            position: 'absolute',
            bottom: '0px',
            left: '320px',
            background: 'white',
            color: roleConfig.color,
            border: 'none',
            padding: '10px 20px',
            borderRadius: '25px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
        >
           Back to Roles
        </button>

        {/* Login Form */}
        <div className="form-box Login">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <span style={{ fontSize: '32px' }}>{roleConfig.icon}</span>
            <h2 style={{ margin: 0 }}>Login as {roleConfig.title}</h2>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-field" style={formFieldStyle}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', color: '#2c3e50', fontWeight: '600', textAlign: 'left' }}>Username</label>
              <div className="input-box">
                <input
                  type="text"
                  name="username"
                  value={loginData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  required
                />
              </div>
            </div>

            <div className="form-field" style={formFieldStyle}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', color: '#2c3e50', fontWeight: '600', textAlign: 'left' }}>Password</label>
              <div className="input-box">
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            <div className="input-box">
              <button className="btn" type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </div>

            <div className="regi-link">
              <p>
                Don't have an account?
                <a href="#" onClick={handleRegisterClick}>Sign Up</a>
              </p>
            </div>
          </form>
        </div>

        {/* Login Info
        <div className="info-content Login" style={{ background: roleConfig.gradient }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>{roleConfig.icon}</div>
          <h2>{roleConfig.loginWelcome}</h2>
          <p>{roleConfig.loginDesc}</p>
          {userRole === 'donor' && (
            <div style={{ marginTop: '20px', fontSize: '14px', opacity: 0.9 }}>
              <p>✨ Browse campaigns</p>
              <p>💝 Track your donations</p>
              <p>📊 View impact reports</p>
            </div>
          )}
          {userRole === 'helper' && (
            <div style={{ marginTop: '20px', fontSize: '14px', opacity: 0.9 }}>
              <p>🗺️ Find nearby requests</p>
              <p>🤝 Provide services</p>
              <p>⭐ Build trust score</p>
            </div>
          )}
          {userRole === 'receiver' && (
            <div style={{ marginTop: '20px', fontSize: '14px', opacity: 0.9 }}>
              <p>📝 Submit help requests</p>
              <p>📸 Upload proof documents</p>
              <p>📊 Track request status</p>
            </div>
          )}
          {userRole === 'organization' && (
            <div style={{ marginTop: '20px', fontSize: '14px', opacity: 0.9 }}>
              <p>🚀 Create campaigns</p>
              <p>👥 Manage beneficiaries</p>
              <p>📈 View analytics</p>
            </div>
          )}
          {userRole === 'admin' && (
            <div style={{ marginTop: '20px', fontSize: '14px', opacity: 0.9 }}>
              <p>✅ Approve campaigns</p>
              <p>🔐 Verify KYC</p>
              <p>💰 Sanction funds</p>
            </div>
          )}
        </div> */}

        {/* Register Form */}
        <div className="form-box Register">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <span style={{ fontSize: '32px' }}>{roleConfig.icon}</span>
            <h2 style={{ margin: 0 }}>Register as {roleConfig.title}</h2>
          </div>
          <form onSubmit={handleRegisterSubmit}>
            {userRole === 'organization' ? (
              <>
                <div className="form-field" style={formFieldStyle}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', color: '#2c3e50', fontWeight: '600', textAlign: 'left' }}>Organization Name</label>
                  <div className="input-box">
                    <input 
                      type="text" 
                      name="username"
                      value={registerData.username}
                      onChange={handleRegisterChange}
                      placeholder="E.g., Help India Foundation" 
                      required 
                    />
                  </div>
                </div>
                <div className="form-field" style={formFieldStyle}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', color: '#2c3e50', fontWeight: '600', textAlign: 'left' }}>Registration Number</label>
                  <div className="input-box">
                    <input 
                      type="text" 
                      name="registrationNumber"
                      placeholder="NGO/Trust Registration Number (Required)" 
                      required 
                    />
                  </div>
                </div>
                <div className="form-field" style={formFieldStyle}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', color: '#2c3e50', fontWeight: '600', textAlign: 'left' }}>Website (Optional)</label>
                  <div className="input-box">
                    <input 
                      type="url" 
                      name="website"
                      placeholder="www.yourngo.org" 
                    />
                  </div>
                </div>
              </>
            ) : userRole === 'helper' ? (
              <>
                <div className="form-field" style={formFieldStyle}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', color: '#2c3e50', fontWeight: '600', textAlign: 'left' }}>Full Name</label>
                  <div className="input-box">
                    <input 
                      type="text" 
                      name="username"
                      value={registerData.username}
                      onChange={handleRegisterChange}
                      placeholder="E.g., Dr. Priya Sharma" 
                      required 
                    />
                  </div>
                </div>
                <div className="form-field" style={formFieldStyle}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', color: '#2c3e50', fontWeight: '600', textAlign: 'left' }}>Profession/Specialization</label>
                  <div className="input-box">
                    <select 
                      name="profession"
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
                        border: '2px solid #e2e8f0', 
                        borderRadius: '8px',
                        fontSize: '16px',
                        background: 'white'
                      }}
                      required
                    >
                      <option value="">Select Your Profession</option>
                      <option value="doctor">Doctor / Medical Professional</option>
                      <option value="teacher">Teacher / Educator</option>
                      <option value="police">Police / Law Enforcement</option>
                      <option value="counselor">Counselor / Therapist</option>
                      <option value="social-worker">Social Worker</option>
                      <option value="engineer">Engineer / Technician</option>
                      <option value="lawyer">Lawyer / Legal Aid</option>
                      <option value="other">Other Professional</option>
                    </select>
                  </div>
                </div>
                <div className="form-field" style={formFieldStyle}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', color: '#2c3e50', fontWeight: '600', textAlign: 'left' }}>Professional License/ID (Optional)</label>
                  <div className="input-box">
                    <input 
                      type="text" 
                      name="license"
                      placeholder="Medical Council ID / Teacher ID / Badge Number" 
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="form-field" style={formFieldStyle}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', color: '#2c3e50', fontWeight: '600', textAlign: 'left' }}>
                  {userRole === 'admin' ? 'Admin Username' : 'Username'}
                </label>
                <div className="input-box">
                  <input 
                    type="text" 
                    name="username"
                    value={registerData.username}
                    onChange={handleRegisterChange}
                    placeholder="Username" 
                    required 
                  />
                </div>
              </div>
            )}
            
            <div className="form-field" style={formFieldStyle}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', color: '#2c3e50', fontWeight: '600', textAlign: 'left' }}>Email</label>
              <div className="input-box">
                <input 
                  type="email" 
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  placeholder={userRole === 'organization' ? 'organization@example.com' : 'your@email.com'} 
                  required 
                />
              </div>
            </div>
            
            {(userRole === 'donor' || userRole === 'helper' || userRole === 'receiver' || userRole === 'organization') && (
              <div className="form-field" style={formFieldStyle}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', color: '#2c3e50', fontWeight: '600', textAlign: 'left' }}>Phone Number</label>
                <div className="input-box">
                  <input 
                    type="tel" 
                    name="phone"
                    placeholder="+91 98765 43210" 
                    pattern="[0-9+\s-]+"
                    required 
                  />
                </div>
              </div>
            )}
            
            <div className="form-field" style={formFieldStyle}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', color: '#2c3e50', fontWeight: '600', textAlign: 'left' }}>Password</label>
              <div className="input-box">
                <input 
                  type="password" 
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  placeholder="Min 6 characters" 
                  required 
                  minLength="6"
                />
              </div>
            </div>
            
            {userRole === 'admin' && (
              <div className="form-field" style={formFieldStyle}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', color: '#2c3e50', fontWeight: '600', textAlign: 'left' }}>Admin Code</label>
                <div className="input-box">
                  <input 
                    type="text" 
                    name="adminCode"
                    placeholder="Enter Admin Access Code" 
                    required 
                  />
                </div>
              </div>
            )}
            
            {userRole === 'receiver' && (
              <>
                <div className="form-field" style={formFieldStyle}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', color: '#2c3e50', fontWeight: '600', textAlign: 'left' }}>Full Address</label>
                  <div className="input-box">
                    <textarea 
                      name="address"
                      placeholder="Full address for verification and KYC"
                      style={{ 
                        width: '100%', 
                        padding: '12px', 
                        border: '2px solid #e2e8f0', 
                        borderRadius: '8px',
                        fontSize: '16px',
                        minHeight: '60px',
                        fontFamily: 'inherit'
                      }}
                      required
                    />
                  </div>
                </div>
                <div className="form-field" style={formFieldStyle}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '16px', color: '#2c3e50', fontWeight: '600', textAlign: 'left' }}>Aadhar Number (KYC)</label>
                  <div className="input-box">
                    <input 
                      type="text" 
                      name="aadhar"
                      placeholder="XXXX-XXXX-XXXX (KYC Verification Required)"
                      pattern="[0-9]{4}-[0-9]{4}-[0-9]{4}"
                      maxLength="14"
                      required
                    />
                  </div>
                  <small style={{ color: '#6c757d', fontSize: '12px', opacity: 0.9 }}>
                    ℹ️ Required for KYC verification. Your data is secure and encrypted.
                  </small>
                </div>
              </>
            )}
            <div className="input-box">
              <button className="btn" type="submit" disabled={loading}>
                {loading ? 'Registering...' : 'Register'}
              </button>
            </div>
            <div className="regi-link">
              <p>
                Already have an account?
                <a href="#" onClick={handleLoginClick}>Sign In</a>
              </p>
            </div>
          </form>
        </div>

        {/* Register Info
        <div className="info-content Register" style={{ background: roleConfig.gradient }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>{roleConfig.icon}</div>
          <h2>{roleConfig.registerWelcome}</h2>
          <p>{roleConfig.registerDesc}</p>
          {userRole === 'donor' && (
            <div style={{ marginTop: '20px', fontSize: '14px', opacity: 0.9 }}>
              <p>✅ KYC verification required</p>
              <p>🎁 Tax deduction benefits</p>
              <p>🏆 Earn donor badges</p>
            </div>
          )}
          {userRole === 'helper' && (
            <div style={{ marginTop: '20px', fontSize: '14px', opacity: 0.9 }}>
              <p>🎓 Professional verification</p>
              <p>📍 Location-based matching</p>
              <p>⭐ Build reputation</p>
            </div>
          )}
          {userRole === 'receiver' && (
            <div style={{ marginTop: '20px', fontSize: '14px', opacity: 0.9 }}>
              <p>🔐 Secure verification process</p>
              <p>📸 Proof submission required</p>
              <p>✅ Admin approval needed</p>
            </div>
          )}
          {userRole === 'organization' && (
            <div style={{ marginTop: '20px', fontSize: '14px', opacity: 0.9 }}>
              <p>📄 NGO registration required</p>
              <p>✅ Verification by admin</p>
              <p>🎯 Create verified campaigns</p>
            </div>
          )}
          {userRole === 'admin' && (
            <div style={{ marginTop: '20px', fontSize: '14px', opacity: 0.9 }}>
              <p>🔐 Secure admin access</p>
              <p>👑 Full platform control</p>
              <p>📊 Analytics dashboard</p>
            </div>
          )}
        </div> */}
      </div>
    </>
  );
};

export default AuthForm;