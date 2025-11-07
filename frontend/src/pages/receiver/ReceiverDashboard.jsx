import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateCampaign from '../../components/CreateCampaign';

export default function ReceiverDashboard() {
  const [user, setUser] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'medical',
    type: 'financial',
    amount: '',
    urgency: 'medium',
    proof: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'receiver') {
      navigate('/Role');
      return;
    }
    setUser(currentUser);
    loadRequests(currentUser.id);
  }, []);

  const loadRequests = async (userId) => {
    try {
      const response = await fetch(`/api/requests/user/${userId}`);
      const data = await response.json();
      if (data.success) {
        setMyRequests(data.data || []);
      }

      // Fetch campaigns created by this receiver
      const campaignsRes = await fetch('/api/campaigns');
      const campaignsData = await campaignsRes.json();
      if (campaignsData.success) {
        // Filter campaigns created by current user
        const userCampaigns = (campaignsData.data || [])
          .filter(c => c.createdBy === userId)
          .map(c => ({ ...c, id: c.id || c._id })); // Normalize ID
        setMyCampaigns(userCampaigns);
      }
    } catch (error) {
      console.error('Error loading requests:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user.kycVerified) {
      alert('⚠️ KYC verification required before submitting requests. Please contact admin.');
      return;
    }

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId: user.id,
          amount: formData.type === 'financial' ? parseFloat(formData.amount) : 0,
          location: user.location || { lat: 28.7041, lng: 77.1025, address: 'Delhi, India' }
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Request submitted successfully! Admin will review it shortly.');
        setMyRequests([data.data, ...myRequests]);
        setShowCreateForm(false);
        setFormData({
          title: '',
          description: '',
          category: 'medical',
          type: 'financial',
          amount: '',
          urgency: 'medium',
          proof: ''
        });
      } else {
        alert('Failed to submit request: ' + data.message);
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('An error occurred while submitting your request');
    }
  };

  const handleUploadProof = async (requestId, proof) => {
    try {
      const response = await fetch('/api/requests/upload-proof', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, proof })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Proof uploaded! Admin will review for fund sanctioning.');
        loadRequests(user.id);
      } else {
        alert('Failed: ' + data.message);
      }
    } catch (error) {
      console.error('Error uploading proof:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  if (!user) {
    return <div style={styles.loading}>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1>🙋 Receiver Dashboard</h1>
        <div style={styles.userInfo}>
          <button 
            onClick={() => setShowCreateCampaign(true)} 
            style={styles.createCampaignBtn}
          >
            ➕ Create Campaign
          </button>
          <span>{user.name}</span>
          <span style={user.kycVerified ? styles.verifiedBadge : styles.unverifiedBadge}>
            {user.kycVerified ? '✓ Verified' : '⚠️ KYC Pending'}
          </span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      {!user.kycVerified && (
        <div style={styles.warningBox}>
          <h3>⚠️ KYC Verification Required</h3>
          <p>You need to complete KYC verification before submitting help requests. Please contact admin or upload verification documents.</p>
        </div>
      )}

      <div style={styles.mainContent}>
        <div style={styles.topSection}>
          <h2>My Help Requests ({myRequests.length})</h2>
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={styles.createBtn}
            disabled={!user.kycVerified}
          >
            {showCreateForm ? 'Cancel' : '+ Create New Request'}
          </button>
        </div>

        {/* Create Request Form */}
        {showCreateForm && (
          <form onSubmit={handleSubmit} style={styles.form}>
            <h3>Submit Help Request</h3>
            
            <label style={styles.label}>
              Request Title *
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="e.g., Need urgent medical assistance for surgery"
                style={styles.input}
                required
              />
            </label>

            <label style={styles.label}>
              Detailed Description *
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Provide detailed information about your situation..."
                style={styles.textarea}
                rows={5}
                required
              />
            </label>

            <div style={styles.row}>
              <label style={styles.label}>
                Category *
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  style={styles.select}
                >
                  <option value="medical">🏥 Medical</option>
                  <option value="education">📚 Education</option>
                  <option value="food">🍲 Food & Nutrition</option>
                  <option value="housing">🏠 Housing</option>
                  <option value="emergency">🚨 Emergency</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label style={styles.label}>
                Help Type *
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  style={styles.select}
                >
                  <option value="financial">💰 Financial Support</option>
                  <option value="service">🤝 Service/Volunteering</option>
                  <option value="both">💚 Both</option>
                </select>
              </label>
            </div>

            {(formData.type === 'financial' || formData.type === 'both') && (
              <label style={styles.label}>
                Amount Needed (₹) *
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="Enter amount in rupees"
                  style={styles.input}
                  min="1"
                  required
                />
              </label>
            )}

            <label style={styles.label}>
              Urgency Level *
              <select
                value={formData.urgency}
                onChange={(e) => setFormData({...formData, urgency: e.target.value})}
                style={styles.select}
              >
                <option value="low">🟢 Low (Can wait)</option>
                <option value="medium">🟠 Medium (Soon)</option>
                <option value="high">🔴 High (Urgent)</option>
              </select>
            </label>

            <label style={styles.label}>
              Proof of Need (Optional - can upload later)
              <textarea
                value={formData.proof}
                onChange={(e) => setFormData({...formData, proof: e.target.value})}
                placeholder="Upload document URLs, medical reports, bills, etc."
                style={styles.textarea}
                rows={3}
              />
            </label>

            <button type="submit" style={styles.submitBtn}>
              📤 Submit Request
            </button>
          </form>
        )}

        {/* Requests List */}
        <div style={styles.requestsList}>
          {myRequests.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No requests yet. Click "Create New Request" to get started.</p>
            </div>
          ) : (
            myRequests.map(request => (
              <div key={request.id} style={styles.requestCard}>
                <div style={styles.requestHeader}>
                  <div>
                    <h3 style={styles.requestTitle}>{request.title}</h3>
                    <span style={styles.categoryBadge}>{request.category}</span>
                  </div>
                  <div style={styles.statusBadge}>
                    {request.status === 'pending' && '⏳ Pending Review'}
                    {request.status === 'approved' && '✅ Approved'}
                    {request.status === 'sanctioned' && '💰 Funds Sanctioned'}
                    {request.status === 'completed' && '🎉 Completed'}
                    {request.status === 'rejected' && '❌ Rejected'}
                  </div>
                </div>

                <p style={styles.requestDescription}>{request.description}</p>

                <div style={styles.requestMeta}>
                  <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                  {request.type === 'financial' && (
                    <span>Amount: ₹{request.amount?.toLocaleString('en-IN')}</span>
                  )}
                  <span style={{
                    color: request.urgency === 'high' ? '#e53e3e' : request.urgency === 'medium' ? '#ed8936' : '#48bb78'
                  }}>
                    {request.urgency === 'high' ? '🔴' : request.urgency === 'medium' ? '🟠' : '🟢'} {request.urgency}
                  </span>
                </div>

                {request.sanctionedAmount && (
                  <div style={styles.sanctionInfo}>
                    <strong>✅ Sanctioned Amount: ₹{request.sanctionedAmount.toLocaleString('en-IN')}</strong>
                    <p style={{fontSize: '0.9rem', marginTop: '5px'}}>
                      Approved by: {request.sanctionedBy} on {new Date(request.sanctionedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {request.status === 'approved' && !request.proof && (
                  <div style={styles.proofUpload}>
                    <p style={{color: '#ed8936', marginBottom: '10px'}}>
                      ⚠️ Please upload proof of need for fund sanctioning
                    </p>
                    <textarea
                      placeholder="Paste document URLs, medical bills, or proof details..."
                      style={styles.textarea}
                      rows={3}
                      onBlur={(e) => {
                        if (e.target.value.trim()) {
                          handleUploadProof(request.id, e.target.value);
                        }
                      }}
                    />
                  </div>
                )}

                {request.proof && (
                  <div style={styles.proofDisplay}>
                    <strong>📄 Proof Submitted:</strong>
                    <p style={{fontSize: '0.9rem', marginTop: '5px'}}>{request.proof}</p>
                  </div>
                )}

                {request.helpers && request.helpers.length > 0 && (
                  <div style={styles.helpersInfo}>
                    <strong>🤝 Helpers Assigned:</strong>
                    <ul style={{marginTop: '8px', paddingLeft: '20px'}}>
                      {request.helpers.map((helper, idx) => (
                        <li key={idx}>{helper.name} - {helper.specialty}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* My Campaigns Section */}
        <div style={{ marginTop: '40px' }}>
          <h2>🎯 My Campaigns ({myCampaigns.length})</h2>
          {myCampaigns.length === 0 ? (
            <div style={styles.emptyState}>
              <p>You haven't created any campaigns yet. Click "Create Campaign" to start one!</p>
            </div>
          ) : (
            <div style={styles.campaignsGrid}>
              {myCampaigns.map(campaign => (
                <div key={campaign.id} style={styles.campaignCard}>
                  <div style={styles.campaignHeader}>
                    <h3 style={styles.campaignTitle}>{campaign.title}</h3>
                    <span style={{
                      ...styles.campaignStatusBadge,
                      backgroundColor: 
                        campaign.status === 'pending' ? '#fed7d7' :
                        campaign.status === 'active' ? '#c6f6d5' :
                        '#e2e8f0',
                      color:
                        campaign.status === 'pending' ? '#c53030' :
                        campaign.status === 'active' ? '#22543d' :
                        '#4a5568'
                    }}>
                      {campaign.status === 'pending' && '⏳ Pending'}
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
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateCampaign && (
        <CreateCampaign 
          userRole="receiver"
          onClose={() => setShowCreateCampaign(false)}
          onSuccess={() => {
            loadRequests(user.id);
            setShowCreateCampaign(false);
          }}
        />
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
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
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
  verifiedBadge: {
    backgroundColor: '#48bb78',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  unverifiedBadge: {
    backgroundColor: '#ed8936',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  logoutBtn: {
    padding: '10px 20px',
    backgroundColor: 'white',
    color: '#f5576c',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh'
  },
  warningBox: {
    backgroundColor: '#fff5f5',
    border: '2px solid #fc8181',
    borderRadius: '12px',
    padding: '20px',
    margin: '20px auto',
    maxWidth: '1200px',
    color: '#c53030'
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px'
  },
  topSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  },
  createBtn: {
    padding: '12px 24px',
    backgroundColor: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem'
  },
  form: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  },
  label: {
    display: 'block',
    marginBottom: '20px',
    fontWeight: '600',
    color: '#2d3748'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    marginTop: '8px'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    marginTop: '8px',
    fontFamily: 'inherit',
    resize: 'vertical'
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    marginTop: '8px',
    cursor: 'pointer'
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px'
  },
  submitBtn: {
    width: '100%',
    padding: '15px',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '1.1rem',
    marginTop: '10px'
  },
  requestsList: {
    display: 'grid',
    gap: '20px'
  },
  emptyState: {
    backgroundColor: 'white',
    padding: '60px',
    borderRadius: '12px',
    textAlign: 'center',
    color: '#718096'
  },
  requestCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '2px solid #e2e8f0'
  },
  requestHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '15px'
  },
  requestTitle: {
    fontSize: '1.3rem',
    color: '#2d3748',
    marginBottom: '8px'
  },
  categoryBadge: {
    backgroundColor: '#edf2f7',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    color: '#4a5568',
    fontWeight: '600'
  },
  statusBadge: {
    padding: '8px 16px',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: '600',
    backgroundColor: '#f7fafc',
    color: '#4a5568'
  },
  requestDescription: {
    color: '#4a5568',
    lineHeight: '1.6',
    marginBottom: '15px'
  },
  requestMeta: {
    display: 'flex',
    gap: '20px',
    fontSize: '0.9rem',
    color: '#718096',
    marginBottom: '15px'
  },
  sanctionInfo: {
    backgroundColor: '#f0fff4',
    border: '2px solid #48bb78',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '15px'
  },
  proofUpload: {
    backgroundColor: '#fffaf0',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '15px'
  },
  proofDisplay: {
    backgroundColor: '#f7fafc',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '15px'
  },
  helpersInfo: {
    backgroundColor: '#ebf8ff',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '15px'
  },
  campaignsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  campaignCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '2px solid #e2e8f0'
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
  campaignStatusBadge: {
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
  }
};

