const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('⚠️ SENDGRID_API_KEY not configured in emailService');
}

// Send credentials email after approval
const sendCredentialsEmail = async (to, credentials, requestDetails) => {
  try {
    const isOrganization = credentials.role === 'organization' || credentials.role === 'ngo' || credentials.role === 'receiver';
    const roleLabel = isOrganization ? 'NGO/Organization' : 'Beneficiary';
    
    const msg = {
      to: to,
      from: process.env.MAIL_FROM || process.env.SENDGRID_FROM_EMAIL || 'noreply@socialimpact.org',
      subject: `🎉 Request Approved - Login Credentials for ${roleLabel}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #4299e1 0%, #48bb78 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { padding: 30px; }
            .credentials-box { background: #f7fafc; border-left: 4px solid #4299e1; padding: 20px; margin: 20px 0; border-radius: 5px; }
            .credential-item { margin: 15px 0; }
            .credential-label { font-weight: bold; color: #2d3748; display: block; margin-bottom: 5px; }
            .credential-value { color: #4299e1; font-size: 16px; font-family: 'Courier New', monospace; background: white; padding: 10px; border-radius: 4px; display: inline-block; }
            .password-box { background: #fff3cd; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107; }
            .password-box .password { color: #d97706; font-size: 20px; font-weight: bold; font-family: 'Courier New', monospace; }
            .button { display: inline-block; padding: 15px 30px; background: #4299e1; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
            .instructions { background: #e6f7ff; padding: 20px; border-radius: 5px; margin: 20px 0; }
            .instructions h3 { margin-top: 0; color: #1e40af; }
            .instructions ol { margin: 10px 0; padding-left: 20px; }
            .instructions li { margin: 8px 0; }
            .warning { background: #fee; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc2626; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌍 Social Impact Platform</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">Your Request Has Been Approved!</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1f2937;">Hello ${credentials.name}!</h2>
              <p style="font-size: 16px; line-height: 1.8;">
                Great news! Your request <strong>"${requestDetails.title || 'Assistance Request'}"</strong> has been approved by our admin team.
              </p>
              
              <div class="credentials-box">
                <h3 style="margin-top: 0; color: #1e40af;">🔐 Your Login Credentials</h3>
                <div class="credential-item">
                  <span class="credential-label">Account Type:</span>
                  <span class="credential-value">${roleLabel}</span>
                </div>
                <div class="credential-item">
                  <span class="credential-label">Login Email:</span>
                  <span class="credential-value">${credentials.email}</span>
                </div>
                <div class="credential-item">
                  <span class="credential-label">Your Password:</span>
                  <div class="password-box">
                    <div class="password">${credentials.password}</div>
                    <p style="margin: 10px 0 0 0; font-size: 12px; color: #92400e;">⚠️ Keep this password secure and confidential</p>
                  </div>
                </div>
              </div>

              <div class="instructions">
                <h3>📝 How to Access Your Dashboard:</h3>
                <ol>
                  <li>Visit the Social Impact Platform website</li>
                  <li>Click on <strong>"Get Started"</strong> or <strong>"Login"</strong></li>
                  <li>Select your role: <strong>${roleLabel}</strong></li>
                  <li>Enter your email: <strong>${credentials.email}</strong></li>
                  <li>Enter your password: <strong>${credentials.password}</strong></li>
                  <li>You can change your password after login from your profile settings</li>
                </ol>
              </div>

              ${requestDetails.amount ? `
              <div style="background: #f0fdf4; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #22c55e;">
                <h3 style="margin-top: 0; color: #15803d;">✅ Approved Request Details:</h3>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li><strong>Category:</strong> ${requestDetails.category || 'General'}</li>
                  <li><strong>Amount:</strong> ₹${requestDetails.amount}</li>
                  <li><strong>Status:</strong> <span style="color: #22c55e; font-weight: bold;">Approved</span></li>
                </ul>
              </div>
              ` : ''}

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/Role" class="button">
                  🚀 Login to Your Dashboard Now
                </a>
              </div>

              <div class="warning">
                <h4 style="margin: 0 0 10px 0; color: #dc2626;">🔒 Security Guidelines:</h4>
                <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
                  <li>Keep your password secure and confidential</li>
                  <li>Do not share your credentials with anyone</li>
                  <li>Change your password immediately after first login</li>
                  <li>This email contains sensitive information - delete it after saving your credentials securely</li>
                  <li>If you didn't request this, please contact our support team immediately</li>
                </ul>
              </div>

              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
                Need help? Contact our support team or visit our help center.
              </p>
            </div>
            
            <div class="footer">
              <p style="margin: 5px 0;"><strong>© 2025 Social Impact Platform</strong></p>
              <p style="margin: 5px 0;">All rights reserved</p>
              <p style="margin: 15px 0 5px 0;">This is an automated email. Please do not reply to this message.</p>
              <p style="margin: 5px 0;">For support, contact: support@socialimpact.org</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Social Impact Platform - Request Approved!

Hello ${credentials.name}!

Great news! Your request "${requestDetails.title || 'Assistance Request'}" has been approved by our admin team.

YOUR LOGIN CREDENTIALS
======================
Account Type: ${roleLabel}
Login Email: ${credentials.email}
Password: ${credentials.password}

HOW TO ACCESS YOUR DASHBOARD
=============================
1. Visit the Social Impact Platform website
2. Click on "Get Started" or "Login"
3. Select your role: ${roleLabel}
4. Enter your email: ${credentials.email}
5. Enter your password: ${credentials.password}
6. You can change your password after login from your profile settings

${requestDetails.amount ? `
APPROVED REQUEST DETAILS
========================
Category: ${requestDetails.category || 'General'}
Amount: ₹${requestDetails.amount}
Status: APPROVED
` : ''}

SECURITY GUIDELINES
==================
• Keep your password secure and confidential
• Do not share your credentials with anyone
• Change your password immediately after first login
• Delete this email after saving your credentials securely

© 2025 Social Impact Platform. All rights reserved.
This is an automated email. Please do not reply to this message.
      `
    };

    const info = await sgMail.send(msg);
    console.log('✅ Credentials email sent to:', to, '| SendGrid response:', info[0].statusCode);
    return { success: true, messageId: info[0].headers['x-message-id'] };
  } catch (error) {
    console.error('❌ Error sending credentials email:', error);
    if (error.response) {
      console.error('📧 SendGrid error details:', {
        code: error.code,
        message: error.message,
        body: error.response.body
      });
    }
    return { success: false, error: error.message };
  }
};

