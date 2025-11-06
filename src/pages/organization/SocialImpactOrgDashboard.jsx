import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SocialImpactOrgDashboard() {
  const [user, setUser] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({ totalRaised: 0, activeCampaigns: 0, beneficiariesHelped: 0 });
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    description: '',
    category: 'food',
    goal: '',
    location: ''
  });
  const [proofData, setProofData] = useState({
    campaignId: '',
    description: '',
    proofType: 'document',
    file: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'organization') {
      navigate('/Role');
      return;
    }
    setUser(currentUser);
    loadDashboard(currentUser.id);
  }, []);

  const loadDashboard = async (orgId) => {
    try {
      // Load campaigns for this org
      const campaignsRes = await fetch('/api/campaigns');
      const campaignsData = await campaignsRes.json();
      if (campaignsData.success) {
        const orgCampaigns = (campaignsData.data || []).filter(c => c.organizationId === orgId);
        setCampaigns(orgCampaigns);

        const totalRaised = orgCampaigns.reduce((sum, c) => sum + (c.raised || 0), 0);
        const activeCampaigns = orgCampaigns.filter(c => c.status === 'active').length;
        setStats({ totalRaised, activeCampaigns, beneficiariesHelped: beneficiaries.length });
      }

      // Load donations for this org's campaigns
      const transactions = window.__socialImpactApi.getData('TRANSACTIONS');
      const campaignIds = campaigns.map(c => c.id);
      const orgDonations = transactions.filter(t => campaignIds.includes(t.campaignId));
      setDonations(orgDonations);

      // Load beneficiaries (people helped by this org)
      const beneficiariesRes = await fetch(`/api/beneficiaries?orgId=${orgId}`);
      if (beneficiariesRes.ok) {
        const benefData = await beneficiariesRes.json();
        if (benefData.success) {
          setBeneficiaries(benefData.data || []);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...campaignForm,
          organizationId: user.id,
          organizationName: user.name,
          goal: parseFloat(campaignForm.goal),
          raised: 0,
          status: 'pending' // Awaits admin approval
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Campaign created! Awaiting admin approval.');
        setCampaignForm({ title: '', description: '', category: 'food', goal: '', location: '' });
        setShowCampaignForm(false);
        loadDashboard(user.id);
      } else {
        alert('Failed: ' + data.message);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('An error occurred');
    }
  };

  const handleUploadProof = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/proofs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: proofData.campaignId,
          organizationId: user.id,
          description: proofData.description,
          proofType: proofData.proofType,
          fileUrl: 'simulated-upload-url', // Simulate file upload
          timestamp: new Date().toISOString()
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('✅ Proof uploaded successfully!');
        setProofData({ campaignId: '', description: '', proofType: 'document', file: null });
        setShowProofModal(false);
        loadDashboard(user.id);
      } else {
        alert('Failed: ' + data.message);
      }
    } catch (error) {
      console.error('Error uploading proof:', error);
      alert('An error occurred');
    }
  };

  const handleToggleCampaignStatus = async (campaignId, newStatus) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Campaign ${newStatus === 'active' ? 'activated' : 'paused'}!`);
        loadDashboard(user.id);
      }
    } catch (error) {
      console.error('Error updating campaign:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  if (!user) return <div style={styles.loading}>Loading...</div>;

  const chartData = campaigns.map(c => ({
    name: c.title.substring(0, 20),
    raised: c.raised || 0,
    goal: c.goal || 0
  }));

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1>🏢 NGO/Organization Dashboard</h1>
        <div style={styles.userInfo}>
          <span>{user.name}</span>
          <span style={styles.badge}>Organization</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#48bb78'}}>💰</div>
          <div>
            <div style={styles.statNumber}>₹{stats.totalRaised.toLocaleString('en-IN')}</div>
            <div style={styles.statLabel}>Total Raised</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#4299e1'}}>🎯</div>
          <div>
            <div style={styles.statNumber}>{stats.activeCampaigns}</div>
            <div style={styles.statLabel}>Active Campaigns</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#ed8936'}}>❤️</div>
          <div>
            <div style={styles.statNumber}>{stats.beneficiariesHelped}</div>
            <div style={styles.statLabel}>Beneficiaries Helped</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#9f7aea'}}>📊</div>
          <div>
            <div style={styles.statNumber}>{donations.length}</div>
            <div style={styles.statLabel}>Total Donations</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('overview')}
          style={activeTab === 'overview' ? styles.tabActive : styles.tab}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          style={activeTab === 'campaigns' ? styles.tabActive : styles.tab}
        >
          🎯 My Campaigns ({campaigns.length})
        </button>
        <button
          onClick={() => setActiveTab('beneficiaries')}
          style={activeTab === 'beneficiaries' ? styles.tabActive : styles.tab}
        >
          ❤️ Beneficiaries
        </button>
        <button
          onClick={() => setActiveTab('donations')}
          style={activeTab === 'donations' ? styles.tabActive : styles.tab}
        >
          💚 Donations Received
        </button>
        <button
          onClick={() => setActiveTab('proofs')}
          style={activeTab === 'proofs' ? styles.tabActive : styles.tab}
        >
          📄 Upload Proof
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Overview */}
        {activeTab === 'overview' && (
          <div>
            <h2>Campaign Performance</h2>
            {chartData.length > 0 ? (
              <div style={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="raised" fill="#48bb78" name="Raised (₹)" />
                    <Bar dataKey="goal" fill="#4299e1" name="Goal (₹)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p style={styles.emptyState}>No campaigns yet. Create your first campaign to get started!</p>
            )}

            <div style={styles.quickActions}>
              <h3>Quick Actions</h3>
              <button onClick={() => setShowCampaignForm(true)} style={styles.actionBtn}>
                ➕ Create New Campaign
              </button>
              <button onClick={() => setShowProofModal(true)} style={styles.actionBtn}>
                📄 Upload Proof
              </button>
            </div>
          </div>
        )}

        {/* Campaigns */}
        {activeTab === 'campaigns' && (
          <div>
            <div style={styles.sectionHeader}>
              <h2>My Campaigns</h2>
              <button onClick={() => setShowCampaignForm(true)} style={styles.createBtn}>
                ➕ Create Campaign
              </button>
            </div>

            {campaigns.length === 0 ? (
              <p style={styles.emptyState}>No campaigns yet. Create your first campaign!</p>
            ) : (
              <div style={styles.campaignsGrid}>
                {campaigns.map(campaign => (
                  <div key={campaign.id} style={styles.campaignCard}>
                    <div style={styles.campaignHeader}>
                      <h3>{campaign.title}</h3>
                      <span style={{
                        ...styles.statusBadge,
                        background: campaign.status === 'active' ? '#48bb78' : campaign.status === 'pending' ? '#ed8936' : '#718096'
                      }}>
                        {campaign.status}
                      </span>
                    </div>
                    
                    <p style={styles.campaignDescription}>{campaign.description}</p>
                    
                    <div style={styles.campaignMeta}>
                      <span>📍 {campaign.location}</span>
                      <span>🏷️ {campaign.category}</span>
                    </div>

                    <div style={styles.progressSection}>
                      <div style={styles.progressBar}>
                        <div
                          style={{
                            ...styles.progressFill,
                            width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%`
                          }}
                        />
                      </div>
                      <div style={styles.progressText}>
                        <span>₹{campaign.raised.toLocaleString('en-IN')} raised</span>
                        <span>Goal: ₹{campaign.goal.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {campaign.status === 'active' && (
                      <button
                        onClick={() => handleToggleCampaignStatus(campaign.id, 'paused')}
                        style={{...styles.actionBtn, background: '#f56565'}}
                      >
                        ⏸️ Pause Campaign
                      </button>
                    )}
                    {campaign.status === 'paused' && (
                      <button
                        onClick={() => handleToggleCampaignStatus(campaign.id, 'active')}
                        style={{...styles.actionBtn, background: '#48bb78'}}
                      >
                        ▶️ Activate Campaign
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Beneficiaries */}
        {activeTab === 'beneficiaries' && (
          <div>
            <h2>People We've Helped</h2>
            {beneficiaries.length === 0 ? (
              <p style={styles.emptyState}>No beneficiaries recorded yet.</p>
            ) : (
              <div style={styles.table}>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Amount Received</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {beneficiaries.map(b => (
                      <tr key={b.id}>
                        <td>{b.name}</td>
                        <td>{b.category}</td>
                        <td>₹{b.amountReceived.toLocaleString('en-IN')}</td>
                        <td>{new Date(b.date).toLocaleDateString()}</td>
                        <td><span style={styles.statusTag}>{b.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Donations Received */}
        {activeTab === 'donations' && (
          <div>
            <h2>Donations Received</h2>
            {donations.length === 0 ? (
              <p style={styles.emptyState}>No donations received yet.</p>
            ) : (
              <div style={styles.donationsList}>
                {donations.map(donation => {
                  const campaign = campaigns.find(c => c.id === donation.campaignId);
                  return (
                    <div key={donation.id} style={styles.donationCard}>
                      <div style={styles.donationHeader}>
                        <div>
                          <h4>{campaign?.title || 'Campaign'}</h4>
                          <p>{donation.isAnonymous ? '🔒 Anonymous Donor' : `Donor ID: ${donation.donorId}`}</p>
                        </div>
                        <div style={styles.donationAmount}>
                          ₹{donation.amount.toLocaleString('en-IN')}
                        </div>
                      </div>
                      <p><strong>Date:</strong> {new Date(donation.timestamp).toLocaleString()}</p>
                      {donation.qrCode && (
                        <p><strong>QR Code:</strong> {donation.qrCode}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Upload Proof */}
        {activeTab === 'proofs' && (
          <div>
            <h2>Upload Proof of Work</h2>
            <p style={styles.subtitle}>
              Upload documents, photos, or reports showing how funds were used
            </p>
            <button onClick={() => setShowProofModal(true)} style={styles.createBtn}>
              📄 Upload New Proof
            </button>
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCampaignForm && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Create New Campaign</h3>
            <form onSubmit={handleCreateCampaign}>
              <label style={styles.label}>
                Campaign Title:
                <input
                  type="text"
                  value={campaignForm.title}
                  onChange={(e) => setCampaignForm({...campaignForm, title: e.target.value})}
                  required
                  style={styles.input}
                  placeholder="e.g., Feed 100 Families"
                />
              </label>

              <label style={styles.label}>
                Description:
                <textarea
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm({...campaignForm, description: e.target.value})}
                  required
                  style={{...styles.input, minHeight: '100px'}}
                  placeholder="Describe your campaign..."
                />
              </label>

              <label style={styles.label}>
                Category:
                <select
                  value={campaignForm.category}
                  onChange={(e) => setCampaignForm({...campaignForm, category: e.target.value})}
                  style={styles.input}
                >
                  <option value="food">Food</option>
                  <option value="education">Education</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="disaster">Disaster Relief</option>
                  <option value="shelter">Shelter</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label style={styles.label}>
                Funding Goal (₹):
                <input
                  type="number"
                  value={campaignForm.goal}
                  onChange={(e) => setCampaignForm({...campaignForm, goal: e.target.value})}
                  required
                  min="1"
                  style={styles.input}
                  placeholder="e.g., 50000"
                />
              </label>

              <label style={styles.label}>
                Location:
                <input
                  type="text"
                  value={campaignForm.location}
                  onChange={(e) => setCampaignForm({...campaignForm, location: e.target.value})}
                  required
                  style={styles.input}
                  placeholder="e.g., Mumbai, Maharashtra"
                />
              </label>

              <div style={styles.modalActions}>
                <button type="submit" style={styles.submitBtn}>Create Campaign</button>
                <button
                  type="button"
                  onClick={() => setShowCampaignForm(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Proof Modal */}
      {showProofModal && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Upload Proof of Work</h3>
            <form onSubmit={handleUploadProof}>
              <label style={styles.label}>
                Select Campaign:
                <select
                  value={proofData.campaignId}
                  onChange={(e) => setProofData({...proofData, campaignId: e.target.value})}
                  required
                  style={styles.input}
                >
                  <option value="">-- Select Campaign --</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </label>

              <label style={styles.label}>
                Proof Type:
                <select
                  value={proofData.proofType}
                  onChange={(e) => setProofData({...proofData, proofType: e.target.value})}
                  style={styles.input}
                >
                  <option value="document">Document</option>
                  <option value="photo">Photo</option>
                  <option value="video">Video</option>
                  <option value="report">Report</option>
                </select>
              </label>

              <label style={styles.label}>
                Description:
                <textarea
                  value={proofData.description}
                  onChange={(e) => setProofData({...proofData, description: e.target.value})}
                  required
                  style={{...styles.input, minHeight: '80px'}}
                  placeholder="Describe the proof..."
                />
              </label>

              <label style={styles.label}>
                Upload File:
                <input
                  type="file"
                  onChange={(e) => setProofData({...proofData, file: e.target.files[0]})}
                  style={styles.input}
                  accept="image/*,video/*,.pdf,.doc,.docx"
                />
              </label>

              <div style={styles.modalActions}>
                <button type="submit" style={styles.submitBtn}>Upload Proof</button>
                <button
                  type="button"
                  onClick={() => setShowProofModal(false)}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </form>
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
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    paddingTop: '70px'
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: '30px',
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
  badge: {
    backgroundColor: '#f6ad55',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '600'
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px',
    padding: '30px',
    maxWidth: '1400px',
    margin: '0 auto'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  statIcon: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem'
  },
  statNumber: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#2d3748'
  },
  statLabel: {
    fontSize: '0.95rem',
    color: '#718096'
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    padding: '0 30px',
    borderBottom: '2px solid #e2e8f0',
    maxWidth: '1400px',
    margin: '0 auto',
    overflowX: 'auto'
  },
  tab: {
    padding: '15px 25px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    color: '#718096',
    borderBottom: '3px solid transparent',
    transition: 'all 0.3s',
    whiteSpace: 'nowrap'
  },
  tabActive: {
    padding: '15px 25px',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    color: '#667eea',
    borderBottom: '3px solid #667eea',
    fontWeight: '600',
    whiteSpace: 'nowrap'
  },
  content: {
    maxWidth: '1400px',
    margin: '30px auto',
    padding: '0 30px'
  },
  subtitle: {
    color: '#718096',
    marginBottom: '20px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
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
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    backgroundColor: 'white',
    borderRadius: '12px',
    color: '#718096'
  },
  chartContainer: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '30px'
  },
  quickActions: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  actionBtn: {
    padding: '12px 24px',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  campaignsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px'
  },
  campaignCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  campaignHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '15px'
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    color: 'white',
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  campaignDescription: {
    color: '#718096',
    marginBottom: '15px',
    lineHeight: '1.6'
  },
  campaignMeta: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    fontSize: '0.9rem',
    color: '#718096'
  },
  progressSection: {
    marginBottom: '20px'
  },
  progressBar: {
    height: '10px',
    backgroundColor: '#e2e8f0',
    borderRadius: '5px',
    overflow: 'hidden',
    marginBottom: '10px'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#48bb78',
    transition: 'width 0.3s'
  },
  progressText: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.9rem',
    color: '#718096'
  },
  table: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  statusTag: {
    backgroundColor: '#f0fff4',
    color: '#48bb78',
    padding: '4px 8px',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  donationsList: {
    display: 'grid',
    gap: '15px'
  },
  donationCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  donationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '15px'
  },
  donationAmount: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#48bb78'
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
    zIndex: 1000,
    overflowY: 'auto',
    padding: '20px'
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto'
  },
  label: {
    display: 'block',
    marginTop: '20px',
    marginBottom: '10px',
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
  modalActions: {
    display: 'flex',
    gap: '10px',
    marginTop: '25px'
  },
  submitBtn: {
    flex: 1,
    padding: '15px',
    backgroundColor: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '1.1rem'
  },
  cancelBtn: {
    flex: 1,
    padding: '15px',
    backgroundColor: '#718096',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  }
};
