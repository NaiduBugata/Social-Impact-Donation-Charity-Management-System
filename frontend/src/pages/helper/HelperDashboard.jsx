import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import CreateCampaign from '../../components/CreateCampaign';
import VideoCall from '../../components/VideoCall';

export default function HelperDashboard() {
  const [user, setUser] = useState(null);
  const [nearbyRequests, setNearbyRequests] = useState([]);
  const [myServices, setMyServices] = useState([]);
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [stats, setStats] = useState({ accepted: 0, completed: 0, hours: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [serviceProof, setServiceProof] = useState('');
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [videoCallService, setVideoCallService] = useState(null);
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

      // Fetch campaigns created by this helper
      const campaignsRes = await fetch('/api/campaigns');
      const campaignsData = await campaignsRes.json();
      if (campaignsData.success) {
        // Filter campaigns created by current user
        const userCampaigns = (campaignsData.data || [])
          .filter(c => c.createdBy === currentUser.id)
          .map(c => ({ ...c, id: c.id || c._id })); // Normalize ID
        setMyCampaigns(userCampaigns);
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
          <button 
            onClick={() => setShowCreateCampaign(true)} 
            style={styles.createCampaignBtn}
          >
            ➕ Create Campaign
          </button>
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
          <div style={{...styles.statIcon, background: '#ed8936'}}>📝</div>
          <div>
            <div style={styles.statNumber}>{myCampaigns.length}</div>
            <div style={styles.statLabel}>My Campaigns</div>
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
        {/* My Campaigns */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>🎯 My Campaigns ({myCampaigns.length})</h2>
          {myCampaigns.length === 0 ? (
            <p style={styles.emptyState}>
              You haven't created any campaigns yet. Click "Create Campaign" to start one!
            </p>
          ) : (
            <div style={styles.campaignsGrid}>
              {myCampaigns.map(campaign => (
                <div key={campaign.id} style={styles.campaignCard}>
                  <div style={styles.campaignHeader}>
                    <h3 style={styles.campaignTitle}>{campaign.title}</h3>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: 
                        campaign.status === 'pending' ? '#fed7d7' :
                        campaign.status === 'active' ? '#c6f6d5' :
                        '#e2e8f0',
                      color:
                        campaign.status === 'pending' ? '#c53030' :
                        campaign.status === 'active' ? '#22543d' :
                        '#4a5568'
                    }}>
                      {campaign.status === 'pending' && '⏳ Pending Approval'}
                      {campaign.status === 'active' && '✅ Active'}
                      {campaign.status === 'rejected' && '❌ Rejected'}
                    </span>
                  </div>
                  <p style={styles.campaignDescription}>{campaign.description}</p>
                  <div style={styles.campaignMeta}>
                    <span>📁 {campaign.category}</span>
                    <span>📍 {campaign.location?.address || 'N/A'}</span>
                  </div>
                  {campaign.status === 'active' && (
                    <div style={styles.progressSection}>
                      <div style={styles.progressBar}>
                        <div
                          style={{
                            ...styles.progressFill,
                            width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%`
                          }}
                        />
                      </div>
                      <p style={styles.progressText}>
                        ₹{campaign.raised?.toLocaleString('en-IN') || 0} raised of ₹{campaign.goal?.toLocaleString('en-IN') || 0}
                      </p>
                    </div>
                  )}
                  {campaign.status === 'pending' && (
                    <p style={{ color: '#718096', fontSize: '0.9rem', fontStyle: 'italic', marginTop: '10px' }}>
                      ⏳ Waiting for admin approval...
                    </p>
                  )}
                  {campaign.deadline && (
                    <p style={{ fontSize: '0.9rem', color: '#4a5568', marginTop: '8px' }}>
                      📅 Deadline: {new Date(campaign.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

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
                  <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                    <button 
                      onClick={() => setVideoCallService(service)}
                      style={styles.videoCallBtn}
                    >
                      📹 Video Call with Donor
                    </button>
                    <button 
                      onClick={() => setSelectedRequest(service)}
                      style={styles.completeBtn}
                    >
                      ✓ Mark as Complete
                    </button>
                  </div>
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

      {/* Create Campaign Modal */}
      {showCreateCampaign && (
        <CreateCampaign 
          userRole="helper"
          onClose={() => setShowCreateCampaign(false)}
          onSuccess={() => {
            loadDashboard(user);
            setShowCreateCampaign(false);
          }}
        />
      )}

      {/* Video Call Modal */}
      {videoCallService && (
        <VideoCall
          serviceId={videoCallService.id}
          donorId={videoCallService.donorId || videoCallService.receiverId}
          helperId={user.id}
          userRole="helper"
          onClose={() => setVideoCallService(null)}
        />
      )}

      {/* DEV ONLY: Test Video Call Button (Floating) */}
      <button
        onClick={() => setVideoCallService({ 
          id: 'test-service-' + Date.now(), 
          donorId: 'test-donor-1',
          receiverId: 'test-receiver-1',
          request: { title: 'Test Video Call Connection' }
        })}
        style={styles.testVideoButton}
        title="Test Video Call (Helper ↔ Donor)"
      >
        🎥 Test Video Call
      </button>
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
  createCampaignBtn: {
    padding: '10px 20px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s',
    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
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
  },
  campaignsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '20px',
    marginTop: '15px'
  },
  campaignCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '2px solid #e2e8f0',
    transition: 'all 0.3s'
  },
  campaignHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '10px'
  },
  campaignTitle: {
    fontSize: '1.15rem',
    color: '#2d3748',
    margin: 0,
    flex: 1
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  campaignDescription: {
    color: '#718096',
    marginBottom: '12px',
    lineHeight: '1.5',
    fontSize: '0.95rem'
  },
  campaignMeta: {
    display: 'flex',
    gap: '12px',
    fontSize: '0.85rem',
    color: '#a0aec0',
    marginBottom: '12px',
    flexWrap: 'wrap'
  },
  progressSection: {
    marginTop: '15px'
  },
  progressBar: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#48bb78',
    transition: 'width 0.3s ease'
  },
  progressText: {
    fontSize: '0.9rem',
    color: '#4a5568',
    fontWeight: '600',
    margin: 0
  },
  videoCallBtn: {
    flex: 1,
    padding: '10px 15px',
    backgroundColor: '#9f7aea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.3s',
    boxShadow: '0 2px 6px rgba(159, 122, 234, 0.3)'
  },
  testVideoButton: {
    position: 'fixed',
    bottom: '30px',
    right: '30px',
    padding: '15px 25px',
    backgroundColor: '#9f7aea',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
    boxShadow: '0 4px 12px rgba(159, 122, 234, 0.4)',
    zIndex: 10001,
    transition: 'all 0.3s ease'
  }
};

