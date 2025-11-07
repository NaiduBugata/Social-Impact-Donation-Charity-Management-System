// src/controllers/mailController.js
const { sendMail } = require('../config/mailer');

exports.sendMail = async (req, res) => {
  try {
    const { to, subject, text, html, cc, bcc } = req.body;

    if (!to)
      return res.status(400).json({ success: false, error: 'Recipient email (to) is required' });

    const response = await sendMail({ to, subject, text, html, cc, bcc });

    res.status(200).json({
      success: true,
      message: 'Mail sent successfully via SendGrid',
      info: response,
    });
  } catch (error) {
    console.error('❌ SendGrid mail error:', error);
    res.status(500).json({
      success: false,
      error: error.response?.body?.errors || error.message,
    });
  }
};
