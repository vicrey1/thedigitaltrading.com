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
      backgroundColor = '#0f0f0f',
      containerColor = '#18181b',
      accentColor = '#000000'
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
            
            .brand-name {
                font-size: 28px;
                font-weight: bold;
                color: #000;
                letter-spacing: 2px;
                margin: 0;
                text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
                background-color: #111111;
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
                
                .brand-name {
                    font-size: 24px;
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
                    <h1 class="brand-name">${this.brandName}</h1>
                </div>
                
                <!-- Content -->
                <div class="email-content">
                    ${content}
                </div>
                
                <!-- Footer -->
                <div class="email-footer">
                    <p class="footer-text">© ${new Date().getFullYear()} ${this.brandName}. All rights reserved.</p>
                    <div class="footer-links">
                        <a href="${this.baseUrl}" class="footer-link">Visit Website</a>
                        <a href="${this.baseUrl}/support" class="footer-link">Support</a>
                        <a href="${this.baseUrl}/privacy" class="footer-link">Privacy Policy</a>
                    </div>
                    <p class="footer-text">Professional cryptocurrency trading platform</p>
                </div>
            </div>
        </div>
    </body>
    </html>`;
  }

  /**
   * Welcome email template
   */
  getWelcomeTemplate(userName = 'Valued User', customMessage = '') {
    const content = `
        <h2 class="content-title">Welcome to THE DIGITAL TRADING!</h2>
        <p class="content-text">Dear ${userName},</p>
        <p class="content-text">
            We're thrilled to welcome you to THE DIGITAL TRADING, your premier destination for 
            professional cryptocurrency trading and investment opportunities.
        </p>
        ${customMessage ? `<p class="content-text">${customMessage}</p>` : ''}
        <p class="content-text">
            Our platform offers cutting-edge tools, real-time market analysis, and secure trading 
            infrastructure to help you achieve your financial goals.
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${this.baseUrl}/dashboard" class="email-button">
                Get Started Now
            </a>
        </div>
        <p class="content-text">
            If you have any questions, our support team is here to help you 24/7.
        </p>
        <p class="content-text" style="margin-top: 30px;">
            Best regards,<br>
            <strong style="color: #FFD700;">The THE DIGITAL TRADING Team</strong>
        </p>
    `;

    return this.getBaseTemplate(content, {
      title: 'Welcome to THE DIGITAL TRADING',
      preheader: 'Welcome to your new trading journey!'
    });
  }

  /**
   * KYC Approved template
   */
  getKYCApprovedTemplate(userName = 'Valued User') {
    const content = `
        <h2 class="content-title">🎉 KYC Verification Approved!</h2>
        <p class="content-text">Dear ${userName},</p>
        <p class="content-text">
            Congratulations! Your KYC (Know Your Customer) verification has been successfully approved.
        </p>
        <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); 
                    padding: 20px; border-radius: 12px; margin: 25px 0; text-align: center;">
            <h3 style="color: white; margin: 0; font-size: 18px;">✅ Verification Complete</h3>
            <p style="color: #D1FAE5; margin: 10px 0 0 0; font-size: 14px;">
                You now have full access to all platform features
            </p>
        </div>
        <p class="content-text">
            With your verified account, you can now:
        </p>
        <ul style="color: #e5e5e5; padding-left: 20px; margin: 20px 0;">
            <li style="margin: 8px 0;">Make unlimited deposits and withdrawals</li>
            <li style="margin: 8px 0;">Access premium trading features</li>
            <li style="margin: 8px 0;">Participate in exclusive investment opportunities</li>
            <li style="margin: 8px 0;">Receive priority customer support</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${this.baseUrl}/dashboard" class="email-button">
                Access Your Account
            </a>
        </div>
        <p class="content-text">
            Thank you for choosing THE DIGITAL TRADING for your cryptocurrency trading needs.
        </p>
        <p class="content-text" style="margin-top: 30px;">
            Best regards,<br>
            <strong style="color: #FFD700;">The THE DIGITAL TRADING Team</strong>
        </p>
    `;

    return this.getBaseTemplate(content, {
      title: 'KYC Verification Approved - THE DIGITAL TRADING',
      preheader: 'Your KYC verification has been approved!'
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
            Best regards,<br>
            <strong style="color: #FFD700;">The THE DIGITAL TRADING Team</strong>
        </p>
    `;

    return this.getBaseTemplate(content, {
      title: `${title} - THE DIGITAL TRADING`,
      preheader: title
    });
  }

  /**
   * Notification template
   */
  getNotificationTemplate(title, message, type = 'info') {
    const typeColors = {
      success: { bg: '#10B981', border: '#059669' },
      warning: { bg: '#F59E0B', border: '#D97706' },
      error: { bg: '#EF4444', border: '#DC2626' },
      info: { bg: '#3B82F6', border: '#2563EB' }
    };

    const colors = typeColors[type] || typeColors.info;

    const content = `
        <div style="background: linear-gradient(135deg, ${colors.bg} 0%, ${colors.border} 100%); 
                    padding: 20px; border-radius: 12px; margin: 0 0 25px 0; text-align: center;">
            <h2 style="color: white; margin: 0; font-size: 22px;">${title}</h2>
        </div>
        <div class="content-text">
            ${message}
        </div>
        <p class="content-text" style="margin-top: 30px;">
            Best regards,<br>
            <strong style="color: #FFD700;">The THE DIGITAL TRADING Team</strong>
        </p>
    `;

    return this.getBaseTemplate(content, {
      title: `${title} - THE DIGITAL TRADING`,
      preheader: title
    });
  }
}

module.exports = new EmailTemplateBuilder();