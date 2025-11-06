import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/universal.css';
import '../styles/admin_dashboard.css';
import ManageImpactStories from './admin/ManageImpactStories';

const Admin_Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('organizations');
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Organizations state
  const [organizations, setOrganizations] = useState([]);
  const [pendingOrganizations, setPendingOrganizations] = useState([]);
  const [approvalCredentials, setApprovalCredentials] = useState(null);

  // Events state
  const [events, setEvents] = useState([]);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    mode: 'offline',
    max_participants: '',
    registration_deadline: ''
  });

  // Students state
  const [students, setStudents] = useState([]);

  const API_BASE = 'http://localhost:8000/api';

  // Get auth token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Fetch pending organizations
  const fetchPendingOrganizations = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/pending-organizations`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPendingOrganizations(data.data || []);
      } else {
        const err = await response.json().catch(() => ({}));
        console.error('Error fetching pending organizations:', err.message || response.statusText);
      }
    } catch (error) {
      console.error('Error fetching pending organizations:', error);
    }
  };

  // Fetch all organizations
  const fetchAllOrganizations = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/organizations`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.data || []);
      } else {
        const err = await response.json().catch(() => ({}));
        console.error('Error fetching organizations:', err.message || response.statusText);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  // Fetch all events
  const fetchAllEvents = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/events`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setEvents(data.data || []);
      } else {
        const err = await response.json().catch(() => ({}));
        console.error('Error fetching events:', err.message || response.statusText);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Fetch all students
  const fetchAllStudents = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/students`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data.data || []);
      } else {
        const err = await response.json().catch(() => ({}));
        console.error('Error fetching students:', err.message || response.statusText);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  // Approve organization
  const approveOrganization = async (requestId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/approve-organization`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requestId })
      });

      if (response.ok) {
        const data = await response.json();
        // Map backend response to UI-needed shape
        const d = data.data || {};
        setApprovalCredentials({
          organization: d.organizationName || 'Organization',
          username: d.username,
          password: d.password
        });
        fetchPendingOrganizations();
        fetchAllOrganizations();
        alert('✅ Organization approved successfully!');
      } else {
        const error = await response.json();
        alert(`❌ Failed to approve organization: ${error.message}`);
      }
    } catch (error) {
      console.error('Error approving organization:', error);
      alert('❌ Error approving organization');
    } finally {
      setIsLoading(false);
    }
  };

  // Reject organization
  const rejectOrganization = async (requestId, reason) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/reject-organization`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requestId, reason })
      });

      if (response.ok) {
        fetchPendingOrganizations();
        alert('Organization rejected successfully');
      } else {
        const error = await response.json();
        alert(`❌ Failed to reject organization: ${error.message}`);
      }
    } catch (error) {
      console.error('Error rejecting organization:', error);
      alert('❌ Error rejecting organization');
    } finally {
      setIsLoading(false);
    }
  };

  // Create global event
  const createGlobalEvent = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/admin/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventForm)
      });

      if (response.ok) {
        alert('✅ Global event created successfully!');
        setEventForm({
          title: '',
          description: '',
          date: '',
          time: '',
          location: '',
          mode: 'offline',
          max_participants: '',
          registration_deadline: ''
        });
        fetchAllEvents();
      } else {
        const error = await response.json();
        alert(`❌ Failed to create event: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating event:', error);
      alert('❌ Error creating event');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle event form input changes
  const handleEventInputChange = (e) => {
    const { name, value } = e.target;
    setEventForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Copy credentials to clipboard
  const copyCredentials = (credentials) => {
    const text = `Username: ${credentials.username}\nPassword: ${credentials.password}`;
    navigator.clipboard.writeText(text);
    alert('📋 Credentials copied to clipboard!');
  };

  // Load data based on active tab
  useEffect(() => {
    switch (activeTab) {
      case 'organizations':
        fetchPendingOrganizations();
        fetchAllOrganizations();
        break;
      case 'events':
        fetchAllEvents();
        break;
      case 'students':
        fetchAllStudents();
        break;
      default:
        break;
    }
  }, [activeTab]);

  return (
    <div className="admin-dashboard">
      {/* Global Navbar (same as other pages) */}
      <header>
        <nav className="navbar">
          <div className="logo">
            Career<span>Nest</span>
          </div>
          <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
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
              <Link to="/impact-stories" onClick={() => setMenuOpen(false)}>Impact Stories</Link>
            </li>
            <li>
              <Link to="/Role" className="btn" onClick={() => setMenuOpen(false)}>
                Logout
              </Link>
            </li>
          </ul>
          <div
            className="menu-toggle"
            onClick={() => setMenuOpen(prev => !prev)}
          >
            <i className="fas fa-bars">☰</i>
          </div>
        </nav>
      </header>

      {/* Page Header (Admin specific) */}
      <div className="admin-header">
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h1>🛡️ Admin Dashboard</h1>
                <p>Career Nest Platform Management</p>
              </div>
              <div>
                <button
                  className="btn primary"
                  onClick={() => {
                    setActiveTab('impact');
                    // Focus the title input in the embedded ManageImpactStories form
                    setTimeout(() => {
                      const el = document.getElementById('impact-title-input');
                      if (el) {
                        el.focus();
                        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 200);
                  }}
                >
                  ➕ Add New Impact Story
                </button>
              </div>
            </div>
      </div>

      <nav className="admin-nav">
        <button 
          className={activeTab === 'organizations' ? 'active' : ''} 
          onClick={() => setActiveTab('organizations')}
        >
          🏢 Organizations
        </button>
        <button 
          className={activeTab === 'impact' ? 'active' : ''}
          onClick={() => setActiveTab('impact')}
        >
          📚 Impact Stories
        </button>
        <button 
          className={activeTab === 'events' ? 'active' : ''} 
          onClick={() => setActiveTab('events')}
        >
          📅 Global Events
        </button>
        <button 
          className={activeTab === 'students' ? 'active' : ''} 
          onClick={() => setActiveTab('students')}
        >
          🎓 Students
        </button>
        <button 
          className="courses-nav-btn"
          onClick={() => navigate('/courses')}
        >
          📚 Courses
        </button>
      </nav>

      <main className="admin-content">
        {/* Organizations Tab */}
        {activeTab === 'organizations' && (
          <div className="organizations-section">
            <h2>Organization Management</h2>

            {/* Pending Approvals */}
            <div className="pending-approvals">
              <h3>📋 Pending Approvals ({pendingOrganizations.length})</h3>
              {pendingOrganizations.length === 0 ? (
                <p className="no-data">No pending organization requests</p>
              ) : (
                <div className="requests-grid">
                  {pendingOrganizations.map(org => (
                    <div key={org.id} className="request-card">
                      <div className="request-header">
                        <h4>{org.organization_name}</h4>
                        <span className="status pending">Pending</span>
                      </div>
                      <div className="request-details">
                        <p><strong>Contact:</strong> {org.contact_person}</p>
                        <p><strong>Email:</strong> {org.email}</p>
                        <p><strong>Phone:</strong> {org.phone}</p>
                        <p><strong>Website:</strong> 
                          {org.website && (
                            <a href={org.website} target="_blank" rel="noopener noreferrer">
                              {org.website}
                            </a>
                          )}
                        </p>
                        <p><strong>Description:</strong> {org.description}</p>
                        <p><strong>Address:</strong> {org.address}</p>
                      </div>
                      <div className="request-actions">
                        <button 
                          className="approve-btn"
                          onClick={() => approveOrganization(org.id)}
                          disabled={isLoading}
                        >
                          ✅ Approve
                        </button>
                        <button 
                          className="reject-btn"
                          onClick={() => {
                            const reason = prompt('Enter rejection reason:');
                            if (reason) rejectOrganization(org.id, reason);
                          }}
                          disabled={isLoading}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Generated Credentials Modal */}
            {approvalCredentials && (
              <div className="credentials-modal">
                <div className="credentials-content">
                  <h3>🔐 Generated Credentials</h3>
                  <div className="credentials-info">
                    <p><strong>Organization:</strong> {approvalCredentials.organization}</p>
                    <p><strong>Username:</strong> <code>{approvalCredentials.username}</code></p>
                    <p><strong>Password:</strong> <code>{approvalCredentials.password}</code></p>
                  </div>
                  <div className="credentials-actions">
                    <button 
                      className="copy-btn"
                      onClick={() => copyCredentials(approvalCredentials)}
                    >
                      📋 Copy Credentials
                    </button>
                    <button 
                      className="close-btn"
                      onClick={() => setApprovalCredentials(null)}
                    >
                      Close
                    </button>
                  </div>
                  <p className="credentials-note">
                    ⚠️ Please share these credentials with the organization securely. 
                    They will not be shown again.
                  </p>
                </div>
              </div>
            )}

            {/* Approved Organizations */}
            <div className="approved-organizations">
              <h3>🏢 All Organizations ({organizations.length})</h3>
              {organizations.length === 0 ? (
                <p className="no-data">No organizations found</p>
              ) : (
                <div className="organizations-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Organization</th>
                        <th>Contact Person</th>
                        <th>Email</th>
                        <th>Username</th>
                        <th>Status</th>
                        <th>Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {organizations.map(org => (
                        <tr key={org.id}>
                          <td>{org.name || org.organization_name}</td>
                          <td>{org.contact_person || 'N/A'}</td>
                          <td>{org.email}</td>
                          <td><code>{org.username}</code></td>
                          <td>
                            <span className={`status ${org.status || 'active'}`}>
                              {org.status || 'Active'}
                            </span>
                          </td>
                          <td>{new Date(org.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'impact' && (
          <div className="organizations-section">
            <ManageImpactStories embedded={true} />
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="events-section">
            <h2>Global Events Management</h2>

            {/* Create Global Event Form */}
            <div className="create-event-form">
              <h3>🌍 Create Global Event</h3>
              <form onSubmit={createGlobalEvent}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="title">Event Title *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={eventForm.title}
                      onChange={handleEventInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="mode">Mode *</label>
                    <select
                      id="mode"
                      name="mode"
                      value={eventForm.mode}
                      onChange={handleEventInputChange}
                      required
                    >
                      <option value="offline">Offline</option>
                      <option value="online">Online</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="description">Description *</label>
                  <textarea
                    id="description"
                    name="description"
                    value={eventForm.description}
                    onChange={handleEventInputChange}
                    required
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="date">Event Date *</label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={eventForm.date}
                      onChange={handleEventInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="time">Event Time *</label>
                    <input
                      type="time"
                      id="time"
                      name="time"
                      value={eventForm.time}
                      onChange={handleEventInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="location">Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={eventForm.location}
                      onChange={handleEventInputChange}
                      placeholder="Event venue or online platform"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="max_participants">Max Participants</label>
                    <input
                      type="number"
                      id="max_participants"
                      name="max_participants"
                      value={eventForm.max_participants}
                      onChange={handleEventInputChange}
                      min="1"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="registration_deadline">Registration Deadline</label>
                  <input
                    type="datetime-local"
                    id="registration_deadline"
                    name="registration_deadline"
                    value={eventForm.registration_deadline}
                    onChange={handleEventInputChange}
                  />
                </div>

                <button type="submit" className="create-event-btn" disabled={isLoading}>
                  {isLoading ? '⏳ Creating...' : '🌍 Create Global Event'}
                </button>
              </form>
            </div>

            {/* All Events List */}
            <div className="all-events">
              <h3>📅 All Events ({events.length})</h3>
              {events.length === 0 ? (
                <p className="no-data">No events found</p>
              ) : (
                <div className="events-grid">
                  {events.map(event => (
                    <div key={event.id} className="event-card">
                      <div className="event-header">
                        <h4>{event.title}</h4>
                        <div className="event-badges">
                          {event.is_global && <span className="badge global">🌍 Global</span>}
                          <span className={`badge mode-${event.mode}`}>
                            {event.mode === 'online' ? '💻' : event.mode === 'offline' ? '🏢' : '🔄'} 
                            {event.mode}
                          </span>
                        </div>
                      </div>
                      <p className="event-description">{event.description}</p>
                      <div className="event-details">
                        <p><strong>📅 Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                        <p><strong>⏰ Time:</strong> {event.time}</p>
                        {event.location && <p><strong>📍 Location:</strong> {event.location}</p>}
                        <p><strong>👥 Participants:</strong> {event.current_participants || 0} / {event.max_participants || '∞'}</p>
                        <p><strong>📊 Created by:</strong> {event.created_by_type || 'Admin'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <div className="students-section">
            <h2>Students Management</h2>
            
            <div className="students-stats">
              <div className="stat-card">
                <h3>{students.length}</h3>
                <p>Total Students</p>
              </div>
              <div className="stat-card">
                <h3>{students.filter(s => s.status === 'active').length}</h3>
                <p>Active Students</p>
              </div>
            </div>

            {students.length === 0 ? (
              <p className="no-data">No students found</p>
            ) : (
              <div className="students-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Username</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Events Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id}>
                        <td>{student.name || 'N/A'}</td>
                        <td>{student.email}</td>
                        <td><code>{student.username}</code></td>
                        <td>
                          <span className={`status ${student.status || 'active'}`}>
                            {student.status || 'Active'}
                          </span>
                        </td>
                        <td>{new Date(student.created_at).toLocaleDateString()}</td>
                        <td>{student.events_count || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin_Dashboard;
