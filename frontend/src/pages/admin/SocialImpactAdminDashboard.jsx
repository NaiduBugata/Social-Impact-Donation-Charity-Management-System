import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateBulkStudentsPDF } from '../../utils/pdfGenerator';
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
        // Normalize request objects to have `id` (from Mongo `_id`) for client-side lookups
        const normalizedRequests = (requestsData.data || []).map(r => ({ ...r, id: r.id || r._id }));
        setAllRequests(normalizedRequests);
        setPendingRequests(normalizedRequests.filter(r => r.status === 'pending') || []);
      }

      // Load pending KYC
      const kycRes = await fetch('/api/kyc');
      const kycData = await kycRes.json();
      if (kycData.success) {
        setPendingKYC((kycData.data || []).filter(k => k.status === 'pending'));
      }

      // Load campaigns
      const campaignsRes = await fetch('/api/campaigns');
      const campaignsData = await campaignsRes.json();
      if (campaignsData.success) {
        // Normalize campaign objects to have `id` (from Mongo `_id`) for client-side lookups
        const normalizedCampaigns = (campaignsData.data || []).map(c => ({ ...c, id: c.id || c._id }));
        setCampaigns(normalizedCampaigns || []);
      }

      // Load all users
      const usersRes = await fetch('/api/users');
      const usersData = await usersRes.json();
      if (usersData.success) {
        // Normalize user objects to have `id` matching Mongo `_id` so client lookups work
        const normalizedUsers = (usersData.data || []).map(u => ({ ...u, id: u.id || u._id }));
        setAllUsers(normalizedUsers || []);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

    const handleApproveRequest = async (requestId) => {
    if (!confirm('Approve this request? This will generate login credentials for the beneficiary.')) {
      return;
    }

    try {
        // Get request details from local cache for immediate PDF generation
        const request = allRequests.find(r => r.id === requestId);
        const beneficiary = allUsers.find(u => u.id === request?.userId);

        console.log('Approving request (requestId):', requestId);

        // Perform the approval network request which will generate password
        const response = await fetch('/api/requests/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ requestId, adminId: user.id })
        });
        const data = await response.json();
        
        if (data.success && data.credentials) {
          // Backend generated the credentials and stored the password
          console.log('Approval successful, credentials generated:', data.credentials);
          console.log('Email sent status:', data.emailSent);
          
          // Automatically generate and download PDF with the actual credentials
          try {
            const isOrganization = data.credentials.role === 'organization' || data.credentials.role === 'ngo';
            
            const pdfData = [{
              name: data.credentials.name,
              email: data.credentials.email,
              rollNumber: request?.id || requestId,
              password: data.credentials.password,  // Real password from backend
              course: request?.category || request?.type || 'General Assistance',
              year: new Date().getFullYear(),
              requestTitle: request?.title || 'Approved Request',
              requestedAmount: request?.amount ? `₹${request.amount}` : 'N/A',
              userRole: isOrganization ? 'NGO/Organization' : 'Receiver/Beneficiary'
            }];

            console.log('Generating approval PDF with actual credentials:', pdfData);
            const orgName = isOrganization ? `${data.credentials.name} - Login Credentials` : 'Beneficiary Login Credentials';
            const fileName = generateBulkStudentsPDF(pdfData, orgName);
            console.log('PDF generated successfully with credentials:', fileName);
            
            const emailStatus = data.emailSent ? '✅ Credentials email sent successfully!' : '⚠️ Email sending failed (check backend logs)';
            alert(`✅ Request approved!\n\n📄 PDF Downloaded: ${fileName}\n📧 ${emailStatus}\n\nCredentials:\nEmail: ${data.credentials.email}\nPassword: ${data.credentials.password}\n\nThe beneficiary will receive their login credentials via email.`);
          } catch (pdfError) {
            console.error('PDF generation error:', pdfError);
            const emailStatus = data.emailSent ? 'Credentials email sent to beneficiary' : 'Email sending failed';
            alert(`✅ Request approved!\n\n📧 ${emailStatus}\n\nCredentials:\nEmail: ${data.credentials.email}\nPassword: ${data.credentials.password}\n\n⚠️ PDF generation failed: ${pdfError.message}`);
          }
          
          loadDashboardData();
        } else {
          alert('Failed: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Failed to approve request: ' + error.message);
    }
  };

  const handleRejectRequest = async (requestId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const response = await fetch('/api/requests/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, adminId: user.id, reason })
      });
      const data = await response.json();
      if (data.success) {
        alert('❌ Request rejected');
        loadDashboardData();
      } else {
        alert('Failed: ' + data.message);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleSanctionFunds = async (e) => {
    e.preventDefault();
    if (!selectedRequest || !sanctionAmount) return;

    try {
      const response = await fetch('/api/requests/sanction', {
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
        // Get beneficiary details
        const beneficiary = allUsers.find(u => u.id === selectedRequest.userId);
        
        console.log('Sanction successful, beneficiary:', beneficiary);
        console.log('Selected request:', selectedRequest);
        
        if (beneficiary) {
          // Generate PDF with beneficiary sanction details
          const pdfData = [{
            name: beneficiary.name,
            email: beneficiary.email,
            rollNumber: selectedRequest.id,
            password: '****', // Password is hashed, show placeholder
            course: selectedRequest.category || 'N/A',
            year: new Date().getFullYear(),
            sanctionedAmount: sanctionAmount,
            requestTitle: selectedRequest.title
          }];
          
          console.log('PDF Data:', pdfData);
          
          // Generate PDF
          try {
            console.log('Attempting to generate PDF...');
            const fileName = generateBulkStudentsPDF(pdfData, 'Social Impact Platform');
            console.log('PDF generated successfully:', fileName);
            alert(`✅ ₹${sanctionAmount} sanctioned successfully!\n\n📄 PDF Downloaded: ${fileName}\nPlease check your downloads folder.`);
          } catch (pdfError) {
            console.error('PDF generation error:', pdfError);
            alert(`✅ ₹${sanctionAmount} sanctioned successfully!\n\n⚠️ PDF generation failed: ${pdfError.message}\n\nBeneficiary: ${beneficiary.name} (${beneficiary.email})`);
          }
        } else {
          alert(`✅ ₹${sanctionAmount} sanctioned successfully!`);
        }
        
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

  const handleApproveCampaign = async (campaignId) => {
    console.log('Approving campaign with ID:', campaignId);
    
    if (!campaignId) {
      alert('❌ Error: Campaign ID is missing');
      return;
    }
    
    if (!confirm('Approve this campaign and make it live?')) return;

    try {
      const url = `/api/campaigns/${campaignId}/approve`;
      console.log('Calling URL:', url);
      
      const response = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        const text = await response.text();
        console.error('Response error:', text);
        throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
      }

      const data = await response.json();
      if (data.success) {
        alert('✅ Campaign approved successfully!');
        loadDashboardData();
      } else {
        alert('❌ Failed to approve campaign: ' + data.message);
      }
    } catch (error) {
      console.error('Error approving campaign:', error);
      alert('❌ Error approving campaign: ' + error.message);
    }
  };

  const handleRejectCampaign = async (campaignId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Response error:', text);
        throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
      }

      const data = await response.json();
      if (data.success) {
        alert('❌ Campaign rejected');
        loadDashboardData();
      } else {
        alert('❌ Failed to reject campaign: ' + data.message);
      }
    } catch (error) {
      console.error('Error rejecting campaign:', error);
      alert('❌ Error rejecting campaign: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/');
  };

  const downloadCredentialsPDF = (request) => {
    console.log('Downloading credentials PDF for request:', request);
    try {
      const beneficiary = allUsers.find(u => u.id === request.userId);
      if (!beneficiary) {
        alert('❌ Beneficiary information not found. Please refresh the page.');
        return;
      }

      const isOrganization = beneficiary.role === 'organization' || beneficiary.role === 'ngo';
      
      // Generate password format (same as backend logic)
      let generatedPassword = '';
      if (isOrganization) {
        const orgNameClean = beneficiary.name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
        generatedPassword = `${orgNameClean}@2025`;
      } else {
        generatedPassword = `${beneficiary._id?.slice(-6)?.toUpperCase() || 'USER'}@ODCMS`;
      }

      const pdfData = [{
        name: beneficiary.name,
        email: beneficiary.email,
        rollNumber: request.id,
        password: generatedPassword,
        course: request.category || request.type || 'General Assistance',
        year: new Date().getFullYear(),
        requestTitle: request.title || 'Approved Request',
        requestedAmount: request.amount ? `₹${request.amount}` : 'N/A',
        userRole: isOrganization ? 'NGO/Organization' : 'Receiver/Beneficiary'
      }];

      const orgName = isOrganization ? `${beneficiary.name} - Login Credentials` : 'Beneficiary Login Credentials';
      const fileName = generateBulkStudentsPDF(pdfData, orgName);
      console.log('Credentials PDF downloaded:', fileName);
      alert(`📄 Credentials PDF Downloaded: ${fileName}\n\nEmail: ${beneficiary.email}\nPassword: ${generatedPassword}`);
    } catch (error) {
      console.error('Error downloading credentials PDF:', error);
      alert(`❌ Failed to download PDF: ${error.message}`);
    }
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
            <div style={styles.statLabel}>Total Funds Raised</div>
            <div style={{fontSize: '0.75rem', color: '#718096', marginTop: '4px'}}>
              Campaigns + Donations + Sanctioned
            </div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#48bb78'}}>✅</div>
          <div>
            <div style={styles.statNumber}>{stats.approvedRequests || 0}</div>
            <div style={styles.statLabel}>Approved Requests</div>
            <div style={{fontSize: '0.75rem', color: '#718096', marginTop: '4px'}}>
              {stats.sanctionedRequests || 0} sanctioned
            </div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#ed8936'}}>💵</div>
          <div>
            <div style={styles.statNumber}>₹{(stats.totalSanctioned || 0).toLocaleString('en-IN')}</div>
            <div style={styles.statLabel}>Funds Sanctioned</div>
            <div style={{fontSize: '0.75rem', color: '#718096', marginTop: '4px'}}>
              To {stats.sanctionedRequests || 0} requests
            </div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#9f7aea'}}>🎯</div>
          <div>
            <div style={styles.statNumber}>{stats.activeCampaigns || 0}</div>
            <div style={styles.statLabel}>Active Campaigns</div>
            <div style={{fontSize: '0.75rem', color: '#718096', marginTop: '4px'}}>
              ₹{(stats.totalRaisedFromCampaigns || 0).toLocaleString('en-IN')} raised
            </div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#f56565'}}>📝</div>
          <div>
            <div style={styles.statNumber}>{stats.pendingRequests || 0}</div>
            <div style={styles.statLabel}>Pending Requests</div>
            <div style={{fontSize: '0.75rem', color: '#718096', marginTop: '4px'}}>
              Awaiting approval
            </div>
          </div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statIcon, background: '#38b2ac'}}>👥</div>
          <div>
            <div style={styles.statNumber}>{stats.totalUsers || 0}</div>
            <div style={styles.statLabel}>Total Users</div>
            <div style={{fontSize: '0.75rem', color: '#718096', marginTop: '4px'}}>
              {stats.verifiedUsers || 0} verified
            </div>
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
          🎯 Campaigns ({campaigns.filter(c => c.status === 'pending').length} pending)
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={activeTab === 'users' ? styles.tabActive : styles.tab}
        >
          👥 Users
        </button>
        <button
          onClick={() => navigate('/admin/impact-stories')}
          style={styles.tab}
        >
          📖 Impact Stories
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h2>📊 Platform Analytics & Insights</h2>
            
            {/* Financial Summary */}
            <div style={styles.analyticsSection}>
              <h3 style={styles.sectionHeading}>💰 Financial Overview</h3>
              <div style={styles.analyticsGrid}>
                <div style={styles.analyticCard}>
                  <div style={styles.analyticIcon}>💵</div>
                  <div style={styles.analyticContent}>
                    <div style={styles.analyticValue}>₹{(stats.totalRaised || 0).toLocaleString('en-IN')}</div>
                    <div style={styles.analyticLabel}>Total Funds Raised</div>
                    <div style={styles.analyticSubtext}>All sources combined</div>
                  </div>
                </div>
                <div style={styles.analyticCard}>
                  <div style={styles.analyticIcon}>🎯</div>
                  <div style={styles.analyticContent}>
                    <div style={styles.analyticValue}>₹{(stats.totalRaisedFromCampaigns || 0).toLocaleString('en-IN')}</div>
                    <div style={styles.analyticLabel}>Campaign Donations</div>
                    <div style={styles.analyticSubtext}>From {stats.activeCampaigns || 0} active campaigns</div>
                  </div>
                </div>
                <div style={styles.analyticCard}>
                  <div style={styles.analyticIcon}>✅</div>
                  <div style={styles.analyticContent}>
                    <div style={styles.analyticValue}>₹{(stats.totalSanctioned || 0).toLocaleString('en-IN')}</div>
                    <div style={styles.analyticLabel}>Sanctioned Funds</div>
                    <div style={styles.analyticSubtext}>To {stats.sanctionedRequests || 0} beneficiaries</div>
                  </div>
                </div>
                <div style={styles.analyticCard}>
                  <div style={styles.analyticIcon}>📈</div>
                  <div style={styles.analyticContent}>
                    <div style={styles.analyticValue}>₹{(stats.averageDonation || 0).toLocaleString('en-IN')}</div>
                    <div style={styles.analyticLabel}>Average Donation</div>
                    <div style={styles.analyticSubtext}>{stats.transactionCount || 0} transactions</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Request Analytics */}
            <div style={styles.analyticsSection}>
              <h3 style={styles.sectionHeading}>📝 Request Analytics</h3>
              <div style={styles.analyticsGrid}>
                <div style={styles.analyticCard}>
                  <div style={styles.analyticIcon}>📊</div>
                  <div style={styles.analyticContent}>
                    <div style={styles.analyticValue}>{stats.totalRequests || 0}</div>
                    <div style={styles.analyticLabel}>Total Requests</div>
                    <div style={styles.analyticSubtext}>All time</div>
                  </div>
                </div>
                <div style={styles.analyticCard}>
                  <div style={{...styles.analyticIcon, background: '#fed7d7'}}>⏳</div>
                  <div style={styles.analyticContent}>
                    <div style={styles.analyticValue}>{stats.pendingRequests || 0}</div>
                    <div style={styles.analyticLabel}>Pending Approval</div>
                    <div style={styles.analyticSubtext}>Awaiting review</div>
                  </div>
                </div>
                <div style={styles.analyticCard}>
                  <div style={{...styles.analyticIcon, background: '#c6f6d5'}}>✅</div>
                  <div style={styles.analyticContent}>
                    <div style={styles.analyticValue}>{stats.approvedRequests || 0}</div>
                    <div style={styles.analyticLabel}>Approved</div>
                    <div style={styles.analyticSubtext}>Awaiting sanctions</div>
                  </div>
                </div>
                <div style={styles.analyticCard}>
                  <div style={{...styles.analyticIcon, background: '#bee3f8'}}>💰</div>
                  <div style={styles.analyticContent}>
                    <div style={styles.analyticValue}>{stats.sanctionedRequests || 0}</div>
                    <div style={styles.analyticLabel}>Sanctioned</div>
                    <div style={styles.analyticSubtext}>Funds released</div>
                  </div>
                </div>
                <div style={styles.analyticCard}>
                  <div style={{...styles.analyticIcon, background: '#d4f4dd'}}>🎉</div>
                  <div style={styles.analyticContent}>
                    <div style={styles.analyticValue}>{stats.completedRequests || 0}</div>
                    <div style={styles.analyticLabel}>Completed</div>
                    <div style={styles.analyticSubtext}>Successfully fulfilled</div>
                  </div>
                </div>
                <div style={styles.analyticCard}>
                  <div style={{...styles.analyticIcon, background: '#fed7d7'}}>❌</div>
                  <div style={styles.analyticContent}>
                    <div style={styles.analyticValue}>{stats.rejectedRequests || 0}</div>
                    <div style={styles.analyticLabel}>Rejected</div>
                    <div style={styles.analyticSubtext}>Not approved</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div style={styles.chartsGrid}>
              <div style={styles.chartCard}>
                <h3>Campaign Categories</h3>
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
                <h3>Monthly Donation Trends</h3>
                {stats.monthlyDonations && Array.isArray(stats.monthlyDonations) && stats.monthlyDonations.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.monthlyDonations}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="total" name="Amount (₹)" stroke="#4299e1" strokeWidth={2} />
                      <Line type="monotone" dataKey="count" name="Transactions" stroke="#48bb78" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p style={styles.emptyChart}>No monthly trend data available yet</p>
                )}
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
                      <div style={styles.actionButtons}>
                        <button
                          onClick={() => setSelectedRequest(request)}
                          style={styles.sanctionBtn}
                        >
                          💰 Sanction Funds
                        </button>
                        <button
                          onClick={() => downloadCredentialsPDF(request)}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: '#9f7aea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            marginLeft: '10px'
                          }}
                        >
                          📄 Download Credentials
                        </button>
                      </div>
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
            <h2>📋 Campaign Management</h2>
            
            {/* Pending Campaigns */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#ed8936', marginBottom: '15px' }}>⏳ Pending Approval ({campaigns.filter(c => c.status === 'pending').length})</h3>
              <div style={styles.campaignsList}>
                {campaigns.filter(c => c.status === 'pending').length === 0 ? (
                  <p style={{ color: '#718096', fontStyle: 'italic' }}>No pending campaigns</p>
                ) : (
                  campaigns.filter(c => c.status === 'pending').map(campaign => (
                    <div key={campaign.id} style={{ ...styles.campaignCard, borderLeft: '4px solid #ed8936' }}>
                      <h3>{campaign.title}</h3>
                      <p style={{ color: '#4a5568', marginBottom: '10px' }}>{campaign.description}</p>
                      <div style={{ marginBottom: '10px' }}>
                        <span style={styles.badge}>📁 {campaign.category}</span>
                        <span style={styles.badge}>📍 {campaign.location?.address || 'Location not specified'}</span>
                      </div>
                      <p><strong>Funding Goal:</strong> ₹{campaign.goal?.toLocaleString('en-IN') || 0}</p>
                      <p><strong>Deadline:</strong> {campaign.deadline ? new Date(campaign.deadline).toLocaleDateString() : 'Not specified'}</p>
                      <p><strong>Created By:</strong> {campaign.createdBy}</p>
                      <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                        <button
                          onClick={() => handleApproveCampaign(campaign._id || campaign.id)}
                          style={styles.approveBtn}
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => handleRejectCampaign(campaign._id || campaign.id)}
                          style={styles.rejectBtn}
                        >
                          ❌ Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Active Campaigns */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ color: '#48bb78', marginBottom: '15px' }}>✅ Active Campaigns ({campaigns.filter(c => c.status === 'active').length})</h3>
              <div style={styles.campaignsList}>
                {campaigns.filter(c => c.status === 'active').length === 0 ? (
                  <p style={{ color: '#718096', fontStyle: 'italic' }}>No active campaigns</p>
                ) : (
                  campaigns.filter(c => c.status === 'active').map(campaign => (
                    <div key={campaign.id} style={{ ...styles.campaignCard, borderLeft: '4px solid #48bb78' }}>
                      <h3>{campaign.title}</h3>
                      <p style={{ color: '#4a5568', marginBottom: '10px' }}>{campaign.description}</p>
                      <div style={{ marginBottom: '10px' }}>
                        <span style={styles.badge}>📁 {campaign.category}</span>
                        <span style={styles.badge}>📍 {campaign.location?.address || 'N/A'}</span>
                      </div>
                      <div style={styles.progressBar}>
                        <div
                          style={{
                            ...styles.progressFill,
                            width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%`
                          }}
                        />
                      </div>
                      <p><strong>Progress:</strong> ₹{campaign.raised?.toLocaleString('en-IN') || 0} / ₹{campaign.goal?.toLocaleString('en-IN') || 0}</p>
                      <p><strong>Status:</strong> <span style={{ color: '#48bb78' }}>Active ✓</span></p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Rejected Campaigns */}
            <div>
              <h3 style={{ color: '#e53e3e', marginBottom: '15px' }}>🚫 Rejected Campaigns ({campaigns.filter(c => c.status === 'rejected').length})</h3>
              <div style={styles.campaignsList}>
                {campaigns.filter(c => c.status === 'rejected').length === 0 ? (
                  <p style={{ color: '#718096', fontStyle: 'italic' }}>No rejected campaigns</p>
                ) : (
                  campaigns.filter(c => c.status === 'rejected').map(campaign => (
                    <div key={campaign.id} style={{ ...styles.campaignCard, borderLeft: '4px solid #e53e3e', opacity: 0.7 }}>
                      <h3>{campaign.title}</h3>
                      <p style={{ color: '#4a5568' }}>{campaign.description}</p>
                      <p><strong>Status:</strong> <span style={{ color: '#e53e3e' }}>Rejected ✗</span></p>
                    </div>
                  ))
                )}
              </div>
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
  badge: {
    display: 'inline-block',
    padding: '5px 12px',
    backgroundColor: '#edf2f7',
    color: '#4a5568',
    borderRadius: '12px',
    fontSize: '0.85rem',
    marginRight: '8px',
    marginBottom: '8px'
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
  },
  analyticsSection: {
    marginBottom: '40px'
  },
  sectionHeading: {
    fontSize: '1.4rem',
    color: '#2d3748',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '2px solid #e2e8f0'
  },
  analyticsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  analyticCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'default'
  },
  analyticIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    flexShrink: 0
  },
  analyticContent: {
    flex: 1
  },
  analyticValue: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: '4px'
  },
  analyticLabel: {
    fontSize: '0.9rem',
    color: '#4a5568',
    fontWeight: '600',
    marginBottom: '2px'
  },
  analyticSubtext: {
    fontSize: '0.75rem',
    color: '#a0aec0'
  }
};

export default AdminDashboard;
