import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';

export default function ImpactPage() {
  const { qrCode } = useParams();
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(`/api/impact/${qrCode}`);
        const data = await response.json();
        
        if (data.success) {
          setImpactData(data.data);
        } else {
          setError(data.message);
        }
      } catch (e) {
        setError('Failed to load impact data');
      } finally {
        setLoading(false);
      }
    })();
  }, [qrCode]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ fontSize: '2rem', color: 'white' }}>🔄 Loading Impact Data...</div>
      </div>
    );
  }

  if (error || !impactData) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '2rem'
      }}>
        <div style={{ background: 'white', borderRadius: '20px', padding: '3rem', textAlign: 'center', maxWidth: '500px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
          <h2 style={{ color: '#374151', marginBottom: '1rem' }}>Invalid QR Code</h2>
          <p style={{ color: '#6b7280' }}>{error || 'This QR code does not exist or has expired.'}</p>
        </div>
      </div>
    );
  }

  const { transaction, campaign, receiver } = impactData;
  const progress = campaign ? (campaign.raised / campaign.goal) * 100 : 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '2rem 1rem'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            🌍 Anonymous Donation Impact Tracker
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '1.1rem' }}>
            Your generosity in action — complete transparency, total privacy
          </p>
        </div>

        {/* QR Code Display */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <QRCode value={window.location.href} size={150} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
              QR Code ID
            </div>
            <div style={{
              background: '#f3f4f6',
              padding: '0.75rem',
              borderRadius: '8px',
              fontFamily: 'monospace',
              color: '#374151',
              fontWeight: '500'
            }}>
              {qrCode}
            </div>
          </div>
        </div>

        {/* Donation Info */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '2rem',
          marginBottom: '2rem',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <h3 style={{ color: '#374151', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
            💰 Your Contribution
          </h3>
          
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '12px',
            padding: '2rem',
            color: 'white',
            textAlign: 'center',
            marginBottom: '1.5rem'
          }}>
            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
              Donation Amount
            </div>
            <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>
              ₹{transaction.amount.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.875rem', opacity: 0.9, marginTop: '0.5rem' }}>
              Donated on {new Date(transaction.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div style={{
            background: '#ede9fe',
            borderRadius: '12px',
            padding: '1.5rem'
          }}>
            <div style={{ fontWeight: '500', color: '#5b21b6', marginBottom: '0.75rem' }}>
              ✨ Your Impact Story:
            </div>
            <p style={{ color: '#6b21a8', margin: 0, lineHeight: 1.6 }}>
              {transaction.impactStory || 'Your donation is making a real difference!'}
            </p>
          </div>
        </div>

        {/* Campaign Details */}
        {campaign && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ color: '#374151', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
              🎯 Campaign Details
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ color: '#111827', marginBottom: '0.5rem', fontSize: '1.25rem' }}>
                {campaign.title}
              </h4>
              <p style={{ color: '#6b7280', margin: 0 }}>
                {campaign.description}
              </p>
            </div>

            {/* Progress Bar */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#6b7280' }}>Campaign Progress</span>
                <span style={{ color: '#667eea', fontWeight: '500' }}>{progress.toFixed(1)}%</span>
              </div>
              <div style={{ height: '12px', background: '#e5e7eb', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{
                  width: `${Math.min(100, progress)}%`,
                  height: '100%',
                  background: progress >= 100 
                    ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)' 
                    : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                  transition: 'width 0.3s'
                }}></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                <span style={{ color: '#6b7280' }}>
                  ₹{campaign.raised.toLocaleString()} raised
                </span>
                <span style={{ color: '#6b7280' }}>
                  of ₹{campaign.goal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Campaign Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                background: '#f9fafb',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Total Donors
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
                  {campaign.donorCount || 0}
                </div>
              </div>
              
              <div style={{
                background: '#f9fafb',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Category
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#111827' }}>
                  {campaign.category?.charAt(0).toUpperCase() + campaign.category?.slice(1)}
                </div>
              </div>

              <div style={{
                background: '#f9fafb',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.25rem' }}>
                  Status
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: campaign.active ? '#10b981' : '#6b7280' }}>
                  {campaign.active ? '✅ Active' : '⏸️ Completed'}
                </div>
              </div>
            </div>

            {/* Verified Proof */}
            {campaign.proofImages && campaign.proofImages.length > 0 && (
              <div>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem', fontWeight: '500' }}>
                  ✅ Verified Proof of Impact:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
                  {campaign.proofImages.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Proof ${idx + 1}`}
                      style={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '2px solid #10b981'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Receiver Info (if available) */}
        {receiver && (
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '2rem',
            marginBottom: '2rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ color: '#374151', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
              🙋 Beneficiary Information
            </h3>
            <div style={{
              background: '#f9fafb',
              padding: '1.5rem',
              borderRadius: '12px'
            }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Name:</span>{' '}
                <span style={{ fontWeight: '500', color: '#111827' }}>{receiver.name}</span>
              </div>
              {receiver.location && (
                <div>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Location:</span>{' '}
                  <span style={{ fontWeight: '500', color: '#111827' }}>{receiver.location.address}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Message */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '16px',
          padding: '2rem',
          textAlign: 'center',
          color: 'white'
        }}>
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>
            🙏 Thank you for your generosity!
          </p>
          <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>
            "Empathy meets technology — building a nation where every good deed leaves a visible footprint."
          </p>
          <p style={{ fontSize: '0.875rem', opacity: 0.8, marginTop: '1rem' }}>
            Bookmark this page or save the QR code to track your donation's impact anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
