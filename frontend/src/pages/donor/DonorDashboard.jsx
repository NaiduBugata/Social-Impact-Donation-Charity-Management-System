import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import CreateCampaign from '../../components/CreateCampaign';
import VideoCall from '../../components/VideoCall';

export default function DonorDashboard() {
  const [user, setUser] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [myDonations, setMyDonations] = useState([]);
  const [recommendedCampaigns, setRecommendedCampaigns] = useState([]);
  const [stats, setStats] = useState({ totalDonated: 0, campaignsSupported: 0, livesImpacted: 0 });
  const [activeTab, setActiveTab] = useState('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);
  const [videoCallDonation, setVideoCallDonation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'donor') {
      navigate('/Role');
      return;
    }
    setUser(currentUser);
    loadDashboard(currentUser.id);
  }, []);

  const loadDashboard = async (donorId) => {
    try {
      // Load campaigns
      const campaignsRes = await fetch('/api/campaigns');
      const campaignsData = await campaignsRes.json();
      if (campaignsData.success) {
        setCampaigns(campaignsData.data.filter(c => c.status === 'active') || []);
      }

      // Load my donations
      const donateRes = await fetch('/api/donate');
      const donateData = await donateRes.json();
      if (donateData.success) {
        const myDonationsList = (donateData.data || []).filter(t => t.donorId === donorId);
        setMyDonations(myDonationsList);

        // Calculate stats
        const totalDonated = myDonationsList.reduce((sum, d) => sum + (d.amount || 0), 0);
        const campaignsSupported = new Set(myDonationsList.map(d => d.campaignId)).size;
        setStats({
          totalDonated,
          campaignsSupported,
          livesImpacted: Math.floor(totalDonated / 500) // Estimate: ₹500 per life
        });
      }

      // Load AI recommendations
      const recommendRes = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: donorId })
      });
      const recommendData = await recommendRes.json();
      if (recommendData.success) {
        setRecommendedCampaigns(recommendData.data || []);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const handleDonate = async (e) => {
    e.preventDefault();
    if (!selectedCampaign || !donationAmount) return;

    try {
      const response = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: selectedCampaign.id,
          donorId: user.id,
          amount: parseFloat(donationAmount),
          isAnonymous
        })
      });

      const data = await response.json();
      if (data.success) {
        if (isAnonymous) {
          alert(`✅ Anonymous donation successful!\n\nYour QR Code: ${data.data.qrCode}\n\nTrack your impact at: /impact/${data.data.qrCode}`);
          navigate(`/impact/${data.data.qrCode}`);
        } else {
          alert(`✅ Donation successful!\n\n${data.data.impactStory}`);
        }
        setSelectedCampaign(null);
        setDonationAmount('');
        setIsAnonymous(false);
        loadDashboard(user.id);
      } else {
        alert('Donation failed: ' + data.message);
      }
    } catch (error) {
      console.error('Error donating:', error);
      alert('An error occurred');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  if (!user) return <div style={styles.loading}>Loading...</div>;

  const COLORS = ['#4299e1', '#48bb78', '#ed8936', '#9f7aea', '#f56565'];
  const donationsByCategory = myDonations.reduce((acc, d) => {
    const campaign = campaigns.find(c => c.id === d.campaignId);
    const category = campaign?.category || 'Other';
    acc[category] = (acc[category] || 0) + d.amount;
    return acc;
  }, {});

  const categoryChartData = Object.entries(donationsByCategory).map(([name, value]) => ({ name, value }));

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1>💰 Financial Donor Dashboard</h1>
        <div style={styles.userInfo}>
          <span>{user.name}</span>
          <span style={styles.badge}>{user.badge || 'Bronze'} Donor</span>
          <span style={styles.trustScore}>⭐ {user.trustScore || 75}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#4299e1'}}>💰</div>
          <div>
            <div style={styles.statNumber}>₹{stats.totalDonated.toLocaleString('en-IN')}</div>
            <div style={styles.statLabel}>Total Donated</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#48bb78'}}>🎯</div>
          <div>
            <div style={styles.statNumber}>{stats.campaignsSupported}</div>
            <div style={styles.statLabel}>Campaigns Supported</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#ed8936'}}>❤️</div>
          <div>
            <div style={styles.statNumber}>{stats.livesImpacted}</div>
            <div style={styles.statLabel}>Lives Impacted</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#9f7aea'}}>🏆</div>
          <div>
            <div style={styles.statNumber}>{user.badge || 'Bronze'}</div>
            <div style={styles.statLabel}>Current Badge</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          onClick={() => setActiveTab('campaigns')}
          style={activeTab === 'campaigns' ? styles.tabActive : styles.tab}
        >
          🎯 Active Campaigns
        </button>
        <button
          onClick={() => setActiveTab('recommended')}
          style={activeTab === 'recommended' ? styles.tabActive : styles.tab}
        >
          ✨ AI Recommendations
        </button>
        <button
          onClick={() => setActiveTab('myDonations')}
          style={activeTab === 'myDonations' ? styles.tabActive : styles.tab}
        >
          📊 My Donations
        </button>
        <button
          onClick={() => setActiveTab('createCampaign')}
          style={activeTab === 'createCampaign' ? styles.tabActive : styles.tab}
        >
          ➕ Create Campaign
        </button>
        <button
          onClick={() => setActiveTab('impact')}
          style={activeTab === 'impact' ? styles.tabActive : styles.tab}
        >
          💚 Impact Report
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Active Campaigns */}
        {activeTab === 'campaigns' && (
          <div>
            <h2>Active Campaigns</h2>
            {campaigns.filter(c => c.status === 'active' && c.active === true).length === 0 ? (
              <div style={styles.emptyState}>
                <p>No active campaigns at the moment. Check back later!</p>
              </div>
            ) : (
              <div style={styles.campaignsGrid}>
                {campaigns.filter(c => c.status === 'active' && c.active === true).map(campaign => (
                  <div key={campaign.id} style={styles.campaignCard}>
                  <div style={styles.campaignHeader}>
                    <h3>{campaign.title}</h3>
                    <span style={styles.categoryBadge}>{campaign.category}</span>
                  </div>
                  <p style={styles.campaignDescription}>{campaign.description}</p>
                  
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

                  {campaign.verifiedProof && (
                    <div style={styles.verifiedBadge}>✅ Verified Campaign</div>
                  )}

                  <button
                    onClick={() => setSelectedCampaign(campaign)}
                    style={styles.donateBtn}
                  >
                    💚 Donate Now
                  </button>
                </div>
              ))}
              </div>
            )}
          </div>
        )}

        {/* AI Recommendations */}
        {activeTab === 'recommended' && (
          <div>
            <h2>✨ AI-Recommended Campaigns for You</h2>
            <p style={styles.subtitle}>
              Based on your donation history, location, and interests
            </p>
            <div style={styles.campaignsGrid}>
              {recommendedCampaigns.map(campaign => (
                <div key={campaign.id} style={{...styles.campaignCard, border: '2px solid #9f7aea'}}>
                  <div style={styles.aiRecommendBadge}>
                    ⭐ {Math.round(campaign.score * 100)}% Match
                  </div>
                  <h3>{campaign.title}</h3>
                  <p>{campaign.description}</p>
                  <p style={{fontSize: '0.9rem', color: '#718096', marginTop: '10px'}}>
                    <strong>Why recommended:</strong> {campaign.reason}
                  </p>
                  <button
                    onClick={() => setSelectedCampaign(campaign)}
                    style={styles.donateBtn}
                  >
                    💚 Donate Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Donations */}
        {activeTab === 'myDonations' && (
          <div>
            <h2>My Donation History</h2>
            {myDonations.length === 0 ? (
              <p style={styles.emptyState}>No donations yet. Start making an impact today!</p>
            ) : (
              <div style={styles.donationsList}>
                {myDonations.map(donation => {
                  const campaign = campaigns.find(c => c.id === donation.campaignId);
                  return (
                    <div key={donation.id} style={styles.donationCard}>
                      <div style={styles.donationHeader}>
                        <h4>{campaign?.title || 'Campaign'}</h4>
                        <span style={styles.donationAmount}>
                          ₹{donation.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p><strong>Date:</strong> {new Date(donation.timestamp).toLocaleDateString()}</p>
                      {donation.isAnonymous && (
                        <p><strong>Type:</strong> Anonymous (QR: {donation.qrCode})</p>
                      )}
                      {donation.impactStory && (
                        <div style={styles.impactStory}>
                          <strong>Impact:</strong>
                          <p>{donation.impactStory}</p>
                        </div>
                      )}
                      {donation.qrCode && (
                        <button
                          onClick={() => navigate(`/impact/${donation.qrCode}`)}
                          style={styles.trackBtn}
                        >
                          📊 Track Impact
                        </button>
                      )}
                      <button 
                        onClick={() => setVideoCallDonation(donation)}
                        style={styles.videoCallBtn}
                      >
                        📹 Video Call with Helper
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Create Campaign Tab */}
        {activeTab === 'createCampaign' && (
          <div>
            <CreateCampaign 
              userRole="donor"
              inline={true}
              onClose={() => setActiveTab('campaigns')}
              onSuccess={() => {
                loadDashboard(user.id);
                setActiveTab('campaigns');
              }}
            />
          </div>
        )}

        {/* Impact Report */}
        {activeTab === 'impact' && (
          <div>
            <h2>Your Impact Report</h2>
            <div style={styles.impactGrid}>
              <div style={styles.impactCard}>
                <h3>Total Contribution</h3>
                <p style={styles.impactNumber}>₹{stats.totalDonated.toLocaleString('en-IN')}</p>
                <p style={styles.impactText}>
                  You've donated across {stats.campaignsSupported} different campaigns
                </p>
              </div>

              <div style={styles.impactCard}>
                <h3>Lives Impacted</h3>
                <p style={styles.impactNumber}>{stats.livesImpacted}</p>
                <p style={styles.impactText}>
                  Estimated people helped through your contributions
                </p>
              </div>

              {categoryChartData.length > 0 && (
                <div style={styles.chartCard}>
                  <h3>Donation Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={categoryChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div style={styles.badgeSection}>
              <h3>Badge Progress</h3>
              <p>Current: <strong>{user.badge || 'Bronze'}</strong></p>
              <p>Trust Score: <strong>{user.trustScore || 75}/100</strong></p>
              <div style={styles.badgeProgress}>
                <div>Bronze (₹0+) ✅</div>
                <div>Silver (₹5,000+) {stats.totalDonated >= 5000 ? '✅' : '⏳'}</div>
                <div>Gold (₹15,000+) {stats.totalDonated >= 15000 ? '✅' : '⏳'}</div>
                <div>Platinum (₹50,000+) {stats.totalDonated >= 50000 ? '✅' : '⏳'}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Donation Modal */}
      {selectedCampaign && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>Donate to: {selectedCampaign.title}</h3>
            <p>{selectedCampaign.description}</p>
            
            <form onSubmit={handleDonate}>
              <label style={styles.label}>
                Donation Amount (₹):
                <input
                  type="number"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  min="1"
                  required
                  style={styles.input}
                  placeholder="Enter amount"
                />
              </label>

              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <span>Donate anonymously (get QR code for tracking)</span>
              </label>

              <div style={styles.modalActions}>
                <button type="submit" style={styles.submitBtn}>
                  💚 Donate ₹{donationAmount || '___'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCampaign(null);
                    setDonationAmount('');
                    setIsAnonymous(false);
                  }}
                  style={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateCampaign && (
        <CreateCampaign 
          userRole="donor"
          onClose={() => setShowCreateCampaign(false)}
          onSuccess={() => {
            loadDashboard(user.id);
          }}
        />
      )}

      {/* Video Call Modal */}
      {videoCallDonation && (
        <VideoCall
          serviceId={videoCallDonation.campaignId}
          donorId={user.id}
          helperId={videoCallDonation.helperId || 0}
          userRole="donor"
          onClose={() => setVideoCallDonation(null)}
        />
      )}

      {/* DEV ONLY: Test Video Call Button (Floating) */}
      <button
        onClick={() => setVideoCallDonation({ 
          campaignId: 'test-campaign-' + Date.now(),
          helperId: 'test-helper-1'
        })}
        style={styles.testVideoButton}
        title="Test Video Call (Donor ↔ Helper)"
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
  badge: {
    backgroundColor: '#f6ad55',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  trustScore: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '0.85rem'
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
  campaignsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  campaignCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s'
  },
  campaignHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '15px'
  },
  categoryBadge: {
    backgroundColor: '#edf2f7',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    color: '#4a5568',
    fontWeight: '600'
  },
  campaignDescription: {
    color: '#718096',
    marginBottom: '20px',
    lineHeight: '1.6'
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
  verifiedBadge: {
    backgroundColor: '#f0fff4',
    color: '#48bb78',
    padding: '8px 12px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '600',
    marginBottom: '15px',
    display: 'inline-block'
  },
  donateBtn: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'background 0.3s'
  },
  aiRecommendBadge: {
    backgroundColor: '#9f7aea',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '15px',
    display: 'inline-block'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    backgroundColor: 'white',
    borderRadius: '12px',
    color: '#718096'
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
    alignItems: 'center',
    marginBottom: '15px'
  },
  donationAmount: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#48bb78'
  },
  impactStory: {
    backgroundColor: '#f0fff4',
    padding: '15px',
    borderRadius: '8px',
    marginTop: '15px'
  },
  trackBtn: {
    marginTop: '15px',
    padding: '10px 20px',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  impactGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  impactCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center'
  },
  impactNumber: {
    fontSize: '3rem',
    fontWeight: '700',
    color: '#48bb78',
    margin: '15px 0'
  },
  impactText: {
    color: '#718096',
    fontSize: '0.95rem'
  },
  chartCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    gridColumn: '1 / -1'
  },
  badgeSection: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginTop: '30px'
  },
  badgeProgress: {
    marginTop: '20px',
    display: 'grid',
    gap: '10px'
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
    padding: '40px',
    borderRadius: '12px',
    maxWidth: '500px',
    width: '90%'
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
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '20px',
    cursor: 'pointer'
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
  },
  videoCallBtn: {
    padding: '10px 15px',
    backgroundColor: '#9f7aea',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    marginTop: '10px',
    transition: 'all 0.3s',
    boxShadow: '0 2px 6px rgba(159, 122, 234, 0.3)',
    width: '100%'
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

