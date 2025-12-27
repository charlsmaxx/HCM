const express = require('express');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const { sanitizeText, escapeHTML } = require('../utils/sanitize');

const router = express.Router();

// POST /api/contact
router.post('/', [
  body('fullName')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Full name is required and must be less than 200 characters')
    .escape(),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email must be less than 255 characters'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Message is required and must be less than 5000 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        errors: errors.array()
      });
    }

    const { fullName, email, message } = req.body;
    
    // Sanitize inputs
    const sanitizedFullName = sanitizeText(fullName);
    const sanitizedMessage = sanitizeText(message);
    const sanitizedEmail = email.toLowerCase().trim();

    // SMTP configuration from environment variables
    const {
      SMTP_HOST,
      SMTP_PORT,
      SMTP_USER,
      SMTP_PASS,
      SMTP_SECURE,
      CONTACT_TO_EMAIL,
      CONTACT_FROM_EMAIL
    } = process.env;

    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !CONTACT_TO_EMAIL) {
      return res.status(500).json({ error: 'Email service is not configured' });
    }

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: String(SMTP_SECURE || '').toLowerCase() === 'true' || Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS }
    });

    const fromAddress = CONTACT_FROM_EMAIL || `"${sanitizedFullName}" <${SMTP_USER}>`;

    // Escape HTML for safe display in email
    const safeFullName = escapeHTML(sanitizedFullName);
    const safeEmail = escapeHTML(sanitizedEmail);
    const safeMessage = escapeHTML(sanitizedMessage);

    const mailOptions = {
      from: fromAddress,
      to: CONTACT_TO_EMAIL,
      replyTo: sanitizedEmail,
      subject: `New contact form message from ${safeFullName}`,
      text: `From: ${safeFullName} <${safeEmail}>(reply)
\nMessage:\n${safeMessage}`,
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;font-size:14px;color:#111">
          <p><strong>From:</strong> ${safeFullName} &lt;${safeEmail}&gt;</p>
          <p><strong>Message:</strong></p>
          <pre style="white-space:pre-wrap;background:#f9fafb;padding:12px;border-radius:8px;border:1px solid #eee">${safeMessage}</pre>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    return res.json({ ok: true });
  } catch (err) {
    console.error('Contact email error:', err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
});

module.exports = router;


