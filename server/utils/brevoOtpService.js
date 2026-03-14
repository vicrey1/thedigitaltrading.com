// server/utils/brevoOtpService.js
const brevo = require('@getbrevo/brevo');

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();

// Set API key
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

class BrevoOtpService {
  constructor() {
    this.apiInstance = apiInstance;
    this.senderEmail = process.env.EMAIL_FROM || "noreply@thedigitaltrading.com";
    this.senderName = "THE DIGITAL TRADING";
  }

  // Generate a 6-digit OTP
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send registration OTP
  async sendRegistrationOTP(email, otp, verificationUrl) {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.subject = "Verify Your Email - THE DIGITAL TRADING";
    sendSmtpEmail.htmlContent = this.getRegistrationTemplate(otp, verificationUrl);
    sendSmtpEmail.sender = { name: this.senderName, email: this.senderEmail };
    sendSmtpEmail.to = [{ email: email }];
    
    // Add tags for tracking
    sendSmtpEmail.tags = ["registration", "otp"];
    
    try {
      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Registration OTP sent via Brevo:', result);
      return result;
    } catch (error) {
      console.error('Error sending registration OTP via Brevo:', error);
      throw error;
    }
  }

  // Send password reset OTP
  async sendPasswordResetOTP(email, otp, resetUrl) {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.subject = "Password Reset - THE DIGITAL TRADING";
    sendSmtpEmail.htmlContent = this.getPasswordResetTemplate(otp, resetUrl);
    sendSmtpEmail.sender = { name: this.senderName, email: this.senderEmail };
    sendSmtpEmail.to = [{ email: email }];
    
    sendSmtpEmail.tags = ["password-reset", "otp"];
    
    try {
      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Password reset OTP sent via Brevo:', result);
      return result;
    } catch (error) {
      console.error('Error sending password reset OTP via Brevo:', error);
      throw error;
    }
  }

  // Send profile edit OTP
  async sendProfileEditOTP(email, otp) {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.subject = "Profile Edit Confirmation - THE DIGITAL TRADING";
    sendSmtpEmail.htmlContent = this.getProfileEditTemplate(otp);
    sendSmtpEmail.sender = { name: this.senderName, email: this.senderEmail };
    sendSmtpEmail.to = [{ email: email }];
    
    sendSmtpEmail.tags = ["profile-edit", "otp"];
    
    try {
      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Profile edit OTP sent via Brevo:', result);
      return result;
    } catch (error) {
      console.error('Error sending profile edit OTP via Brevo:', error);
      throw error;
    }
  }

  // Send email verification OTP
  async sendEmailVerificationOTP(email, otp) {
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    
    sendSmtpEmail.subject = "Email Verification - THE DIGITAL TRADING";
    sendSmtpEmail.htmlContent = this.getEmailVerificationTemplate(otp);
    sendSmtpEmail.sender = { name: this.senderName, email: this.senderEmail };
    sendSmtpEmail.to = [{ email: email }];
    
    sendSmtpEmail.tags = ["email-verification", "otp"];
    
    try {
      const result = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('Email verification OTP sent via Brevo:', result);
      return result;
    } catch (error) {
      console.error('Error sending email verification OTP via Brevo:', error);
      throw error;
    }
  }

  // Registration email template
  getRegistrationTemplate(otp, verificationUrl) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f0f0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border-radius: 16px; overflow: hidden; margin-top: 40px; margin-bottom: 40px;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 40px 20px; text-align: center;">
                <h1 style="margin: 0; color: #000; font-size: 28px; font-weight: bold; letter-spacing: 2px;">
                    THE DIGITAL TRADING
                </h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px; text-align: center;">
                <h2 style="color: #FFD700; font-size: 24px; margin-bottom: 20px; font-weight: bold;">
                    Verify Your Email Address
                </h2>
                
                <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    Welcome to THE DIGITAL TRADING! Please verify your email address to complete your registration.
                </p>
                
                <!-- OTP Box -->
                <div style="background-color: #2a2a2a; border: 2px solid #FFD700; border-radius: 12px; padding: 30px; margin: 30px 0;">
                    <p style="color: #FFD700; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">
                        Your Verification Code
                    </p>
                    <div style="font-size: 36px; font-weight: bold; color: #FFD700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${otp}
                    </div>
                    <p style="color: #888; font-size: 12px; margin-top: 15px;">
                        This code expires in 24 hours
                    </p>
                </div>
                
                <!-- Verification Button -->
                ${verificationUrl ? `
                <div style="margin: 30px 0;">
                    <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        Verify Email Address
                    </a>
                </div>
                ` : ''}
                
