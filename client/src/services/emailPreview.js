// Email Preview Service - Client-side template rendering for preview functionality

export class EmailPreviewService {
  static generatePreview(templateType, templateData = {}) {
    const baseStyles = `
      <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; }
        .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 20px; text-align: center; }
        .logo { font-size: 2.5rem; font-weight: bold; letter-spacing: 2px; margin-bottom: 10px; }
        .logo .lux { color: #FFD700; }
        .logo .hedge { color: #ffffff; }
        .tagline { color: #cccccc; font-size: 0.9rem; margin-top: 10px; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 1.1rem; color: #333; margin-bottom: 20px; }
        .message { color: #555; line-height: 1.6; margin-bottom: 30px; }
        .button { display: inline-block; background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%); color: #000; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee; }
        .footer-text { color: #666; font-size: 0.85rem; line-height: 1.5; }
        .notification-info { border-left: 4px solid #3b82f6; background: #eff6ff; }
        .notification-success { border-left: 4px solid #10b981; background: #ecfdf5; }
        .notification-warning { border-left: 4px solid #f59e0b; background: #fffbeb; }
        .notification-error { border-left: 4px solid #ef4444; background: #fef2f2; }
        .notification { padding: 20px; margin: 20px 0; border-radius: 8px; }
      </style>
    `;

    switch (templateType) {
      case 'welcome':
        return this.generateWelcomeEmail(templateData, baseStyles);
      case 'kyc':
        return this.generateKYCEmail(templateData, baseStyles);
      case 'notification':
        return this.generateNotificationEmail(templateData, baseStyles);
      case 'custom':
        return this.generateCustomEmail(templateData, baseStyles);
      default:
        return this.generateDefaultPreview(baseStyles);
    }
  }

  static generateWelcomeEmail(data, styles) {
    const userName = data.userName || 'Valued User';
    const customMessage = data.customMessage || '';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to LuxHedge</title>
          ${styles}
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="logo">
                <span class="lux">LUX</span><span class="hedge">HEDGE</span>
              </div>
              <div class="tagline">Premium Digital Trading Platform</div>
            </div>
            
            <div class="content">
              <div class="greeting">Welcome to LuxHedge, ${userName}!</div>
              
              <div class="message">
                We're thrilled to have you join our exclusive community of sophisticated traders and investors. 
                LuxHedge provides you with cutting-edge tools, real-time market insights, and premium trading opportunities.
                ${customMessage ? `<br><br>${customMessage}` : ''}
              </div>
              
              <div style="text-align: center;">
                <a href="#" class="button">Get Started Trading</a>
              </div>
              
              <div class="message">
                <strong>What's next?</strong><br>
                • Complete your profile verification<br>
                • Explore our trading dashboard<br>
                • Access premium market analysis<br>
                • Connect with our expert advisors
              </div>
            </div>
            
            <div class="footer">
              <div class="footer-text">
                <strong>LuxHedge Trading Platform</strong><br>
                This email was sent to you because you recently created an account.<br>
                If you have any questions, please contact our support team.
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static generateKYCEmail(data, styles) {
    const userName = data.userName || 'Valued User';
    const customMessage = data.customMessage || '';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>KYC Verification Approved</title>
          ${styles}
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="logo">
                <span class="lux">LUX</span><span class="hedge">HEDGE</span>
              </div>
              <div class="tagline">Premium Digital Trading Platform</div>
            </div>
            
            <div class="content">
              <div class="greeting">Congratulations, ${userName}!</div>
              
              <div class="notification notification-success">
                <strong>✅ Your KYC verification has been approved!</strong>
              </div>
              
              <div class="message">
                Your identity verification has been successfully completed. You now have full access to all LuxHedge 
                trading features and can begin executing trades with higher limits.
                ${customMessage ? `<br><br>${customMessage}` : ''}
              </div>
              
              <div style="text-align: center;">
                <a href="#" class="button">Access Your Account</a>
              </div>
              
              <div class="message">
                <strong>You can now:</strong><br>
                • Make deposits and withdrawals<br>
                • Access premium trading tools<br>
                • Trade with increased limits<br>
                • Participate in exclusive opportunities
              </div>
            </div>
            
            <div class="footer">
              <div class="footer-text">
                <strong>LuxHedge Trading Platform</strong><br>
                Your account security and compliance are our top priorities.<br>
                Thank you for completing the verification process.
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static generateNotificationEmail(data, styles) {
    const userName = data.userName || 'Valued User';
    const title = data.title || 'Important Notification';
    const customMessage = data.customMessage || 'We have an important update for your account.';
    const type = data.type || 'info';
    const buttonText = data.buttonText;
    const buttonUrl = data.buttonUrl;
    
    const notificationClass = `notification-${type}`;
    const typeIcon = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    }[type];
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          ${styles}
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="logo">
                <span class="lux">LUX</span><span class="hedge">HEDGE</span>
              </div>
              <div class="tagline">Premium Digital Trading Platform</div>
            </div>
            
            <div class="content">
              <div class="greeting">Hello ${userName},</div>
              
              <div class="notification ${notificationClass}">
                <strong>${typeIcon} ${title}</strong>
              </div>
              
              <div class="message">
                ${customMessage}
              </div>
              
              ${buttonText && buttonUrl ? `
                <div style="text-align: center;">
                  <a href="${buttonUrl}" class="button">${buttonText}</a>
                </div>
              ` : ''}
              
              <div class="message">
                If you have any questions or concerns, please don't hesitate to contact our support team.
              </div>
            </div>
            
            <div class="footer">
              <div class="footer-text">
                <strong>LuxHedge Trading Platform</strong><br>
                This is an automated notification from your trading account.<br>
                Please do not reply to this email.
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static generateCustomEmail(data, styles) {
    const message = data.message || '<p>Your custom email content will appear here.</p>';
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Custom Email</title>
          ${styles}
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="logo">
                <span class="lux">LUX</span><span class="hedge">HEDGE</span>
              </div>
              <div class="tagline">Premium Digital Trading Platform</div>
            </div>
            
            <div class="content">
              ${message}
            </div>
            
            <div class="footer">
              <div class="footer-text">
                <strong>LuxHedge Trading Platform</strong><br>
                Professional trading solutions for sophisticated investors.
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static generateDefaultPreview(styles) {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Preview</title>
          ${styles}
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="logo">
                <span class="lux">LUX</span><span class="hedge">HEDGE</span>
              </div>
              <div class="tagline">Premium Digital Trading Platform</div>
            </div>
            
            <div class="content">
              <div class="greeting">Email Preview</div>
              <div class="message">
                Select a template and fill in the required fields to see a preview of your email.
              </div>
            </div>
            
            <div class="footer">
              <div class="footer-text">
                <strong>LuxHedge Trading Platform</strong><br>
                This is a preview of how your email will appear to recipients.
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export default EmailPreviewService;