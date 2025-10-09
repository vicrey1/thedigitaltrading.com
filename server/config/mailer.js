const brevo = require('@getbrevo/brevo');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

// Initialize Brevo API client
let defaultClient = brevo.ApiClient.instance;
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

let apiInstance = new brevo.TransactionalEmailsApi();

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
