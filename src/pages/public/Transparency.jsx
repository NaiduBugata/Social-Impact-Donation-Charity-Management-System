import React, { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export default function Transparency() {
  const [analytics, setAnalytics] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [analyticsRes, campaignsRes] = await Promise.all([
          fetch('/api/analytics'),
          fetch('/api/campaigns')
        ]);
        
        const analyticsData = await analyticsRes.json();
        const campaignsData = await campaignsRes.json();
        
        if (analyticsData.success) setAnalytics(analyticsData.data);
        if (campaignsData.success) setCampaigns(campaignsData.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <div style={{ fontSize: '2rem' }}>🔄 Loading Transparency Data...</div>
      </div>
    );
  }

  // Prepare category data for charts
  const categoryData = analytics?.categoryData ? Object.entries(analytics.categoryData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    amount: `₹${value.toLocaleString()}`
  })) : [];

  // Prepare trend data (recent transactions)
  const trendData = analytics?.recentTransactions?.slice(0, 10).reverse().map((txn, idx) => ({
    index: idx + 1,
    amount: txn.amount,
    date: new Date(txn.createdAt).toLocaleDateString()
  })) || [];

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '2rem 1rem' }}>
      {/* Header */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', marginBottom: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#667eea', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            🌍 Transparency Dashboard
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#6b7280' }}>
            Real-time visualization of every rupee, every life impacted — trust through data
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', padding: '1.5rem', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>💰 Total Funds Raised</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
            ₹{analytics?.totalRaised?.toLocaleString() || '0'}
          </div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '12px', padding: '1.5rem', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>👥 Active Donors</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
            {analytics?.totalDonors || 0}
          </div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '12px', padding: '1.5rem', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>🧑‍⚕️ Service Helpers</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
            {analytics?.totalHelpers || 0}
          </div>
        </div>
        
        <div style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', borderRadius: '12px', padding: '1.5rem', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
          <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>🎯 Active Campaigns</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginTop: '0.5rem' }}>
            {analytics?.activeCampaigns || 0}
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Category Distribution Pie Chart */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#374151' }}>📊 Fund Distribution by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No data available</div>
          )}
        </div>

        {/* Recent Donation Trend */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#374151' }}>📈 Recent Donation Trend</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="index" label={{ value: 'Transaction #', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Amount (₹)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#667eea" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No recent transactions</div>
          )}
        </div>
      </div>

      {/* Impact Heatmap */}
      {analytics?.locationData && analytics.locationData.length > 0 && (
        <div style={{ maxWidth: '1400px', margin: '0 auto', marginBottom: '2rem' }}>
          <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginBottom: '1.5rem', color: '#374151' }}>🗺️ Geographic Impact Heatmap</h3>
            <div style={{ height: '400px', borderRadius: '12px', overflow: 'hidden' }}>
              <MapContainer
                center={[28.6139, 77.2090]}
                zoom={10}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {analytics.locationData.map((loc, idx) => (
                  <CircleMarker
                    key={idx}
                    center={[loc.lat, loc.lng]}
                    radius={Math.min(30, loc.value / 10000)}
                    fillColor={COLORS[idx % COLORS.length]}
                    fillOpacity={0.6}
                    stroke={true}
                    color="#fff"
                    weight={2}
                  >
                    <Popup>
                      <strong>{loc.title}</strong><br />
                      Amount: ₹{loc.value.toLocaleString()}
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      )}

      {/* Active Campaigns */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', marginBottom: '2rem' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#374151' }}>🎯 Active Verified Campaigns</h3>
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {campaigns.filter(c => c.active && c.verified).map(campaign => {
              const progress = (campaign.raised / campaign.goal) * 100;
              const daysLeft = Math.ceil((new Date(campaign.deadline) - new Date()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={campaign.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', transition: 'transform 0.2s', cursor: 'pointer' }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.5rem' }}>
                          {campaign.category === 'medical' && '🏥'}
                          {campaign.category === 'education' && '📚'}
                          {campaign.category === 'emergency' && '🚨'}
                        </span>
                        <h4 style={{ margin: 0, color: '#111827', fontSize: '1.25rem' }}>{campaign.title}</h4>
                        {campaign.verified && <span style={{ background: '#10b981', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>✓ Verified</span>}
                      </div>
                      <p style={{ color: '#6b7280', margin: '0.5rem 0' }}>{campaign.description}</p>
                      <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                        📍 {campaign.location?.address || 'Location not specified'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '150px' }}>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Raised</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#667eea' }}>
                        ₹{campaign.raised.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                        of ₹{campaign.goal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      <span style={{ color: '#6b7280' }}>{progress.toFixed(1)}% Complete</span>
                      <span style={{ color: daysLeft > 0 ? '#10b981' : '#ef4444' }}>
                        {daysLeft > 0 ? `${daysLeft} days left` : 'Expired'}
                      </span>
                    </div>
                    <div style={{ height: '8px', background: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${Math.min(100, progress)}%`,
                        height: '100%',
                        background: progress >= 100 ? '#10b981' : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                        transition: 'width 0.3s'
                      }}></div>
                    </div>
                  </div>
                  
                  {/* Footer Info */}
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                    <div>👥 {campaign.donorCount || 0} donors</div>
                    <div>📅 Created {new Date(campaign.createdAt).toLocaleDateString()}</div>
                  </div>
                  
                  {/* Proof Images */}
                  {campaign.proofImages && campaign.proofImages.length > 0 && (
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>✅ Verified Proof Documents:</div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {campaign.proofImages.map((img, idx) => (
                          <img key={idx} src={img} alt={`Proof ${idx + 1}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #10b981' }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center', color: 'white', padding: '2rem' }}>
        <p style={{ fontSize: '1.1rem', opacity: 0.9 }}>
          ✨ All data is real-time and verified by admin. Every contribution is tracked and transparent.
        </p>
        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.7 }}>
          "Empathy meets technology — building a nation where every good deed leaves a visible footprint."
        </p>
      </div>
    </div>
  );
}

