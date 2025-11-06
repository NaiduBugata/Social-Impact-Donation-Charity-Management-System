import React, { useState } from 'react';
import QRCode from 'react-qr-code';

export default function DonationFlow({ campaign, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [donationType, setDonationType] = useState(null); // 'financial' or 'service'
  const [amount, setAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [result, setResult] = useState(null);
  const [impactStory, setImpactStory] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

  const predefinedAmounts = [500, 1000, 2000, 5000, 10000];

  const handleDonate = async () => {
    if (donationType === 'financial') {
      if (!amount || amount <= 0) {
        alert('Please enter a valid amount');
        return;
      }

      try {
        const response = await fetch('/api/donate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaignId: campaign.id,
            donorId: currentUser.id,
            amount: parseFloat(amount),
            isAnonymous
          })
        });

        const data = await response.json();
        
        if (data.success) {
          setResult(data.data);
          setImpactStory(data.data.impactStory);
          setStep(3);
          if (onSuccess) onSuccess(data.data);
        } else {
          alert(data.message || 'Donation failed');
        }
      } catch (error) {
        alert('Error processing donation: ' + error.message);
      }
    } else if (donationType === 'service') {
      // Service donation flow
      alert('Service donation flow - helper will be notified to provide assistance');
      if (onClose) onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '2rem',
          borderRadius: '20px 20px 0 0',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '1.75rem' }}>
              {step === 1 && '💫 Choose Contribution Type'}
              {step === 2 && '💰 Donation Details'}
              {step === 3 && '✅ Donation Successful!'}
            </h2>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              fontSize: '1.5rem',
              cursor: 'pointer',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>×</button>
          </div>
          <p style={{ margin: '0.5rem 0 0 0', opacity: 0.9 }}>
            {campaign.title}
          </p>
        </div>

        <div style={{ padding: '2rem' }}>
          {/* Step 1: Choose Donation Type */}
          {step === 1 && (
            <div>
              <h3 style={{ marginBottom: '1.5rem', color: '#374151' }}>
                How would you like to contribute?
              </h3>
              
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div
                  onClick={() => {
                    setDonationType('financial');
                    setStep(2);
                  }}
                  style={{
                    border: '2px solid #667eea',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: donationType === 'financial' ? '#f3f4f6' : 'white'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '3rem' }}>💰</div>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#111827' }}>Financial Donation</h4>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                        Contribute money via UPI, card, or bank transfer. Option to donate anonymously with QR tracking.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => {
                    setDonationType('service');
                    setStep(2);
                  }}
                  style={{
                    border: '2px solid #10b981',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: donationType === 'service' ? '#f3f4f6' : 'white'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '3rem' }}>🧑‍⚕️</div>
                    <div>
                      <h4 style={{ margin: '0 0 0.5rem 0', color: '#111827' }}>Service Contribution</h4>
                      <p style={{ margin: 0, color: '#6b7280', fontSize: '0.9rem' }}>
                        Volunteer your time and skills (medical, teaching, counseling). We'll match you with nearby needs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Donation Details */}
          {step === 2 && donationType === 'financial' && (
            <div>
              <h3 style={{ marginBottom: '1.5rem', color: '#374151' }}>
                Enter Donation Amount
              </h3>

              {/* Quick Amount Selection */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                  Quick Select:
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {predefinedAmounts.map(amt => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt.toString())}
                      style={{
                        padding: '0.75rem 1.5rem',
                        border: amount === amt.toString() ? '2px solid #667eea' : '1px solid #d1d5db',
                        borderRadius: '8px',
                        background: amount === amt.toString() ? '#ede9fe' : 'white',
                        cursor: 'pointer',
                        fontWeight: '500',
                        color: amount === amt.toString() ? '#667eea' : '#374151'
                      }}
                    >
                      ₹{amt.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                  Or enter custom amount:
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount in ₹"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>

              {/* Anonymous Option */}
              <div style={{
                background: '#f9fafb',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1.5rem'
              }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <div>
                    <div style={{ fontWeight: '500', color: '#111827' }}>🕵️ Donate Anonymously</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      Your identity will be hidden. You'll receive a QR code to track your donation impact.
                    </div>
                  </div>
                </label>
              </div>

              {/* Payment Method (Simulated) */}
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.75rem' }}>
                  Payment Method:
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button style={{
                    flex: 1,
                    padding: '0.75rem',
                    border: '2px solid #667eea',
                    borderRadius: '8px',
                    background: '#ede9fe',
                    fontWeight: '500',
                    color: '#667eea',
                    cursor: 'pointer'
                  }}>
                    💳 Razorpay (Mock)
                  </button>
                </div>
              </div>

              <button
                onClick={handleDonate}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Proceed to Pay ₹{amount || 0}
              </button>
            </div>
          )}

          {step === 2 && donationType === 'service' && (
            <div>
              <h3 style={{ marginBottom: '1.5rem', color: '#374151' }}>
                Service Contribution Details
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
                As a service donor, you'll be matched with nearby requests based on your profession and location.
                Our AI will notify you when someone needs your expertise.
              </p>
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #86efac',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontWeight: '500', color: '#166534', marginBottom: '0.5rem' }}>
                  ✅ Your Profile:
                </div>
                <div style={{ fontSize: '0.875rem', color: '#15803d' }}>
                  Profession: {currentUser.profession || 'Not set'}<br />
                  Location: {currentUser.location?.address || 'Not set'}
                </div>
              </div>
              <button
                onClick={handleDonate}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Register Interest to Help
              </button>
            </div>
          )}

          {/* Step 3: Success with QR Code */}
          {step === 3 && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
              <h3 style={{ color: '#111827', marginBottom: '1rem' }}>
                Thank You for Your Generosity!
              </h3>
              
              <div style={{
                background: '#f0fdf4',
                border: '2px solid #86efac',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#166534', marginBottom: '0.5rem' }}>
                  Donation Amount
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#16a34a' }}>
                  ₹{result.amount.toLocaleString()}
                </div>
              </div>

              {/* Impact Story */}
              <div style={{
                background: '#ede9fe',
                borderRadius: '12px',
                padding: '1.5rem',
                marginBottom: '1.5rem',
                textAlign: 'left'
              }}>
                <div style={{ fontWeight: '500', color: '#5b21b6', marginBottom: '0.5rem' }}>
                  ✨ Your Impact Story:
                </div>
                <p style={{ color: '#6b21a8', margin: 0 }}>
                  {impactStory}
                </p>
              </div>

              {/* QR Code for Anonymous Donations */}
              {result.isAnonymous && result.qrCode && (
                <div style={{
                  background: 'white',
                  border: '2px solid #667eea',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  marginBottom: '1.5rem'
                }}>
                  <div style={{ fontWeight: '500', color: '#667eea', marginBottom: '1rem' }}>
                    🔲 Your Anonymous Tracking QR Code
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    <QRCode value={window.location.origin + result.trackUrl} size={200} />
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    Save this QR code to track your donation impact anytime — no login required!
                  </div>
                  <div style={{
                    background: '#f3f4f6',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    marginTop: '1rem',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }}>
                    Track URL: {result.trackUrl}
                  </div>
                </div>
              )}

              <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1.5rem' }}>
                Payment ID: {result.paymentId}<br />
                Transaction ID: {result.id}
              </div>

              <button
                onClick={onClose}
                style={{
                  width: '100%',
                  padding: '1rem',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