// Send donation confirmation email
const sendDonationConfirmationEmail = async (donorEmail, donationDetails) => {
  try {
    const { donorName, amount, campaignTitle, campaignCategory, transactionId, date, isAnonymous, impactStory } = donationDetails;
    
    const msg = {
      to: donorEmail,
      from: process.env.MAIL_FROM || process.env.SENDGRID_FROM_EMAIL || 'noreply@socialimpact.org',
      subject: `🎉 Thank You for Your Donation of ₹${amount.toLocaleString('en-IN')}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 32px; }
            .header .icon { font-size: 60px; margin-bottom: 10px; }
            .content { padding: 30px; }
            .donation-card { background: linear-gradient(135deg, #f0fdf4 0%, #d1fae5 100%); border-left: 4px solid #10b981; padding: 25px; margin: 20px 0; border-radius: 8px; }
            .amount { font-size: 36px; font-weight: bold; color: #059669; margin: 15px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: 600; color: #6b7280; }
            .detail-value { color: #1f2937; font-weight: 500; }
            .impact-box { background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
            .impact-box h3 { margin-top: 0; color: #1e40af; }
            .button { display: inline-block; padding: 15px 30px; background: #10b981; color: white !important; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; text-align: center; }
            .tax-info { background: #fef3c7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
            .social-links { margin: 15px 0; }
            .social-links a { display: inline-block; margin: 0 10px; color: #10b981; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">💚</div>
              <h1>Thank You!</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">Your donation is making a difference</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1f2937;">Dear ${donorName},</h2>
              <p style="font-size: 16px; line-height: 1.8;">
                Thank you for your generous contribution! Your donation will help make a real impact in someone's life.
              </p>
              
              <div class="donation-card">
                <h3 style="margin-top: 0; color: #059669;">🎯 Donation Details</h3>
                <div class="amount">₹${amount.toLocaleString('en-IN')}</div>
                
                <div class="detail-row">
                  <span class="detail-label">Campaign:</span>
                  <span class="detail-value">${campaignTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Category:</span>
                  <span class="detail-value">${campaignCategory}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Transaction ID:</span>
                  <span class="detail-value">${transactionId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date & Time:</span>
                  <span class="detail-value">${new Date(date).toLocaleString('en-IN', { 
                    year: 'numeric', month: 'long', day: 'numeric', 
                    hour: '2-digit', minute: '2-digit' 
                  })}</span>
                </div>
                ${isAnonymous ? `
                <div class="detail-row">
                  <span class="detail-label">Donation Type:</span>
                  <span class="detail-value">🎭 Anonymous</span>
                </div>
                ` : ''}
              </div>

              ${impactStory ? `
              <div class="impact-box">
                <h3>🌟 Your Impact</h3>
                <p style="font-size: 16px; line-height: 1.8; margin: 0;">
                  ${impactStory}
                </p>
              </div>
              ` : ''}

              <div class="tax-info">
                <h4 style="margin-top: 0; color: #92400e;">📄 Tax Deduction Information</h4>
                <p style="margin: 10px 0; font-size: 14px; color: #78350f;">
                  This donation may be eligible for tax deduction under Section 80G of the Income Tax Act. 
                  Please consult your tax advisor for details. Your transaction ID is your receipt number.
                </p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">
                  View Your Donations Dashboard →
                </a>
              </div>

              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #0369a1;">💡 What Happens Next?</h3>
                <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                  <li>Your donation has been immediately credited to the campaign</li>
                  <li>You can track the campaign progress in your dashboard</li>
                  <li>We'll send you updates on how your donation is being used</li>
                  <li>You'll receive a summary report at the end of each month</li>
                </ul>
              </div>

              <div style="text-align: center; padding: 20px; background: #fef2f2; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #991b1b; font-size: 16px;">
                  <strong>❤️ Together, we're creating positive change!</strong>
                </p>
              </div>

              <div class="social-links">
                <p style="text-align: center; color: #6b7280;">Share your good deed:</p>
                <div style="text-align: center;">
                  <a href="#">Facebook</a> | 
                  <a href="#">Twitter</a> | 
                  <a href="#">LinkedIn</a>
                </div>
              </div>
            </div>

            <div class="footer">
              <p style="margin: 5px 0;">
                <strong>Social Impact Platform</strong><br>
                Making a difference, one donation at a time
              </p>
              <p style="margin: 10px 0; font-size: 11px;">
                This is an automated email. Please do not reply to this message.<br>
                If you have any questions, contact us at support@socialimpact.org
              </p>
              <p style="margin: 10px 0; font-size: 11px; color: #9ca3af;">
                Transaction ID: ${transactionId} | ${new Date(date).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Thank You for Your Donation!
        
        Dear ${donorName},
        
        Thank you for your generous donation of ₹${amount.toLocaleString('en-IN')}!
        
        Donation Details:
        - Campaign: ${campaignTitle}
        - Category: ${campaignCategory}
        - Transaction ID: ${transactionId}
        - Date: ${new Date(date).toLocaleString('en-IN')}
        ${isAnonymous ? '- Type: Anonymous Donation' : ''}
        
        ${impactStory ? `\nYour Impact:\n${impactStory}\n` : ''}
        
        This donation may be eligible for tax deduction under Section 80G.
        
        Visit your dashboard: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard
        
        Thank you for making a difference!
        
        Social Impact Platform
        Transaction ID: ${transactionId}
      `
    };

    console.log(`📧 Sending donation confirmation email to: ${donorEmail}`);
    await sgMail.send(msg);
    console.log(`✅ Donation confirmation email sent successfully to ${donorEmail}`);
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error sending donation confirmation email:', error.message);
    if (error.response) {
      console.error('📧 SendGrid error details:', {
        code: error.code,
        message: error.message,
        body: error.response.body
      });
    }
    return { success: false, error: error.message };
  }
};

