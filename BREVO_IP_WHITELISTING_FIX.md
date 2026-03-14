# Brevo IP Whitelisting Issue - Resolution Guide

## Problem
The `/api/auth/resend-otp` endpoint was returning a 500 error with the following message:
```
We have detected you are using an unrecognised IP address 74.220.48.240. 
If you performed this action make sure to add the new IP address in this link: 
https://app.brevo.com/security/authorised_ips
```

## Root Cause
Brevo (formerly Sendinblue) has IP whitelist security enabled on your account. Your Render deployment server IP (`74.220.48.240`) was not authorized to send emails.

## Solution Applied (As of March 14, 2026)

The code has been updated with **automatic fallback mechanism**:

1. **Graceful Degradation**: When Brevo returns a 401 IP whitelisting error, the system automatically falls back to your configured SMTP service (nodemailer)
2. **Transparent to Users**: Email sending continues to work seamlessly without user intervention
3. **Comprehensive Logging**: Detailed logs help you identify when fallback is being used

### What Changed:
- ✅ `brevoOtpService.js` - Detects 401 IP whitelisting errors and uses fallback mailer
- ✅ `mailer.js` - Improved error handling with automatic SMTP fallback
- ✅ All OTP methods (registration, password reset, profile edit, email verification) now handle this gracefully

## Optional: Eliminate the Issue Permanently

You have two options:

### Option 1: Disable IP Whitelisting (Recommended if using Render)
1. Go to https://app.brevo.com/security/authorised_ips
2. Remove all IP addresses from the whitelist OR disable the feature
3. This allows any IP to send emails through your Brevo account

### Option 2: Whitelist Your Render Server IP
1. Go to https://app.brevo.com/security/authorised_ips
2. Add your Render server IP: `74.220.48.240`
3. Note: If you redeploy on Render, the IP may change and you'll need to update the whitelist again

### Option 3: Use Only SMTP (No Brevo)
If you prefer not to use Brevo at all:
1. Set `BREVO_API_KEY=` (empty) in your environment
2. The system will use only your configured SMTP service via nodemailer
3. Ensure these environment variables are set:
   - `EMAIL_HOST` - Your SMTP server
   - `EMAIL_PORT` - SMTP port (usually 587 or 465)
   - `EMAIL_SECURE` - Set to 'true' for port 465, 'false' for 587
   - `EMAIL_USER` - SMTP username
   - `EMAIL_PASS` - SMTP password
   - `EMAIL_FROM` - Sender email address

## How to Verify It's Working

1. Attempt to resend OTP from the verification page
2. Check the server logs for:
   - **If using Brevo**: `[BREVO] Registration OTP sent successfully`
   - **If using fallback**: `[MAILER] Email sent via nodemailer successfully`
3. Email should be delivered regardless of which service is used

## Environment Variables Reference

```bash
# Brevo Configuration (Optional, fallback always available)
BREVO_API_KEY=your_api_key_here

# SMTP Fallback Configuration (Required for fallback to work)
EMAIL_HOST=smtp.your-provider.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-smtp-password
EMAIL_FROM=noreply@thedigitaltrading.com
```

## Logging
When emails are sent, you'll see logs like:
```
[BREVO] Registration OTP sent successfully
  or
[MAILER] IP whitelisting error detected, using fallback mailer
[MAILER] Email sent via nodemailer successfully
```

## Support
If emails still don't send:
1. Check that `EMAIL_HOST`, `EMAIL_USER`, and `EMAIL_PASS` are configured correctly
2. Ensure your SMTP provider allows connections from your server
3. Check the detailed error logs in the server output for more information

---
**Last Updated**: March 14, 2026
