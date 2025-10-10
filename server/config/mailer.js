const brevo = require('@getbrevo/brevo');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();

// Set API key if available
if (process.env.BREVO_API_KEY) {
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
}

// Legacy nodemailer fallback
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // 'gmail'
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

module.exports = { brevoApi: apiInstance, transporter };
