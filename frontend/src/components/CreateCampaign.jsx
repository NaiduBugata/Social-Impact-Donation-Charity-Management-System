import React, { useState } from 'react';

const CreateCampaign = ({ userRole, onClose, onSuccess, inline = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Medical',
    fundingGoal: '',
    deadline: '',
    location: ''
  });

  const [loading, setLoading] = useState(false);

  const categories = [
    'Medical',
    'Education',
    'Emergency Relief',
    'Food & Nutrition',
    'Shelter',
    'Elderly Care',
    'Child Welfare',
    'Disaster Relief',
    'Community Development',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.fundingGoal) {
      alert('⚠️ Please fill in all required fields');
      return;
    }

    if (parseFloat(formData.fundingGoal) <= 0) {
      alert('⚠️ Funding goal must be greater than 0');
      return;
    }

    setLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('currentUser'));
      
      const campaignData = {
        ...formData,
        fundingGoal: parseFloat(formData.fundingGoal),
        createdBy: user.id,
        creatorRole: userRole,
        status: 'pending' // Will be reviewed by admin
      };

      const response = await fetch('/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaignData)
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Campaign submitted successfully!\n\nYour campaign will be reviewed by admin before going live.\nYou\'ll be notified once it\'s approved.');
        if (onSuccess) onSuccess();
        if (onClose) onClose();
      } else {
        alert('❌ Failed to create campaign: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('❌ Error creating campaign: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // If inline mode (used in tabs), don't wrap in modal overlay
  if (inline) {
    return (
      <div style={styles.inlineContainer}>
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Campaign Title */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Campaign Title <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter a compelling campaign title"
              style={styles.input}
              required
            />
          </div>

          {/* Description */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Description <span style={styles.required}>*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your campaign, its purpose, and expected impact"
              style={styles.textarea}
              rows={4}
              required
            />
          </div>

          {/* Category and Funding Goal */}
          <div style={styles.row}>
            <div style={styles.halfWidth}>
              <label style={styles.label}>
                Category <span style={styles.required}>*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={styles.select}
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={styles.halfWidth}>
              <label style={styles.label}>
                Funding Goal (₹) <span style={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="fundingGoal"
                value={formData.fundingGoal}
                onChange={handleChange}
                placeholder="₹10000"
                style={styles.input}
                min="1"
                required
              />
            </div>
          </div>

          {/* Campaign Deadline and Location */}
          <div style={styles.row}>
            <div style={styles.halfWidth}>
              <label style={styles.label}>
                Campaign Deadline <span style={styles.required}>*</span>
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                style={styles.input}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div style={styles.halfWidth}>
              <label style={styles.label}>
                Location <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, State"
                style={styles.input}
                required
              />
            </div>
          </div>

          {/* Info Message */}
          <div style={styles.infoBox}>
            <span style={styles.infoIcon}>ℹ️</span>
            <p style={styles.infoText}>
              Your campaign will be reviewed by our admin before going live. You'll be notified once it's approved.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? '⏳ Submitting...' : '✅ Submit Campaign for Approval'}
          </button>
        </form>
      </div>
    );
  }

  // Modal mode (default)
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>➕ Create New Campaign</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <p style={styles.subtitle}>
          Submit a campaign for admin approval. Once approved, it will be visible to all donors.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Campaign Title */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Campaign Title <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter a compelling campaign title"
              style={styles.input}
              required
            />
          </div>

          {/* Description */}
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Description <span style={styles.required}>*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your campaign, its purpose, and expected impact"
              style={styles.textarea}
              rows={4}
              required
            />
          </div>

          {/* Category and Funding Goal */}
          <div style={styles.row}>
            <div style={styles.halfWidth}>
              <label style={styles.label}>
                Category <span style={styles.required}>*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                style={styles.select}
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div style={styles.halfWidth}>
              <label style={styles.label}>
                Funding Goal (₹) <span style={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="fundingGoal"
                value={formData.fundingGoal}
                onChange={handleChange}
                placeholder="₹10000"
                style={styles.input}
                min="1"
                required
              />
            </div>
          </div>

          {/* Campaign Deadline and Location */}
          <div style={styles.row}>
            <div style={styles.halfWidth}>
              <label style={styles.label}>
                Campaign Deadline <span style={styles.required}>*</span>
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                style={styles.input}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div style={styles.halfWidth}>
              <label style={styles.label}>
                Location <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, State"
                style={styles.input}
                required
              />
            </div>
          </div>

          {/* Info Message */}
          <div style={styles.infoBox}>
            <span style={styles.infoIcon}>ℹ️</span>
            <p style={styles.infoText}>
              Your campaign will be reviewed by our admin before going live. You'll be notified once it's approved.
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? '⏳ Submitting...' : '✅ Submit Campaign for Approval'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  inlineContainer: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '30px',
    maxWidth: '800px',
    margin: '0 auto',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: '20px'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    maxWidth: '700px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px',
    borderBottom: '2px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    backgroundColor: 'white',
    borderRadius: '16px 16px 0 0',
    zIndex: 10
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'all 0.2s'
  },
  subtitle: {
    padding: '0 24px',
    margin: '16px 0',
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.6'
  },
  form: {
    padding: '0 24px 24px'
  },
  formGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  },
  required: {
    color: '#ef4444'
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s',
    resize: 'vertical',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    backgroundColor: 'white',
    cursor: 'pointer',
    boxSizing: 'border-box'
  },
  row: {
    display: 'flex',
    gap: '16px',
    marginBottom: '20px'
  },
  halfWidth: {
    flex: 1
  },
  infoBox: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#dbeafe',
    borderRadius: '8px',
    marginBottom: '24px',
    border: '1px solid #93c5fd'
  },
  infoIcon: {
    fontSize: '20px',
    flexShrink: 0
  },
  infoText: {
    margin: 0,
    fontSize: '14px',
    color: '#1e40af',
    lineHeight: '1.6'
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  }
};

export default CreateCampaign;
