import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/donor_dashboard.css';

// Create Event Form Component
const CreateEventForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'workshop',
    start_date: '',
    end_date: '',
    venue: '',
    max_participants: '',
    requirements: '',
    prizes: '',
    registration_deadline: '',
    visibility: 'public'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate dates
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    const regDeadline = new Date(formData.registration_deadline);
    const today = new Date();

    if (startDate <= today) {
      alert('Start date must be in the future');
      return;
    }

    if (endDate < startDate) {
      alert('End date must be after start date');
      return;
    }

    if (regDeadline >= startDate) {
      alert('Registration deadline must be before the event start date');
      return;
    }

    onSubmit(formData);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'workshop',
      start_date: '',
      end_date: '',
      venue: '',
      max_participants: '',
      requirements: '',
      prizes: '',
      registration_deadline: '',
      visibility: 'public'
    });
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label>Event Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Enter event title"
          />
        </div>
        <div className="form-group">
          <label>Event Type *</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="workshop">Workshop</option>
            <option value="seminar">Seminar</option>
            <option value="hackathon">Hackathon</option>
            <option value="coding">Coding Competition</option>
            <option value="quiz">Quiz</option>
            <option value="conference">Conference</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows="4"
          placeholder="Describe your event..."
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Start Date *</label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>End Date *</label>
          <input
            type="date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Venue *</label>
          <input
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            required
            placeholder="Event venue"
          />
        </div>
        <div className="form-group">
          <label>Max Participants *</label>
          <input
            type="number"
            name="max_participants"
            value={formData.max_participants}
            onChange={handleChange}
            required
            min="1"
            placeholder="Maximum participants"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Registration Deadline *</label>
        <input
          type="date"
          name="registration_deadline"
          value={formData.registration_deadline}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label>Requirements</label>
        <textarea
          name="requirements"
          value={formData.requirements}
          onChange={handleChange}
          rows="3"
          placeholder="Any requirements or prerequisites..."
        />
      </div>

      <div className="form-group">
        <label>Prizes</label>
        <textarea
          name="prizes"
          value={formData.prizes}
          onChange={handleChange}
          rows="3"
          placeholder="Prize information..."
        />
      </div>

      <div className="form-group">
        <label>Event Visibility *</label>
        <div className="radio-group">
          <label className="radio-option">
            <input
              type="radio"
              name="visibility"
              value="public"
              checked={formData.visibility === 'public'}
              onChange={handleChange}
            />
            <span>🌐 Public (Requires organization approval)</span>
          </label>
          <label className="radio-option">
            <input
              type="radio"
              name="visibility"
              value="private"
              checked={formData.visibility === 'private'}
              onChange={handleChange}
            />
            <span>🔒 Private (Generates invite code)</span>
          </label>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={resetForm} className="btn-secondary">
          Reset
        </button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </div>
    </form>
  );
};

