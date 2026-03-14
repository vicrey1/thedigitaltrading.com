// server/utils/mailer.js
const brevo = require('@getbrevo/brevo');

// Initialize Brevo API client
let apiInstance = null;

function initializeBrevoAPI() {
  if (!apiInstance) {
    try {
      apiInstance = new brevo.TransactionalEmailsApi();
      if (!process.env.BREVO_API_KEY) {
        console.error('[BREVO MAILER] BREVO_API_KEY environment variable is not set');
        return false;
      }
      apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
      console.log('[BREVO MAILER] API initialized successfully');
      return true;
    } catch (error) {
      console.error('[BREVO MAILER] Failed to initialize API:', error.message);
      return false;
    }
  }
  return true;
}

async function sendMail({ to, subject, text, html }) {
  // Try Brevo first
  if (initializeBrevoAPI()) {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = html || `<html><body>${text}</body></html>`;
    sendSmtpEmail.sender = { 
      name: "THE DIGITAL TRADING", 
      email: process.env.EMAIL_FROM || "noreply@thedigitaltrading.com" 
    };
    sendSmtpEmail.to = [{ email: to }];
    
    console.log('Sending email via Brevo with options:', {
      to: sendSmtpEmail.to,
      subject: sendSmtpEmail.subject,
      sender: sendSmtpEmail.sender
    });
    
    try {
      const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Email sent via Brevo:', data);
      return data;
    } catch (err) {
      console.error('Error sending email via Brevo:', err.message || err);
      // Fall through to nodemailer fallback
    }
  }
  
  // Fallback to nodemailer
  console.log('[MAILER] Attempting to send email via nodemailer fallback');
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || "noreply@thedigitaltrading.com",
      to: to,
      subject: subject,
      html: html || `<html><body>${text}</body></html>`
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent via nodemailer:', info);
    return info;
  } catch (err) {
    console.error('Error sending email via nodemailer fallback:', err.message || err);
    throw new Error('Failed to send email through both Brevo and nodemailer. ' + (err.message || 'Unknown error'));
  }
}

// Legacy nodemailer compatibility (fallback)
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = { sendMail, transporter, brevoApiInstance: apiInstance };