// Send donation received notification to receiver/beneficiary
const sendDonationReceivedEmail = async (receiverEmail, donationDetails) => {
  try {
    const { receiverName, amount, donorName, campaignTitle, campaignCategory, transactionId, date, isAnonymous } = donationDetails;
    
    const displayDonorName = isAnonymous ? 'An Anonymous Donor' : donorName;
    
    const msg = {
      to: receiverEmail,
      from: process.env.MAIL_FROM || process.env.SENDGRID_FROM_EMAIL || 'noreply@socialimpact.org',
      subject: `🎉 You Received a Donation of ₹${amount.toLocaleString('en-IN')}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 32px; }
            .header .icon { font-size: 60px; margin-bottom: 10px; }
            .content { padding: 30px; }
            .donation-card { background: linear-gradient(135deg, #faf5ff 0%, #ede9fe 100%); border-left: 4px solid #8b5cf6; padding: 25px; margin: 20px 0; border-radius: 8px; }
            .amount { font-size: 36px; font-weight: bold; color: #7c3aed; margin: 15px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: 600; color: #6b7280; }
            .detail-value { color: #1f2937; font-weight: 500; }
            .gratitude-box { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
            .gratitude-box h3 { margin-top: 0; color: #92400e; }
            .button { display: inline-block; padding: 15px 30px; background: #8b5cf6; color: white !important; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; text-align: center; }
            .next-steps { background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">🎁</div>
              <h1>Congratulations!</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">You have received a new donation</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1f2937;">Dear ${receiverName},</h2>
              <p style="font-size: 16px; line-height: 1.8;">
                Great news! ${displayDonorName} has generously contributed to your campaign. This donation brings you closer to your goal!
              </p>
              
              <div class="donation-card">
                <h3 style="margin-top: 0; color: #7c3aed;">💰 Donation Received</h3>
                <div class="amount">₹${amount.toLocaleString('en-IN')}</div>
                
                <div class="detail-row">
                  <span class="detail-label">From:</span>
                  <span class="detail-value">${displayDonorName} ${isAnonymous ? '🎭' : ''}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Campaign:</span>
                  <span class="detail-value">${campaignTitle}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Category:</span>
                  <span class="detail-value">${campaignCategory}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Transaction ID:</span>
                  <span class="detail-value">${transactionId}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Date & Time:</span>
                  <span class="detail-value">${new Date(date).toLocaleString('en-IN', { 
                    year: 'numeric', month: 'long', day: 'numeric', 
                    hour: '2-digit', minute: '2-digit' 
                  })}</span>
                </div>
              </div>

              <div class="gratitude-box">
                <h3>💛 Show Your Appreciation</h3>
                <p style="font-size: 16px; line-height: 1.8; margin: 10px 0;">
                  ${isAnonymous 
                    ? 'While this donor chose to remain anonymous, their generosity is making a real difference in your life. Consider sharing your progress and how these funds are being used to inspire more support!' 
                    : `${donorName} has shown faith in your cause. Consider sending them a thank you message and keeping them updated on your progress!`}
                </p>
              </div>

              <div class="next-steps">
                <h3 style="margin-top: 0; color: #065f46;">📋 Next Steps</h3>
                <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                  <li>Log in to your dashboard to see updated campaign progress</li>
                  <li>Keep your campaign information and updates current</li>
                  <li>Share updates about how the funds are being used</li>
                  <li>Thank your supporters and keep them engaged</li>
                  <li>Maintain transparency with receipts and reports</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">
                  View Your Campaign Dashboard →
                </a>
              </div>

              <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1e40af;">💡 Important Reminders</h3>
                <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                  <li>Funds are now available in your campaign balance</li>
                  <li>Use funds responsibly according to campaign purpose</li>
                  <li>Provide regular updates to maintain donor trust</li>
                  <li>Keep all receipts and documentation for transparency</li>
                </ul>
              </div>

              <div style="text-align: center; padding: 20px; background: #fef2f2; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #991b1b; font-size: 16px;">
                  <strong>🙏 Thank you for being part of our community!</strong>
                </p>
              </div>
            </div>

            <div class="footer">
              <p style="margin: 5px 0;">
                <strong>Social Impact Platform</strong><br>
                Connecting donors with those in need
              </p>
              <p style="margin: 10px 0; font-size: 11px;">
                This is an automated notification. Please do not reply to this message.<br>
                If you have any questions, contact us at support@socialimpact.org
              </p>
              <p style="margin: 10px 0; font-size: 11px; color: #9ca3af;">
                Transaction ID: ${transactionId} | ${new Date(date).toLocaleDateString('en-IN')}
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Congratulations!
        
        Dear ${receiverName},
        
        You have received a donation of ₹${amount.toLocaleString('en-IN')}!
        
        Donation Details:
        - From: ${displayDonorName}
        - Campaign: ${campaignTitle}
        - Category: ${campaignCategory}
        - Transaction ID: ${transactionId}
        - Date: ${new Date(date).toLocaleString('en-IN')}
        
        Next Steps:
        - Log in to your dashboard to see updated progress
        - Keep your campaign information current
        - Share updates about how funds are being used
        - Thank your supporters and keep them engaged
        
        Visit your dashboard: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard
        
        Thank you for being part of our community!
        
        Social Impact Platform
        Transaction ID: ${transactionId}
      `
    };

    console.log(`📧 Sending donation received notification to: ${receiverEmail}`);
    await sgMail.send(msg);
    console.log(`✅ Donation received notification sent successfully to ${receiverEmail}`);
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error sending donation received notification:', error.message);
    if (error.response) {
      console.error('📧 SendGrid error details:', {
        code: error.code,
        message: error.message,
        body: error.response.body
      });
    }
    return { success: false, error: error.message };
  }
};

