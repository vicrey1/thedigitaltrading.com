// server/utils/emailTemplates.js
const path = require('path');

/**
 * Professional Email Template System for THE DIGITAL TRADING
 * Features responsive design, proper logo placement, and modern styling
 */

class EmailTemplateBuilder {
  constructor() {
    this.baseUrl = process.env.BASE_URL || 'https://www.thedigitaltrading.com';
    this.logoUrl = `${this.baseUrl}/logo192.png`;
    this.brandName = 'THE DIGITAL TRADING';
  }

  /**
   * Base template with header, footer, and responsive design
   */
  getBaseTemplate(content, options = {}) {
    const {
      title = 'THE DIGITAL TRADING',
      preheader = '',
      backgroundColor = '#000000',
      containerColor = '#000000',
      accentColor = '#ffffff'
    } = options;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <title>${title}</title>
        <!--[if mso]>
        <noscript>
            <xml>
                <o:OfficeDocumentSettings>
                    <o:PixelsPerInch>96</o:PixelsPerInch>
                </o:OfficeDocumentSettings>
            </xml>
        </noscript>
        <![endif]-->
        <style>
            /* Reset styles */
            body, table, td, p, a, li, blockquote {
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
            }
            table, td {
                mso-table-lspace: 0pt;
                mso-table-rspace: 0pt;
            }
            img {
                -ms-interpolation-mode: bicubic;
                border: 0;
                height: auto;
                line-height: 100%;
                outline: none;
                text-decoration: none;
            }
            
            /* Base styles */
            body {
                margin: 0 !important;
                padding: 0 !important;
                background-color: ${backgroundColor};
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
            }
            
            /* Container styles */
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: ${containerColor};
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            }
            
            /* Header styles */
            .email-header {
                background: #000000;
                padding: 40px 20px;
                text-align: center;
                position: relative;
            }
            
            .logo-container {
                margin-bottom: 20px;
            }
            
            .logo {
                width: 120px;
                height: 120px;
                border-radius: 8px;
                background: #000000;
                padding: 20px;
                border: 2px solid #333333;
                font-weight: bold;
            }
            

            
            /* Content styles */
            .email-content {
                padding: 40px 30px;
                color: #ffffff;
            }
            
            .content-title {
                color: ${accentColor};
                font-size: 24px;
                font-weight: bold;
                margin: 0 0 20px 0;
                text-align: center;
            }
            
            .content-text {
                font-size: 16px;
                line-height: 1.6;
                margin-bottom: 20px;
                color: #e5e5e5;
            }
            
            /* Button styles */
            .email-button {
                display: inline-block;
                padding: 15px 30px;
                background: #000000;
                color: #ffffff !important;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                font-size: 16px;
                text-align: center;
                margin: 20px 0;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
                border: 2px solid #333333;
                transition: all 0.3s ease;
            }
            
