// server/utils/mailer.js
const brevo = require('@getbrevo/brevo');
const nodemailer = require('nodemailer');

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();

// Set API key if available
if (process.env.BREVO_API_KEY) {
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
}

// Initialize nodemailer transporter (fallback)
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendMail({ to, subject, text, html }) {
  // Try Brevo first, but handle IP whitelisting errors gracefully
  const sendSmtpEmail = new brevo.SendSmtpEmail();
  
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = html || `<html><body>${text}</body></html>`;
  sendSmtpEmail.sender = { 
    name: "THE DIGITAL TRADING", 
    email: process.env.EMAIL_FROM || "noreply@thedigitaltrading.com" 
  };
  sendSmtpEmail.to = [{ email: to }];
  
  console.log('[MAILER] Attempting to send email via Brevo');
  
  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('[MAILER] Email sent via Brevo successfully');
    return data;
  } catch (err) {
    // Check if it's an IP whitelisting error (401 with specific message)
    if (err.response?.status === 401 && err.response?.data?.code === 'unauthorized') {
      console.warn('[MAILER] Brevo IP whitelisting error detected, falling back to nodemailer');
      return await sendViaNodemailer(to, subject, text, html);
    }
    
    console.error('[MAILER] Error sending via Brevo, attempting nodemailer fallback:', err.message);
    try {
      return await sendViaNodemailer(to, subject, text, html);
    } catch (nodemailerErr) {
      console.error('[MAILER] Both Brevo and nodemailer failed:', nodemailerErr.message);
      throw new Error(`Failed to send email via both services: ${nodemailerErr.message}`);
    }
  }
}

async function sendViaNodemailer(to, subject, text, html) {
  console.log('[MAILER] Attempting to send via nodemailer/SMTP');
  return new Promise((resolve, reject) => {
    transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@thedigitaltrading.com",
      to: to,
      subject: subject,
      text: text,
      html: html
    }, (err, info) => {
      if (err) {
        console.error('[MAILER] Nodemailer error:', err.message);
        reject(err);
      } else {
        console.log('[MAILER] Email sent via nodemailer successfully');
        resolve(info);
      }
    });
  });
}

module.exports = { sendMail, sendViaNodemailer, transporter, brevoApiInstance: apiInstance };