// Send campaign approval notification to campaign creator
const sendCampaignApprovalEmail = async (creatorEmail, campaignDetails) => {
  try {
    const { creatorName, campaignTitle, campaignCategory, campaignGoal, campaignId } = campaignDetails;
    
    const msg = {
      to: creatorEmail,
      from: process.env.MAIL_FROM || process.env.SENDGRID_FROM_EMAIL || 'noreply@socialimpact.org',
      subject: `🎉 Your Campaign "${campaignTitle}" is Now Live!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f4f4f4; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 32px; }
            .header .icon { font-size: 60px; margin-bottom: 10px; }
            .content { padding: 30px; }
            .campaign-card { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 25px; margin: 20px 0; border-radius: 8px; }
            .campaign-title { font-size: 24px; font-weight: bold; color: #92400e; margin: 10px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
            .detail-label { font-weight: 600; color: #6b7280; }
            .detail-value { color: #1f2937; font-weight: 500; }
            .success-box { background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .success-box h3 { margin-top: 0; color: #065f46; }
            .button { display: inline-block; padding: 15px 30px; background: #f59e0b; color: white !important; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; text-align: center; }
            .next-steps { background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
            .celebration { text-align: center; font-size: 48px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="icon">🚀</div>
              <h1>Campaign Approved!</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">Your campaign is now live and accepting donations</p>
            </div>
            
            <div class="content">
              <h2 style="color: #1f2937;">Dear ${creatorName},</h2>
              <p style="font-size: 16px; line-height: 1.8;">
                Congratulations! Your campaign has been reviewed and approved by our team. It is now live on the platform and visible to all potential donors.
              </p>
              
              <div class="celebration">🎊 🎉 🎊</div>
              
              <div class="campaign-card">
                <h3 style="margin-top: 0; color: #92400e;">📢 Your Live Campaign</h3>
                <div class="campaign-title">${campaignTitle}</div>
                
                <div class="detail-row">
                  <span class="detail-label">Category:</span>
                  <span class="detail-value">${campaignCategory}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Funding Goal:</span>
                  <span class="detail-value">₹${campaignGoal ? campaignGoal.toLocaleString('en-IN') : 'Not specified'}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Status:</span>
                  <span class="detail-value">✅ Active & Live</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Visibility:</span>
                  <span class="detail-value">🌍 Public - Visible to all donors</span>
                </div>
              </div>

              <div class="success-box">
                <h3>✨ What This Means</h3>
                <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                  <li>Your campaign is now visible on the donor dashboard</li>
                  <li>Donors can browse and contribute to your cause</li>
                  <li>You'll receive email notifications for every donation</li>
                  <li>Track your progress in real-time from your dashboard</li>
                </ul>
              </div>

              <div class="next-steps">
                <h3 style="margin-top: 0; color: #1e40af;">📋 Next Steps to Maximize Success</h3>
                <ol style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">
                  <li><strong>Share Your Campaign:</strong> Spread the word on social media, email, and with friends</li>
                  <li><strong>Keep It Updated:</strong> Post regular updates about your progress and goals</li>
                  <li><strong>Engage Donors:</strong> Thank donors and share how their contributions help</li>
                  <li><strong>Be Transparent:</strong> Share receipts, photos, and impact stories</li>
                  <li><strong>Set Milestones:</strong> Celebrate when you reach funding milestones</li>
                </ol>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" class="button">
                  🎯 View Your Campaign Dashboard →
                </a>
              </div>

              <div style="background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
                <h3 style="margin-top: 0; color: #991b1b;">⚠️ Important Guidelines</h3>
                <ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8; font-size: 14px;">
                  <li>Use funds only for the stated campaign purpose</li>
                  <li>Provide regular updates to donors</li>
                  <li>Maintain transparency with receipts and documentation</li>
                  <li>Respond to donor queries promptly</li>
                  <li>Report any issues or concerns to our support team</li>
                </ul>
              </div>

              <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="margin: 0; color: #065f46; font-size: 16px;">
                  <strong>💡 Pro Tip:</strong> Campaigns with regular updates and donor engagement raise 3x more funds on average!
                </p>
              </div>

              <div style="text-align: center; padding: 20px;">
                <p style="margin: 0; color: #6b7280; font-size: 16px;">
                  <strong>🙌 Thank you for using our platform to make a difference!</strong>
                </p>
              </div>
            </div>

            <div class="footer">
              <p style="margin: 5px 0;">
                <strong>Social Impact Platform</strong><br>
                Empowering change-makers and connecting communities
              </p>
              <p style="margin: 10px 0; font-size: 11px;">
                This is an automated notification. Please do not reply to this message.<br>
                For support, contact us at support@socialimpact.org
              </p>
              <p style="margin: 10px 0; font-size: 11px; color: #9ca3af;">
                Campaign ID: ${campaignId}
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Campaign Approved!
        
        Dear ${creatorName},
        
        Congratulations! Your campaign "${campaignTitle}" has been approved and is now live!
        
        Campaign Details:
        - Title: ${campaignTitle}
        - Category: ${campaignCategory}
        - Goal: ₹${campaignGoal ? campaignGoal.toLocaleString('en-IN') : 'Not specified'}
        - Status: ✅ Active & Live
        
        What This Means:
        - Your campaign is visible to all donors
        - You'll receive notifications for every donation
        - Track your progress in real-time
        
        Next Steps:
        1. Share your campaign on social media
        2. Keep your campaign updated
        3. Engage with donors
        4. Be transparent about fund usage
        
        View your dashboard: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard
        
        Thank you for using our platform!
        
        Social Impact Platform
        Campaign ID: ${campaignId}
      `
    };

    console.log(`📧 Sending campaign approval email to: ${creatorEmail}`);
    await sgMail.send(msg);
    console.log(`✅ Campaign approval email sent successfully to ${creatorEmail}`);
    return { success: true };
    
  } catch (error) {
    console.error('❌ Error sending campaign approval email:', error.message);
    if (error.response) {
      console.error('📧 SendGrid error details:', {
        code: error.code,
        message: error.message,
        body: error.response.body
      });
    }
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendCredentialsEmail,
  sendDonationConfirmationEmail,
  sendDonationReceivedEmail,
  sendCampaignApprovalEmail
};