            .email-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(0, 0, 0, 0.5);
                background: #333333;
            }
            
            /* Footer styles */
            .email-footer {
                background-color: #000000;
                padding: 30px 20px;
                text-align: center;
                border-top: 1px solid #333;
            }
            
            .footer-text {
                color: #888;
                font-size: 14px;
                margin: 5px 0;
            }
            
            .footer-links {
                margin: 15px 0;
            }
            
            .footer-link {
                color: ${accentColor};
                text-decoration: none;
                margin: 0 10px;
                font-size: 14px;
            }
            
            /* Responsive styles */
            @media only screen and (max-width: 600px) {
                .email-container {
                    margin: 10px;
                    border-radius: 12px;
                }
                
                .email-header {
                    padding: 30px 15px;
                }
                

                
                .email-content {
                    padding: 30px 20px;
                }
                
                .content-title {
                    font-size: 20px;
                }
                
                .content-text {
                    font-size: 15px;
                }
                
                .logo {
                    width: 90px;
                    height: 90px;
                    padding: 15px;
                    border-radius: 6px;
                    background: #000000;
                    border: 2px solid #333333;
                    font-weight: bold;
                }
            }
        </style>
    </head>
    <body>
        ${preheader ? `<div style="display: none; max-height: 0; overflow: hidden;">${preheader}</div>` : ''}
        
        <div style="background-color: ${backgroundColor}; padding: 20px 0;">
            <div class="email-container">
                <!-- Header -->
                <div class="email-header">
                    <div class="logo-container">
                        <img src="${this.logoUrl}" alt="${this.brandName} Logo" class="logo">
                    </div>
                </div>
                
                <!-- Content -->
                <div class="email-content">
                    ${content}
                </div>
                
                <!-- Footer -->
                <div class="email-footer">
                    <p class="footer-text">© ${new Date().getFullYear()} Digital Trading Platform. All rights reserved.</p>
                    <div class="footer-links">
                        <a href="${this.baseUrl}" class="footer-link">Trading Platform</a>
                        <a href="${this.baseUrl}/support" class="footer-link">Client Services</a>
                        <a href="${this.baseUrl}/privacy" class="footer-link">Privacy Policy</a>
                    </div>
                    <p class="footer-text">Institutional-grade cryptocurrency trading solutions</p>
                </div>
            </div>
        </div>
    </body>
    </html>`;
  }

  /**
   * Welcome email template
   */
  getWelcomeTemplate(userName = 'Valued Client', customMessage = '') {
    const content = `
        <h2 class="content-title">Welcome to Our Trading Platform</h2>
        <p class="content-text">Dear ${userName},</p>
        <p class="content-text">
            Thank you for joining our institutional-grade cryptocurrency trading platform. 
            We are committed to providing you with sophisticated trading tools and comprehensive 
            market access to support your investment objectives.
        </p>
        ${customMessage ? `<p class="content-text">${customMessage}</p>` : ''}
        <p class="content-text">
            Our platform features advanced analytics, institutional-level security protocols, 
            and direct market access to ensure optimal execution of your trading strategies.
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${this.baseUrl}/dashboard" class="email-button">
                Access Trading Platform
            </a>
        </div>
        <p class="content-text">
            Our dedicated client services team is available to assist you with any inquiries 
            regarding platform functionality or market conditions.
        </p>
        <p class="content-text" style="margin-top: 30px;">
            Sincerely,<br>
            <strong style="color: #ffffff;">Client Services Team</strong>
        </p>
    `;

    return this.getBaseTemplate(content, {
      title: 'Welcome to Digital Trading Platform',
      preheader: 'Your institutional trading account is now active'
    });
  }

  /**
   * KYC Approved template
   */
  getKYCApprovedTemplate(userName = 'Valued Client') {
    const content = `
        <h2 class="content-title">Identity Verification Completed</h2>
        <p class="content-text">Dear ${userName},</p>
        <p class="content-text">
            We are pleased to inform you that your identity verification process has been 
            successfully completed and your account has been approved for full trading access.
        </p>
        <div style="background: linear-gradient(135deg, #333333 0%, #000000 100%); 
                    padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center; border: 1px solid #555555;">
            <h3 style="color: white; margin: 0; font-size: 18px;">Account Verification Complete</h3>
            <p style="color: #cccccc; margin: 10px 0 0 0; font-size: 14px;">
                Full platform access has been granted
            </p>
        </div>
        <p class="content-text">
            Your verified account now provides access to:
        </p>
        <ul style="color: #e5e5e5; padding-left: 20px; margin: 20px 0;">
            <li style="margin: 8px 0;">Unrestricted deposit and withdrawal capabilities</li>
            <li style="margin: 8px 0;">Advanced trading tools and order types</li>
            <li style="margin: 8px 0;">Institutional-grade market access</li>
            <li style="margin: 8px 0;">Priority client support services</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${this.baseUrl}/dashboard" class="email-button">
                Access Trading Platform
            </a>
        </div>
        <p class="content-text">
            We appreciate your business and look forward to supporting your trading activities.
        </p>
        <p class="content-text" style="margin-top: 30px;">
            Sincerely,<br>
            <strong style="color: #ffffff;">Compliance Department</strong>
        </p>
    `;

    return this.getBaseTemplate(content, {
      title: 'Account Verification Complete',
      preheader: 'Your trading account has been fully verified'
    });
  }

  /**
   * Custom message template
   */
  getCustomTemplate(title, message, buttonText = '', buttonUrl = '') {
    const content = `
        <h2 class="content-title">${title}</h2>
        <div class="content-text">
            ${message}
        </div>
        ${buttonText && buttonUrl ? `
            <div style="text-align: center; margin: 30px 0;">
                <a href="${buttonUrl}" class="email-button">
                    ${buttonText}
                </a>
            </div>
        ` : ''}
        <p class="content-text" style="margin-top: 30px;">
            Sincerely,<br>
            <strong style="color: #ffffff;">Digital Trading Platform</strong>
        </p>
    `;

    return this.getBaseTemplate(content, {
      title: `${title} - Digital Trading Platform`,
      preheader: title
    });
  }

  /**
   * Notification template
   */
  getNotificationTemplate(title, message, type = 'info') {
    const typeColors = {
      success: { bg: '#333333', border: '#555555' },
      warning: { bg: '#444444', border: '#666666' },
      error: { bg: '#2a2a2a', border: '#444444' },
      info: { bg: '#1a1a1a', border: '#333333' }
    };

    const colors = typeColors[type] || typeColors.info;

    const content = `
        <div style="background: linear-gradient(135deg, ${colors.bg} 0%, ${colors.border} 100%); 
                    padding: 20px; border-radius: 12px; margin: 0 0 25px 0; text-align: center; border: 1px solid ${colors.border};">
            <h2 style="color: white; margin: 0; font-size: 22px;">${title}</h2>
        </div>
        <div class="content-text">
            ${message}
        </div>
        <p class="content-text" style="margin-top: 30px;">
            Sincerely,<br>
            <strong style="color: #ffffff;">Digital Trading Platform</strong>
        </p>
    `;

    return this.getBaseTemplate(content, {
      title: `${title} - Digital Trading Platform`,
      preheader: title
    });
  }
}

module.exports = new EmailTemplateBuilder();