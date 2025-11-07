// src/config/mailer.js
const sgMail = require('@sendgrid/mail');

if (!process.env.SENDGRID_API_KEY) {
  console.error('❌ SENDGRID_API_KEY missing in .env');
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('📬 SendGrid Mailer initialized');
}

/**
 * Send mail function (safe defaults)
 */
const sendMail = async (mailData) => {
  // ensure text or html are non-empty strings
  const plainText = (mailData.text && mailData.text.trim().length > 0)
    ? mailData.text
    : 'Hello from Donation & Charity Management System!';
  const htmlText = (mailData.html && mailData.html.trim().length > 0)
    ? mailData.html
    : '<p>Hello from <b>Donation & Charity Management System</b>!</p>';

  const msg = {
    to: mailData.to,
    from: process.env.MAIL_FROM,
    subject: mailData.subject || '(No Subject)',
    text: plainText,
    html: htmlText,
  };

  if (mailData.cc) msg.cc = mailData.cc;
  if (mailData.bcc) msg.bcc = mailData.bcc;

  await sgMail.send(msg);
  return { success: true, to: mailData.to };
};

module.exports = { sendMail };
