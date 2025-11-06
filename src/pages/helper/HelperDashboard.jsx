import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function HelperDashboard() {
  const [user, setUser] = useState(null);
  const [nearbyRequests, setNearbyRequests] = useState([]);
  const [myServices, setMyServices] = useState([]);
  const [stats, setStats] = useState({ accepted: 0, completed: 0, hours: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [serviceProof, setServiceProof] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'helper') {
      navigate('/Role');
      return;
    }
    setUser(currentUser);
    loadDashboard(currentUser);
  }, []);

  const loadDashboard = async (currentUser) => {
    try {
      // Fetch nearby requests based on helper's location
      const nearbyRes = await fetch('/api/requests/nearby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: currentUser.location || { lat: 28.7041, lng: 77.1025 },
          radiusKm: 25,
          category: currentUser.specialty || 'all'
        })
      });
      const nearbyData = await nearbyRes.json();
      if (nearbyData.success) {
        setNearbyRequests(nearbyData.data || []);
      }

      // Fetch helper's accepted/completed services
      const servicesRes = await fetch(`/api/services/helper/${currentUser.id}`);
      const servicesData = await servicesRes.json();
      if (servicesData.success) {
        setMyServices(servicesData.data || []);
        calculateStats(servicesData.data || []);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error loading helper dashboard:', error);
      setLoading(false);
    }
  };

  const calculateStats = (services) => {
    const accepted = services.filter(s => s.status === 'accepted').length;
    const completed = services.filter(s => s.status === 'completed').length;
    const hours = services.filter(s => s.status === 'completed')
      .reduce((sum, s) => sum + (s.hoursSpent || 0), 0);
    setStats({ accepted, completed, hours });
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const response = await fetch('/api/requests/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          helperId: user.id
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('✅ Request accepted! Receiver will be notified.');
        loadDashboard(user);
      } else {
        alert('Failed to accept request: ' + data.message);
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('An error occurred');
    }
  };

  const handleCompleteService = async (serviceId) => {
    if (!serviceProof.trim()) {
      alert('Please enter service completion proof');
      return;
    }

    try {
      const response = await fetch('/api/service/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId,
          proof: serviceProof,
          completedBy: user.id
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('✅ Service marked complete! Admin will verify.');
        setSelectedRequest(null);
        setServiceProof('');
        loadDashboard(user);
      } else {
        alert('Failed: ' + data.message);
      }
    } catch (error) {
      console.error('Error completing service:', error);
      alert('An error occurred');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <h2>🔄 Loading Helper Dashboard...</h2>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>🧑‍⚕️ Helper Dashboard</h1>
        <div style={styles.userInfo}>
          <span>{user.name} | {user.specialty || 'General Helper'}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>✅</div>
          <div>
            <div style={styles.statNumber}>{stats.accepted}</div>
            <div style={styles.statLabel}>Requests Accepted</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#48bb78'}}>🎯</div>
          <div>
            <div style={styles.statNumber}>{stats.completed}</div>
            <div style={styles.statLabel}>Services Completed</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#ed8936'}}>⏰</div>
          <div>
            <div style={styles.statNumber}>{stats.hours}</div>
            <div style={styles.statLabel}>Volunteer Hours</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#9f7aea'}}>⭐</div>
          <div>
            <div style={styles.statNumber}>{user.trustScore || 75}</div>
            <div style={styles.statLabel}>Trust Score</div>
          </div>
        </div>
      </div>

      <div style={styles.mainContent}>
        {/* Nearby Requests */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>📍 Nearby Help Requests ({nearbyRequests.length})</h2>
          {nearbyRequests.length === 0 ? (
            <p style={styles.emptyState}>No requests found in your area. Check back later!</p>
          ) : (
            <div style={styles.requestsGrid}>
              {nearbyRequests.map(request => (
                <div key={request.id} style={styles.requestCard}>
                  <div style={styles.requestHeader}>
                    <span style={styles.categoryBadge}>{request.category}</span>
                    <span style={styles.urgencyBadge}>
                      {request.urgency === 'high' ? '🔴' : request.urgency === 'medium' ? '🟠' : '🟢'} 
                      {request.urgency}
                    </span>
                  </div>
                  <h3 style={styles.requestTitle}>{request.title}</h3>
                  <p style={styles.requestDescription}>{request.description}</p>
                  <div style={styles.requestMeta}>
                    <span>📍 {request.distance ? `${request.distance.toFixed(1)} km away` : 'Nearby'}</span>
                    <span>⏰ {new Date(request.createdAt).toLocaleDateString()}</span>
                  </div>
                  {request.type === 'service' && (
                    <div style={styles.requestDetails}>
                      <p><strong>Required Skills:</strong> {request.requiredSkills?.join(', ') || user.specialty}</p>
                    </div>
                  )}
                  <button 
                    onClick={() => handleAcceptRequest(request.id)}
                    style={styles.acceptBtn}
                  >
                    🤝 Accept Request
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* My Active Services */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>📋 My Active Services ({myServices.filter(s => s.status === 'accepted').length})</h2>
          {myServices.filter(s => s.status === 'accepted').length === 0 ? (
            <p style={styles.emptyState}>No active services. Accept a request to get started!</p>
          ) : (
            <div style={styles.servicesGrid}>
              {myServices.filter(s => s.status === 'accepted').map(service => (
                <div key={service.id} style={styles.serviceCard}>
                  <h4>{service.request?.title || 'Service Request'}</h4>
                  <p>{service.request?.description}</p>
                  <div style={styles.serviceMeta}>
                    <span>Receiver: {service.receiver?.name}</span>
                    <span>Contact: {service.receiver?.phone || 'N/A'}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedRequest(service)}
                    style={styles.completeBtn}
                  >
                    ✓ Mark as Complete
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Completed Services */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>✅ Completed Services ({stats.completed})</h2>
          {myServices.filter(s => s.status === 'completed').map(service => (
            <div key={service.id} style={styles.completedCard}>
              <h4>{service.request?.title}</h4>
              <p>Completed on: {new Date(service.completedAt).toLocaleDateString()}</p>
              <p>Hours spent: {service.hoursSpent || 0}</p>
              {service.proof && <p style={styles.proof}>Proof: {service.proof}</p>}
            </div>
          ))}
        </section>
      </div>

      {/* Service Completion Modal */}
      {selectedRequest && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Complete Service</h3>
            <p><strong>Request:</strong> {selectedRequest.request?.title}</p>
            <label style={styles.label}>
              Service Completion Proof:
              <textarea
                value={serviceProof}
                onChange={(e) => setServiceProof(e.target.value)}
                placeholder="Describe what you did, upload photos (URLs), or provide proof of service completion..."
                style={styles.textarea}
                rows={6}
              />
            </label>
            <div style={styles.modalActions}>
              <button 
                onClick={() => handleCompleteService(selectedRequest.id)}
                style={styles.submitBtn}
              >
                ✓ Submit & Complete
              </button>
              <button 
                onClick={() => {
                  setSelectedRequest(null);
                  setServiceProof('');
                }}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f7fafc',
    fontFamily: "'Segoe UI', sans-serif",
    paddingTop: '70px'
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '30px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  logoutBtn: {
    padding: '10px 20px',
    backgroundColor: 'white',
    color: '#667eea',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    paddingTop: '70px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    padding: '30px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  statIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    backgroundColor: '#4299e1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem'
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#2d3748'
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#718096'
  },
  mainContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px'
  },
  section: {
    marginBottom: '40px'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    color: '#2d3748',
    marginBottom: '20px',
    fontWeight: '600'
  },
  emptyState: {
    padding: '40px',
    textAlign: 'center',
    color: '#718096',
    backgroundColor: 'white',
    borderRadius: '12px'
  },
  requestsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px'
  },
  requestCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '2px solid transparent',
    transition: 'all 0.3s'
  },
  requestHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '12px'
  },
  categoryBadge: {
    backgroundColor: '#edf2f7',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    color: '#4a5568',
    fontWeight: '600'
  },
  urgencyBadge: {
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  requestTitle: {
    fontSize: '1.2rem',
    color: '#2d3748',
    marginBottom: '10px'
  },
  requestDescription: {
    color: '#718096',
    marginBottom: '15px',
    lineHeight: '1.5'
  },
  requestMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: '#a0aec0',
    marginBottom: '15px'
  },
  requestDetails: {
    backgroundColor: '#f7fafc',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '15px',
    fontSize: '0.9rem'
  },
  acceptBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem'
  },
  servicesGrid: {
    display: 'grid',
    gap: '15px'
  },
  serviceCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  serviceMeta: {
    display: 'flex',
    gap: '20px',
    marginTop: '10px',
    marginBottom: '15px',
    fontSize: '0.9rem',
    color: '#718096'
  },
  completeBtn: {
    padding: '10px 20px',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  completedCard: {
    backgroundColor: '#f0fff4',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '10px',
    borderLeft: '4px solid #48bb78'
  },
  proof: {
    fontSize: '0.85rem',
    color: '#718096',
    fontStyle: 'italic'
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    maxWidth: '500px',
    width: '90%'
  },
  label: {
    display: 'block',
    marginTop: '15px',
    marginBottom: '10px',
    fontWeight: '600',
    color: '#2d3748'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    marginTop: '8px',
    fontFamily: 'inherit'
  },
  modalActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '20px'
  },
  submitBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    backgroundColor: '#718096',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  }
};

