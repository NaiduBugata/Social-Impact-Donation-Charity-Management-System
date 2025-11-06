import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({});
  const [pendingRequests, setPendingRequests] = useState([]);
  const [pendingKYC, setPendingKYC] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [sanctionAmount, setSanctionAmount] = useState('');
  const [selectedKYC, setSelectedKYC] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/Role');
      return;
    }
    setUser(currentUser);
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load analytics
      const analyticsRes = await fetch('/api/analytics');
      const analyticsData = await analyticsRes.json();
      if (analyticsData.success) {
        setStats(analyticsData.data);
      }

      // Load pending requests
      const requestsRes = await fetch('/api/requests');
      const requestsData = await requestsRes.json();
      if (requestsData.success) {
        setAllRequests(requestsData.data || []);
        setPendingRequests(requestsData.data.filter(r => r.status === 'pending') || []);
      }

      // Load pending KYC
      const kycData = window.__socialImpactApi.getData('KYC');
      setPendingKYC(kycData.filter(k => k.status === 'pending') || []);

      // Load campaigns
      const campaignsRes = await fetch('/api/campaigns');
      const campaignsData = await campaignsRes.json();
      if (campaignsData.success) {
        setCampaigns(campaignsData.data || []);
      }

      // Load all users
      const users = window.__socialImpactApi.getData('USERS');
      setAllUsers(users || []);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const handleApproveRequest = async (requestId) => {
    const request = allRequests.find(r => r.id === requestId);
    if (!request) return;

    try {
      // Update request status to approved
      const requests = window.__socialImpactApi.getData('REQUESTS');
      const index = requests.findIndex(r => r.id === requestId);
      if (index !== -1) {
        requests[index].status = 'approved';
        requests[index].approvedBy = user.id;
        requests[index].approvedAt = new Date().toISOString();
        window.__socialImpactApi.setData('REQUESTS', requests);
        alert('✅ Request approved! Receiver can now upload proof for fund sanctioning.');
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const requests = window.__socialImpactApi.getData('REQUESTS');
      const index = requests.findIndex(r => r.id === requestId);
      if (index !== -1) {
        requests[index].status = 'rejected';
        requests[index].rejectedBy = user.id;
        requests[index].rejectedAt = new Date().toISOString();
        requests[index].rejectionReason = reason;
        window.__socialImpactApi.setData('REQUESTS', requests);
        alert('❌ Request rejected');
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleSanctionFunds = async (e) => {
    e.preventDefault();
    if (!selectedRequest || !sanctionAmount) return;

    try {
      const response = await fetch('/api/sanction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          amount: parseFloat(sanctionAmount),
          adminId: user.id
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`✅ ₹${sanctionAmount} sanctioned successfully!`);
        setSelectedRequest(null);
        setSanctionAmount('');
        loadDashboardData();
      } else {
        alert('Failed: ' + data.message);
      }
    } catch (error) {
      console.error('Error sanctioning funds:', error);
      alert('An error occurred');
    }
  };

  const handleKYCVerification = async (kycId, approved) => {
    try {
      const response = await fetch('/api/kyc/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kycId,
          adminId: user.id,
          approved
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(approved ? '✅ KYC Approved!' : '❌ KYC Rejected');
        setSelectedKYC(null);
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error verifying KYC:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  if (!user) return <div style={styles.loading}>Loading...</div>;

  const COLORS = ['#4299e1', '#48bb78', '#ed8936', '#9f7aea', '#f56565'];

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <h1>🧠 Admin Control Panel</h1>
        <div style={styles.userInfo}>
          <span>{user.name}</span>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>
      </header>

      {/* Stats Overview */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#4299e1'}}>💰</div>
          <div>
            <div style={styles.statNumber}>₹{(stats.totalRaised || 0).toLocaleString('en-IN')}</div>
            <div style={styles.statLabel}>Total Raised</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#48bb78'}}>👥</div>
          <div>
            <div style={styles.statNumber}>{allUsers.filter(u => u.role === 'donor').length}</div>
            <div style={styles.statLabel}>Active Donors</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#ed8936'}}>🤝</div>
          <div>
            <div style={styles.statNumber}>{allUsers.filter(u => u.role === 'helper').length}</div>
            <div style={styles.statLabel}>Helpers</div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#9f7aea'}}>📝</div>
          <div>
            <div style={styles.statNumber}>{pendingRequests.length}</div>
            <div style={styles.statLabel}>Pending Requests</div>
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
          onClick={() => setActiveTab('requests')}
          style={activeTab === 'requests' ? styles.tabActive : styles.tab}
        >
          📝 Requests ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('sanction')}
          style={activeTab === 'sanction' ? styles.tabActive : styles.tab}
        >
          💰 Sanction Funds
        </button>
        <button
          onClick={() => setActiveTab('kyc')}
          style={activeTab === 'kyc' ? styles.tabActive : styles.tab}
        >
          ✅ KYC Verification ({pendingKYC.length})
        </button>
        <button
          onClick={() => setActiveTab('campaigns')}
          style={activeTab === 'campaigns' ? styles.tabActive : styles.tab}
        >
          🎯 Campaigns
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={activeTab === 'users' ? styles.tabActive : styles.tab}
        >
          👥 Users
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h2>Platform Analytics</h2>
            <div style={styles.chartsGrid}>
              <div style={styles.chartCard}>
                <h3>Donation Categories</h3>
                {stats.categoryData && Array.isArray(stats.categoryData) && stats.categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label
                      >
                        {stats.categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={styles.emptyChart}>No category data available yet</p>
                )}
              </div>
              <div style={styles.chartCard}>
                <h3>Monthly Trends</h3>
                {stats.monthlyData && Array.isArray(stats.monthlyData) && stats.monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="donations" stroke="#4299e1" strokeWidth={2} />
                      <Line type="monotone" dataKey="requests" stroke="#48bb78" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={styles.emptyChart}>No monthly trend data available yet</p>
                )}
              </div>
            </div>

            <div style={styles.quickStats}>
              <div style={styles.quickStatItem}>
                <strong>Total Campaigns:</strong> {campaigns.length}
              </div>
              <div style={styles.quickStatItem}>
                <strong>Active Requests:</strong> {allRequests.filter(r => r.status !== 'completed').length}
              </div>
              <div style={styles.quickStatItem}>
                <strong>Verified Users:</strong> {allUsers.filter(u => u.kycStatus === 'approved').length}
              </div>
            </div>
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div>
            <h2>Pending Requests for Approval</h2>
            {pendingRequests.length === 0 ? (
              <p style={styles.emptyState}>No pending requests</p>
            ) : (
              <div style={styles.requestsList}>
                {pendingRequests.map(request => (
                  <div key={request.id} style={styles.requestCard}>
                    <div style={styles.requestHeader}>
                      <h3>{request.title}</h3>
                      <span style={styles.urgencyBadge}>
                        {request.urgency === 'high' ? '🔴' : request.urgency === 'medium' ? '🟠' : '🟢'}
                        {request.urgency}
                      </span>
                    </div>
                    <p><strong>Category:</strong> {request.category}</p>
                    <p><strong>Description:</strong> {request.description}</p>
                    <p><strong>Requested By:</strong> {allUsers.find(u => u.id === request.userId)?.name || 'Unknown'}</p>
                    {request.amount && <p><strong>Amount:</strong> ₹{request.amount.toLocaleString('en-IN')}</p>}
                    <p><strong>Type:</strong> {request.type}</p>
                    <p><strong>Submitted:</strong> {new Date(request.createdAt).toLocaleDateString()}</p>
                    
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        style={styles.approveBtn}
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        style={styles.rejectBtn}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Sanction Funds Tab */}
        {activeTab === 'sanction' && (
          <div>
            <h2>Sanction Funds (Approved Requests with Proof)</h2>
            {allRequests.filter(r => r.status === 'approved' && r.proof).length === 0 ? (
              <p style={styles.emptyState}>No requests ready for sanctioning</p>
            ) : (
              <div style={styles.requestsList}>
                {allRequests.filter(r => r.status === 'approved' && r.proof).map(request => (
                  <div key={request.id} style={styles.sanctionCard}>
                    <h3>{request.title}</h3>
                    <p><strong>Receiver:</strong> {allUsers.find(u => u.id === request.userId)?.name}</p>
                    <p><strong>Requested Amount:</strong> ₹{request.amount?.toLocaleString('en-IN')}</p>
                    <div style={styles.proofSection}>
                      <strong>Proof Submitted:</strong>
                      <p>{request.proof}</p>
                    </div>
                    
                    {selectedRequest?.id === request.id ? (
                      <form onSubmit={handleSanctionFunds} style={styles.sanctionForm}>
                        <label>
                          Sanction Amount (₹):
                          <input
                            type="number"
                            value={sanctionAmount}
                            onChange={(e) => setSanctionAmount(e.target.value)}
                            max={request.amount}
                            min="1"
                            required
                            style={styles.input}
                          />
                        </label>
                        <div style={styles.actionButtons}>
                          <button type="submit" style={styles.approveBtn}>
                            💰 Sanction Funds
                          </button>
                          <button
                            type="button"
                            onClick={() => setSelectedRequest(null)}
                            style={styles.cancelBtn}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button
                        onClick={() => setSelectedRequest(request)}
                        style={styles.sanctionBtn}
                      >
                        💰 Sanction Funds
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* KYC Tab */}
        {activeTab === 'kyc' && (
          <div>
            <h2>KYC Verification Queue</h2>
            {pendingKYC.length === 0 ? (
              <p style={styles.emptyState}>No pending KYC verifications</p>
            ) : (
              <div style={styles.kycList}>
                {pendingKYC.map(kyc => {
                  const kycUser = allUsers.find(u => u.id === kyc.userId);
                  return (
                    <div key={kyc.id} style={styles.kycCard}>
                      <h3>{kycUser?.name || 'Unknown User'}</h3>
                      <p><strong>Email:</strong> {kycUser?.email}</p>
                      <p><strong>Role:</strong> {kycUser?.role}</p>
                      <p><strong>Document Type:</strong> {kyc.documentType}</p>
                      <p><strong>Document Number:</strong> {kyc.documentNumber}</p>
                      <p><strong>Submitted:</strong> {new Date(kyc.submittedAt).toLocaleDateString()}</p>
                      
                      {selectedKYC?.id === kyc.id ? (
                        <div style={styles.kycReview}>
                          <p>Review this KYC submission:</p>
                          <div style={styles.actionButtons}>
                            <button
                              onClick={() => handleKYCVerification(kyc.id, true)}
                              style={styles.approveBtn}
                            >
                              ✅ Approve KYC
                            </button>
                            <button
                              onClick={() => handleKYCVerification(kyc.id, false)}
                              style={styles.rejectBtn}
                            >
                              ❌ Reject KYC
                            </button>
                            <button
                              onClick={() => setSelectedKYC(null)}
                              style={styles.cancelBtn}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedKYC(kyc)}
                          style={styles.reviewBtn}
                        >
                          🔍 Review
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div>
            <h2>Active Campaigns</h2>
            <div style={styles.campaignsList}>
              {campaigns.map(campaign => (
                <div key={campaign.id} style={styles.campaignCard}>
                  <h3>{campaign.title}</h3>
                  <p>{campaign.description}</p>
                  <div style={styles.progressBar}>
                    <div
                      style={{
                        ...styles.progressFill,
                        width: `${(campaign.raised / campaign.goal) * 100}%`
                      }}
                    />
                  </div>
                  <p>₹{campaign.raised.toLocaleString('en-IN')} / ₹{campaign.goal.toLocaleString('en-IN')}</p>
                  <p><strong>Status:</strong> {campaign.status}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h2>All Users</h2>
            <div style={styles.usersTable}>
              <table style={{width: '100%', borderCollapse: 'collapse'}}>
                <thead>
                  <tr style={{backgroundColor: '#f7fafc'}}>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Role</th>
                    <th style={styles.th}>KYC Status</th>
                    <th style={styles.th}>Trust Score</th>
                    <th style={styles.th}>Badge</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(u => (
                    <tr key={u.id}>
                      <td style={styles.td}>{u.name}</td>
                      <td style={styles.td}>{u.email}</td>
                      <td style={styles.td}>{u.role}</td>
                      <td style={styles.td}>
                        <span style={{
                          color: u.kycStatus === 'approved' ? '#48bb78' : '#ed8936'
                        }}>
                          {u.kycStatus || 'pending'}
                        </span>
                      </td>
                      <td style={styles.td}>{u.trustScore || 0}</td>
                      <td style={styles.td}>{u.badge || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f7fafc',
    fontFamily: "'Segoe UI', sans-serif",
    paddingTop: '70px' // Space for fixed header
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
    padding: '0 30px 30px'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px',
    backgroundColor: 'white',
    borderRadius: '12px',
    color: '#718096'
  },
  requestsList: {
    display: 'grid',
    gap: '20px'
  },
  requestCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  requestHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  urgencyBadge: {
    padding: '6px 12px',
    borderRadius: '12px',
    fontSize: '0.9rem',
    fontWeight: '600',
    backgroundColor: '#f7fafc'
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '15px'
  },
  approveBtn: {
    padding: '10px 20px',
    backgroundColor: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  rejectBtn: {
    padding: '10px 20px',
    backgroundColor: '#f56565',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  cancelBtn: {
    padding: '10px 20px',
    backgroundColor: '#718096',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  sanctionCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '2px solid #48bb78'
  },
  proofSection: {
    backgroundColor: '#f0fff4',
    padding: '15px',
    borderRadius: '8px',
    margin: '15px 0'
  },
  sanctionForm: {
    marginTop: '20px'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    marginTop: '8px',
    marginBottom: '15px'
  },
  sanctionBtn: {
    padding: '12px 24px',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    marginTop: '15px'
  },
  kycList: {
    display: 'grid',
    gap: '20px'
  },
  kycCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  kycReview: {
    marginTop: '20px',
    padding: '15px',
    backgroundColor: '#f7fafc',
    borderRadius: '8px'
  },
  reviewBtn: {
    padding: '10px 20px',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    marginTop: '15px'
  },
  campaignsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px'
  },
  campaignCard: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  progressBar: {
    height: '10px',
    backgroundColor: '#e2e8f0',
    borderRadius: '5px',
    overflow: 'hidden',
    margin: '15px 0'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#48bb78',
    transition: 'width 0.3s'
  },
  usersTable: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  th: {
    textAlign: 'left',
    padding: '12px',
    borderBottom: '2px solid #e2e8f0',
    fontWeight: '600',
    color: '#2d3748'
  },
  td: {
    padding: '12px',
    borderBottom: '1px solid #e2e8f0'
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  chartCard: {
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  emptyChart: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#a0aec0',
    fontSize: '0.95rem'
  },
  quickStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginTop: '30px'
  },
  quickStatItem: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  }
};

export default AdminDashboard;
