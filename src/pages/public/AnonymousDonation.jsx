import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'react-qr-code';

const AnonymousDonation = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [donationComplete, setDonationComplete] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [impactStory, setImpactStory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch active campaigns
    fetch('/api/campaigns')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCampaigns(data.data.filter(c => c.status === 'active'));
        }
      });
  }, []);

  const handleDonate = async (e) => {
    e.preventDefault();
    
    if (!selectedCampaign || !amount || parseFloat(amount) <= 0) {
      alert('Please select a campaign and enter a valid amount');
      return;
    }

    try {
      // Simulate payment processing
      const paymentSuccess = await simulatePayment(amount, paymentMethod);
      
      if (!paymentSuccess) {
        alert('Payment failed. Please try again.');
        return;
      }

      // Create anonymous donation
      const response = await fetch('/api/donate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: selectedCampaign.id,
          amount: parseFloat(amount),
          isAnonymous: true,
          paymentMethod
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setQrCode(data.data.qrCode);
        setImpactStory(data.data.impactStory);
        setDonationComplete(true);
      } else {
        alert('Donation failed: ' + data.message);
      }
    } catch (error) {
      console.error('Donation error:', error);
      alert('An error occurred. Please try again.');
    }
  };

  const simulatePayment = (amount, method) => {
    return new Promise((resolve) => {
      // Simulate payment gateway delay
      setTimeout(() => {
        // In production, integrate Razorpay here
        console.log(`Processing ${method} payment of ₹${amount}`);
        resolve(true); // Simulate success
      }, 1500);
    });
  };

  const handleTrackImpact = () => {
    navigate(`/impact/${qrCode}`);
  };

  if (donationComplete) {
    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <div style={styles.checkmark}>✓</div>
          <h1 style={styles.successTitle}>Thank You for Your Generosity! 🙏</h1>
          <p style={styles.successText}>
            Your anonymous donation of <strong>₹{amount}</strong> has been successfully processed.
          </p>

          <div style={styles.qrSection}>
            <h3 style={styles.qrTitle}>Your Impact Tracker</h3>
            <p style={styles.qrDescription}>
              Scan or save this QR code to track your donation's impact anytime, anywhere.
            </p>
            <div style={styles.qrCodeWrapper}>
              <QRCodeSVG 
                value={`${window.location.origin}/impact/${qrCode}`}
                size={200}
                level="H"
              />
            </div>
            <p style={styles.qrCodeText}>{qrCode}</p>
          </div>

          <div style={styles.impactStory}>
            <h3 style={styles.storyTitle}>✨ Your Impact Story</h3>
            <p style={styles.storyText}>{impactStory}</p>
          </div>

          <div style={styles.actionButtons}>
            <button onClick={handleTrackImpact} style={styles.trackButton}>
              📊 View Full Impact Report
            </button>
            <button onClick={() => window.location.reload()} style={styles.donateAgainButton}>
              💚 Donate Again
            </button>
            <button onClick={() => navigate('/')} style={styles.homeButton}>
              🏠 Back to Home
            </button>
          </div>

          <div style={styles.shareSection}>
            <p style={styles.shareText}>Share your impact (without revealing your identity):</p>
            <div style={styles.shareButtons}>
              <button style={styles.shareBtn}>
                📱 WhatsApp
              </button>
              <button style={styles.shareBtn}>
                🐦 Twitter
              </button>
              <button style={styles.shareBtn}>
                📘 Facebook
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🌍 Anonymous Donation Portal</h1>
        <p style={styles.subtitle}>
          Make a difference without revealing your identity. Every rupee is tracked with transparency.
        </p>
      </div>

      <form onSubmit={handleDonate} style={styles.form}>
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Select a Campaign</h2>
          <div style={styles.campaignGrid}>
            {campaigns.map(campaign => (
              <div 
                key={campaign.id}
                onClick={() => setSelectedCampaign(campaign)}
                style={{
                  ...styles.campaignCard,
                  ...(selectedCampaign?.id === campaign.id ? styles.campaignCardSelected : {})
                }}
              >
                <div style={styles.campaignHeader}>
                  <h3 style={styles.campaignTitle}>{campaign.title}</h3>
                  <span style={styles.campaignCategory}>{campaign.category}</span>
                </div>
                <p style={styles.campaignDescription}>{campaign.description}</p>
                <div style={styles.progressSection}>
                  <div style={styles.progressBar}>
                    <div 
                      style={{
                        ...styles.progressFill,
                        width: `${(campaign.raised / campaign.goal) * 100}%`
                      }}
                    />
                  </div>
                  <div style={styles.progressText}>
                    <span>₹{campaign.raised.toLocaleString('en-IN')} raised</span>
                    <span>Goal: ₹{campaign.goal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                {selectedCampaign?.id === campaign.id && (
                  <div style={styles.selectedBadge}>✓ Selected</div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Enter Donation Amount</h2>
          <div style={styles.quickAmounts}>
            {[100, 500, 1000, 2000, 5000].map(amt => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(amt.toString())}
                style={{
                  ...styles.quickAmountBtn,
                  ...(amount === amt.toString() ? styles.quickAmountBtnActive : {})
                }}
              >
                ₹{amt}
              </button>
            ))}
          </div>
          <input
            type="number"
            placeholder="Or enter custom amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={styles.amountInput}
            min="1"
            required
          />
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Payment Method</h2>
          <div style={styles.paymentMethods}>
            {[
              { id: 'upi', label: '📱 UPI', icon: 'upi' },
              { id: 'card', label: '💳 Card', icon: 'card' },
              { id: 'netbanking', label: '🏦 Net Banking', icon: 'bank' }
            ].map(method => (
              <label key={method.id} style={styles.paymentOption}>
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={styles.radio}
                />
                <span style={styles.paymentLabel}>{method.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div style={styles.infoBox}>
          <h3 style={styles.infoTitle}>🔒 Your Privacy is Protected</h3>
          <ul style={styles.infoList}>
            <li>✓ No account required</li>
            <li>✓ Your identity remains 100% anonymous</li>
            <li>✓ Receive unique QR code to track impact</li>
            <li>✓ View verified proofs of fund usage</li>
            <li>✓ Secure payment via Razorpay</li>
          </ul>
        </div>

        <button type="submit" style={styles.submitButton}>
          💚 Donate ₹{amount || '___'} Anonymously
        </button>
      </form>

      <div style={styles.footer}>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          ← Back to Home
        </button>
        <button onClick={() => navigate('/transparency')} style={styles.transparencyButton}>
          📊 View Transparency Dashboard
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f0f4f8',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    paddingTop: '20px'
  },
  title: {
    fontSize: '2.5rem',
    color: '#1a202c',
    marginBottom: '10px',
    fontWeight: '700'
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#4a5568',
    maxWidth: '600px',
    margin: '0 auto'
  },
  form: {
    maxWidth: '900px',
    margin: '0 auto',
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
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
  campaignGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px'
  },
  campaignCard: {
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    position: 'relative'
  },
  campaignCardSelected: {
    borderColor: '#48bb78',
    backgroundColor: '#f0fff4',
    transform: 'scale(1.02)'
  },
  campaignHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '10px'
  },
  campaignTitle: {
    fontSize: '1.1rem',
    color: '#2d3748',
    margin: 0
  },
  campaignCategory: {
    fontSize: '0.75rem',
    backgroundColor: '#edf2f7',
    padding: '4px 8px',
    borderRadius: '4px',
    color: '#4a5568'
  },
  campaignDescription: {
    fontSize: '0.9rem',
    color: '#718096',
    marginBottom: '15px'
  },
  progressSection: {
    marginTop: '15px'
  },
  progressBar: {
    height: '8px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '8px'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#48bb78',
    transition: 'width 0.3s'
  },
  progressText: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
    color: '#4a5568'
  },
  selectedBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    backgroundColor: '#48bb78',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  quickAmounts: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
    flexWrap: 'wrap'
  },
  quickAmountBtn: {
    padding: '12px 24px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
    transition: 'all 0.3s'
  },
  quickAmountBtnActive: {
    backgroundColor: '#48bb78',
    color: 'white',
    borderColor: '#48bb78'
  },
  amountInput: {
    width: '100%',
    padding: '15px',
    fontSize: '1.1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    outline: 'none',
    transition: 'border-color 0.3s'
  },
  paymentMethods: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap'
  },
  paymentOption: {
    flex: '1',
    minWidth: '150px',
    padding: '15px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.3s'
  },
  radio: {
    width: '20px',
    height: '20px',
    cursor: 'pointer'
  },
  paymentLabel: {
    fontSize: '1rem',
    fontWeight: '500'
  },
  infoBox: {
    backgroundColor: '#ebf8ff',
    border: '2px solid #90cdf4',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '30px'
  },
  infoTitle: {
    color: '#2c5282',
    marginBottom: '10px',
    fontSize: '1.1rem'
  },
  infoList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    color: '#2d3748'
  },
  submitButton: {
    width: '100%',
    padding: '18px',
    fontSize: '1.2rem',
    fontWeight: '700',
    color: 'white',
    backgroundColor: '#48bb78',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 4px 6px rgba(72, 187, 120, 0.3)'
  },
  footer: {
    maxWidth: '900px',
    margin: '20px auto',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '15px'
  },
  backButton: {
    padding: '12px 24px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  transparencyButton: {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#4299e1',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem'
  },
  // Success page styles
  successCard: {
    maxWidth: '700px',
    margin: '40px auto',
    backgroundColor: 'white',
    padding: '50px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
  },
  checkmark: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#48bb78',
    color: 'white',
    fontSize: '3rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px'
  },
  successTitle: {
    color: '#2d3748',
    marginBottom: '15px'
  },
  successText: {
    fontSize: '1.1rem',
    color: '#4a5568',
    marginBottom: '40px'
  },
  qrSection: {
    marginBottom: '40px'
  },
  qrTitle: {
    color: '#2d3748',
    marginBottom: '10px'
  },
  qrDescription: {
    color: '#718096',
    marginBottom: '20px'
  },
  qrCodeWrapper: {
    display: 'inline-block',
    padding: '20px',
    backgroundColor: 'white',
    border: '3px solid #e2e8f0',
    borderRadius: '12px',
    marginBottom: '15px'
  },
  qrCodeText: {
    fontFamily: 'monospace',
    color: '#4a5568',
    fontSize: '0.9rem'
  },
  impactStory: {
    backgroundColor: '#f7fafc',
    padding: '25px',
    borderRadius: '8px',
    marginBottom: '30px'
  },
  storyTitle: {
    color: '#2d3748',
    marginBottom: '10px'
  },
  storyText: {
    fontSize: '1.1rem',
    color: '#4a5568',
    lineHeight: '1.6',
    fontStyle: 'italic'
  },
  actionButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '30px'
  },
  trackButton: {
    padding: '15px',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  donateAgainButton: {
    padding: '15px',
    backgroundColor: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  homeButton: {
    padding: '15px',
    backgroundColor: '#718096',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1.1rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  shareSection: {
    borderTop: '2px solid #e2e8f0',
    paddingTop: '20px'
  },
  shareText: {
    color: '#4a5568',
    marginBottom: '15px'
  },
  shareButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px'
  },
  shareBtn: {
    padding: '10px 20px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'pointer',
    fontSize: '0.95rem'
  }
};

export default AnonymousDonation;
