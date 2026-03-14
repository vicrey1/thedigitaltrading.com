// server/utils/mailer.js
const brevo = require('@getbrevo/brevo');

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();

// Set API key if available
if (process.env.BREVO_API_KEY) {
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
}

async function sendMail({ to, subject, text, html }) {
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
    console.error('Error sending email via Brevo:', err);
    throw err;
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