const StudentDashboard = () => {
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [events, setEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [createdEvents, setCreatedEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventCode, setEventCode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      navigate('/Role');
    }
    
    // Load student-specific data
    loadStudentData();
    loadCreatedEvents();
  }, [navigate]);

  const loadStudentData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Load announcements visible to this student
      const announcementsResponse = await fetch('/api/student/announcements', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (announcementsResponse.ok) {
        const announcementsData = await announcementsResponse.json();
        setAnnouncements(announcementsData.data || []);
      }

      // Load events available to this student
      const eventsResponse = await fetch('/api/student/events', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (eventsResponse.ok) {
        const eventsData = await eventsResponse.json();
        setEvents(eventsData.data || []);
      }

      // Load registered events
      const registeredResponse = await fetch('/api/student/registered-events', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (registeredResponse.ok) {
        const registeredData = await registeredResponse.json();
        setRegisteredEvents(registeredData.data || []);
      }

    } catch (error) {
      console.error('Error loading student data:', error);
      // Fallback to mock data if API fails
      loadMockData();
    }
  };

  const loadMockData = () => {
    // Fallback mock data
    setAnnouncements([
      {
        id: 1,
        title: 'Welcome to TechCorp Internship Program',
        content: 'We are excited to announce the start of our internship program.',
        priority: 'high',
        created_at: new Date().toISOString(),
        author: 'TechCorp HR'
      }
    ]);

    setEvents([
      {
        id: 1,
        title: 'TechCorp Annual Hackathon 2025',
        description: 'Join our flagship hackathon event.',
        type: 'hackathon',
        start_date: '2025-12-15',
        end_date: '2025-12-17',
        venue: 'TechCorp Campus',
        max_participants: 100,
        registeredCount: 45
      }
    ]);
  };

  // Load student's created events
  const loadCreatedEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student/created-events', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCreatedEvents(data.data || []);
      }
    } catch (error) {
      console.error('Error loading created events:', error);
    }
  };

  // Create new event
  const handleCreateEvent = async (eventData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student/create-event', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ ${data.message}`);
        setShowEventModal(false);
        loadCreatedEvents(); // Reload created events
        if (eventData.visibility === 'public') {
          alert('📋 Your public event has been submitted for approval by your organization.');
        }
      } else {
        alert(`❌ Event creation failed: ${data.message}`);
      }
    } catch (error) {
      alert('❌ Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  // Join private event using code
  const handleJoinPrivateEvent = async () => {
    if (!eventCode.trim()) {
      alert('Please enter an event code');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/student/join-private-event', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventCode: eventCode.trim().toUpperCase() })
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ ${data.message}`);
        setEventCode('');
        loadStudentData(); // Reload to show new registered event
      } else {
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      alert('❌ Failed to join private event');
    } finally {
      setLoading(false);
    }
  };

  const handleEventRegistration = async (eventId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/organization/register-event', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventId })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Successfully registered for the event!');
        loadStudentData(); // Reload data to update registration status
      } else {
        alert(`❌ Registration failed: ${data.message}`);
      }
    } catch (error) {
      alert('❌ Failed to register for event');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const isEventRegistered = (eventId) => {
    return registeredEvents.some(regEvent => regEvent.event_id === eventId || regEvent.id === eventId);
  };

  return (
    <div className="student-dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="logo">
            Career<span>Nest</span>
          </div>
          <div className="header-right">
            <span className="welcome-text">Welcome, {user?.username}</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="dashboard-nav">
        <button 
          className={`nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`nav-tab ${activeTab === 'announcements' ? 'active' : ''}`}
          onClick={() => setActiveTab('announcements')}
        >
          📢 Announcements
        </button>
        <button 
          className={`nav-tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          🎉 Available Events
        </button>
        <button 
          className={`nav-tab ${activeTab === 'create-event' ? 'active' : ''}`}
          onClick={() => setActiveTab('create-event')}
        >
          ➕ Create Event
        </button>
        <button 
          className={`nav-tab ${activeTab === 'my-events' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-events')}
        >
          📅 My Events
        </button>
        <button 
          className={`nav-tab ${activeTab === 'join-private' ? 'active' : ''}`}
          onClick={() => setActiveTab('join-private')}
        >
          🔐 Join Private Event
        </button>
        <button 
          className={`nav-tab ${activeTab === 'registered' ? 'active' : ''}`}
          onClick={() => setActiveTab('registered')}
        >
          📝 My Registrations
        </button>
        <button 
          className="nav-tab"
          onClick={() => navigate('/courses')}
        >
          📚 Courses
        </button>
      </nav>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-content">
            <h2>Dashboard Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">{announcements.length}</div>
                <div className="stat-label">New Announcements</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{events.length}</div>
                <div className="stat-label">Available Events</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{registeredEvents.length}</div>
                <div className="stat-label">My Registrations</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">85%</div>
                <div className="stat-label">Profile Completion</div>
              </div>
            </div>

            <div className="recent-activities">
              <h3>Recent Updates</h3>
              <div className="activity-list">
                {announcements.slice(0, 3).map(announcement => (
                  <div key={announcement.id} className="activity-item">
                    <span className="activity-icon">📢</span>
                    <span>{announcement.title}</span>
                    <span className="activity-time">
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {events.slice(0, 2).map(event => (
                  <div key={event.id} className="activity-item">
                    <span className="activity-icon">🎉</span>
                    <span>New event: {event.title}</span>
                    <span className="activity-time">
                      {new Date(event.start_date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === 'announcements' && (
          <div className="announcements-content">
            <div className="section-header">
              <h2>Organization Announcements</h2>
            </div>

            <div className="announcements-list">
              {announcements.length > 0 ? announcements.map(announcement => (
                <div key={announcement.id} className="announcement-card">
                  <div className="announcement-header">
                    <h3>{announcement.title}</h3>
                    <span className={`priority ${announcement.priority}`}>
                      {announcement.priority}
                    </span>
                  </div>
                  <p className="announcement-content">{announcement.content}</p>
                  <div className="announcement-footer">
                    <span>By {announcement.author}</span>
                    <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              )) : (
                <div className="no-data">
                  <p>No announcements available at the moment.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="events-content">
            <div className="section-header">
              <h2>Available Events</h2>
            </div>

            <div className="events-grid">
              {events.length > 0 ? events.map(event => (
                <div key={event.id} className="event-card">
                  <div className="event-header">
                    <h3>{event.title}</h3>
                    <span className="event-type">{event.type}</span>
                  </div>
                  <p className="event-description">{event.description}</p>
                  <div className="event-details">
                    <div className="event-detail">
                      <strong>Date:</strong> {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                    </div>
                    <div className="event-detail">
                      <strong>Venue:</strong> {event.venue}
                    </div>
                    <div className="event-detail">
                      <strong>Participants:</strong> {event.registeredCount || 0}/{event.max_participants}
                    </div>
                  </div>
                  <div className="event-actions">
                    {isEventRegistered(event.id) ? (
                      <button className="btn-registered" disabled>
                        ✅ Registered
                      </button>
                    ) : (
                      <button 
                        className="btn-register"
                        onClick={() => handleEventRegistration(event.id)}
                        disabled={loading}
                      >
                        {loading ? 'Registering...' : 'Register Now'}
                      </button>
                    )}
                    <button className="btn-details">View Details</button>
                  </div>
                </div>
              )) : (
                <div className="no-data">
                  <p>No events available at the moment.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Create Event Tab */}
        {activeTab === 'create-event' && (
          <div className="create-event-content">
            <div className="section-header">
              <h2>Create New Event</h2>
            </div>

            <div className="create-event-form">
              <CreateEventForm onSubmit={handleCreateEvent} loading={loading} />
            </div>
          </div>
        )}

        {/* My Events Tab */}
        {activeTab === 'my-events' && (
          <div className="my-events-content">
            <div className="section-header">
              <h2>My Created Events</h2>
              <button 
                className="btn-primary"
                onClick={() => setActiveTab('create-event')}
              >
                ➕ Create New Event
              </button>
            </div>

            <div className="events-grid">
              {createdEvents.length > 0 ? createdEvents.map(event => (
                <div key={event.id} className="event-card">
                  <div className="event-header">
                    <h3>{event.title}</h3>
                    <div className="event-meta">
                      <span className="event-type">{event.type}</span>
                      <span className={`event-status ${event.approval_status}`}>
                        {event.approval_status}
                      </span>
                      {event.visibility === 'private' && (
                        <span className="event-visibility">🔒 Private</span>
                      )}
                    </div>
                  </div>
                  <p className="event-description">{event.description}</p>
                  <div className="event-details">
                    <div className="event-detail">
                      <strong>Date:</strong> {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                    </div>
                    <div className="event-detail">
                      <strong>Venue:</strong> {event.venue}
                    </div>
                    <div className="event-detail">
                      <strong>Participants:</strong> {event.registered_count || 0}/{event.max_participants}
                    </div>
                    {event.event_code && (
                      <div className="event-detail">
                        <strong>Event Code:</strong> <code>{event.event_code}</code>
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="no-data">
                  <p>You haven't created any events yet.</p>
                  <button 
                    className="btn-primary" 
                    onClick={() => setActiveTab('create-event')}
                  >
                    Create Your First Event
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Join Private Event Tab */}
        {activeTab === 'join-private' && (
          <div className="join-private-content">
            <div className="section-header">
              <h2>Join Private Event</h2>
            </div>

            <div className="join-private-form">
              <div className="form-group">
                <label>Event Code</label>
                <input
                  type="text"
                  value={eventCode}
                  onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                  placeholder="Enter 6-character event code"
                  maxLength="8"
                />
              </div>
              <button 
                className="btn-primary"
                onClick={handleJoinPrivateEvent}
                disabled={loading || !eventCode.trim()}
              >
                {loading ? 'Joining...' : 'Join Event'}
              </button>
              <div className="help-text">
                <p>Enter the event code provided by the event creator to join a private event.</p>
              </div>
            </div>
          </div>
        )}

        {/* My Registrations Tab */}
        {activeTab === 'registered' && (
          <div className="registered-content">
            <div className="section-header">
              <h2>My Event Registrations</h2>
            </div>

            <div className="registered-list">
              {registeredEvents.length > 0 ? registeredEvents.map(registration => (
                <div key={registration.id} className="registration-card">
                  <div className="registration-header">
                    <h3>{registration.title || registration.event_title}</h3>
                    <span className="registration-status">Registered</span>
                  </div>
                  <div className="registration-details">
                    <p><strong>Registration Date:</strong> {new Date(registration.registration_date).toLocaleDateString()}</p>
                    <p><strong>Event Date:</strong> {new Date(registration.start_date).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> {registration.status}</p>
                  </div>
                </div>
              )) : (
                <div className="no-data">
                  <p>You haven't registered for any events yet.</p>
                  <button 
                    className="btn-primary" 
                    onClick={() => setActiveTab('events')}
                  >
                    Browse Events
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;