                <p style="color: #888; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                    If you didn't create an account with THE DIGITAL TRADING, you can safely ignore this email.
                </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #111; padding: 20px; text-align: center; border-top: 1px solid #333;">
                <p style="color: #666; font-size: 12px; margin: 0;">
                    © 2024 THE DIGITAL TRADING. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Password reset email template
  getPasswordResetTemplate(otp, resetUrl) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f0f0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border-radius: 16px; overflow: hidden; margin-top: 40px; margin-bottom: 40px;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 40px 20px; text-align: center;">
                <h1 style="margin: 0; color: #000; font-size: 28px; font-weight: bold; letter-spacing: 2px;">
                    THE DIGITAL TRADING
                </h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px; text-align: center;">
                <h2 style="color: #FFD700; font-size: 24px; margin-bottom: 20px; font-weight: bold;">
                    Reset Your Password
                </h2>
                
                <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    We received a request to reset your password. Use the code below or click the button to reset your password.
                </p>
                
                <!-- OTP Box -->
                <div style="background-color: #2a2a2a; border: 2px solid #FFD700; border-radius: 12px; padding: 30px; margin: 30px 0;">
                    <p style="color: #FFD700; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">
                        Your Reset Code
                    </p>
                    <div style="font-size: 36px; font-weight: bold; color: #FFD700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${otp}
                    </div>
                    <p style="color: #888; font-size: 12px; margin-top: 15px;">
                        This code expires in 1 hour
                    </p>
                </div>
                
                <!-- Reset Button -->
                ${resetUrl ? `
                <div style="margin: 30px 0;">
                    <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        Reset Password
                    </a>
                </div>
                ` : ''}
                
                <p style="color: #888; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                    If you didn't request a password reset, you can safely ignore this email.
                </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #111; padding: 20px; text-align: center; border-top: 1px solid #333;">
                <p style="color: #666; font-size: 12px; margin: 0;">
                    © 2024 THE DIGITAL TRADING. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Profile edit email template
  getProfileEditTemplate(otp) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Profile Edit Confirmation</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f0f0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border-radius: 16px; overflow: hidden; margin-top: 40px; margin-bottom: 40px;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 40px 20px; text-align: center;">
                <h1 style="margin: 0; color: #000; font-size: 28px; font-weight: bold; letter-spacing: 2px;">
                    THE DIGITAL TRADING
                </h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px; text-align: center;">
                <h2 style="color: #FFD700; font-size: 24px; margin-bottom: 20px; font-weight: bold;">
                    Profile Edit Confirmation
                </h2>
                
                <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    Please confirm your profile changes by entering the verification code below.
                </p>
                
                <!-- OTP Box -->
                <div style="background-color: #2a2a2a; border: 2px solid #FFD700; border-radius: 12px; padding: 30px; margin: 30px 0;">
                    <p style="color: #FFD700; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">
                        Your Confirmation Code
                    </p>
                    <div style="font-size: 36px; font-weight: bold; color: #FFD700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${otp}
                    </div>
                    <p style="color: #888; font-size: 12px; margin-top: 15px;">
                        This code expires in 10 minutes
                    </p>
                </div>
                
                <p style="color: #888; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                    If you didn't request this change, please contact our support team immediately.
                </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #111; padding: 20px; text-align: center; border-top: 1px solid #333;">
                <p style="color: #666; font-size: 12px; margin: 0;">
                    © 2024 THE DIGITAL TRADING. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Email verification template
  getEmailVerificationTemplate(otp) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f0f0f; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border-radius: 16px; overflow: hidden; margin-top: 40px; margin-bottom: 40px;">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); padding: 40px 20px; text-align: center;">
                <h1 style="margin: 0; color: #000; font-size: 28px; font-weight: bold; letter-spacing: 2px;">
                    THE DIGITAL TRADING
                </h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 40px 30px; text-align: center;">
                <h2 style="color: #FFD700; font-size: 24px; margin-bottom: 20px; font-weight: bold;">
                    Verify Your Email
                </h2>
                
                <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    Please verify your email address using the code below.
                </p>
                
                <!-- OTP Box -->
                <div style="background-color: #2a2a2a; border: 2px solid #FFD700; border-radius: 12px; padding: 30px; margin: 30px 0;">
                    <p style="color: #FFD700; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">
                        Your Verification Code
                    </p>
                    <div style="font-size: 36px; font-weight: bold; color: #FFD700; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                        ${otp}
                    </div>
                    <p style="color: #888; font-size: 12px; margin-top: 15px;">
                        This code expires in 10 minutes
                    </p>
                </div>
                
                <p style="color: #888; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                    If you didn't request this verification, you can safely ignore this email.
                </p>
            </div>
            
            <!-- Footer -->
            <div style="background-color: #111; padding: 20px; text-align: center; border-top: 1px solid #333;">
                <p style="color: #666; font-size: 12px; margin: 0;">
                    © 2024 THE DIGITAL TRADING. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
  }
}

module.exports = new BrevoOtpService();