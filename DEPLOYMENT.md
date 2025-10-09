# 🚀 THE DIGITAL TRADING - Production Deployment Guide

## 📋 Overview
This guide will help you deploy THE DIGITAL TRADING platform to production using Render for the backend API and Vercel for the frontend.

## 🏗️ Architecture
- **Frontend**: React SPA hosted on Vercel (thedigitaltrading.com)
- **Backend**: Node.js API hosted on Render (thedigitaltrading-api.onrender.com)
- **Database**: MongoDB Atlas (cloud database)

## 📦 Prerequisites
1. GitHub repository with your code
2. Render account (for backend)
3. Vercel account (for frontend)
4. MongoDB Atlas account (for database)
5. Domain name (thedigitaltrading.com)

## 🗄️ Step 1: Set Up MongoDB Atlas Database

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster (free tier is fine for testing)
3. Create a database user with read/write permissions
4. Whitelist your IP addresses (or use 0.0.0.0/0 for all IPs)
5. Get your connection string (it should look like: `mongodb+srv://username:password@cluster.mongodb.net/database`)

## 🔧 Step 2: Deploy Backend to Render

1. Go to [Render](https://render.com/) and sign up/login
2. Connect your GitHub repository
3. Create a new Web Service
4. Select your repository and the `server` folder
5. Use the following settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
   - **Region**: Choose closest to your users

6. Set the following environment variables in Render:
   ```
   NODE_ENV=production
   PORT=10000
   MONGO_URI=your_mongodb_connection_string_here
   JWT_SECRET=your_super_secret_jwt_key_here
   BREVO_API_KEY=your_brevo_api_key_here
   EMAIL_HOST=smtp-relay.brevo.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your_brevo_email@domain.com
   EMAIL_PASS=your_brevo_smtp_password
   EMAIL_FROM=noreply@thedigitaltrading.com
   CORS_ORIGIN=https://thedigitaltrading.com,https://www.thedigitaltrading.com
   FRONTEND_URL=https://thedigitaltrading.com
   ```

7. Deploy the service

## 🌐 Step 3: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com/) and sign up/login
2. Import your GitHub repository
3. Select the `client` folder as the root directory
4. Vercel will automatically detect it's a React app
5. Set the following environment variables in Vercel:
   ```
   REACT_APP_API_URL=https://your-render-service-name.onrender.com
   REACT_APP_API_BASE_URL=https://your-render-service-name.onrender.com
   REACT_APP_SOCKET_URL=wss://your-render-service-name.onrender.com
   REACT_APP_WS_BASE_URL=wss://your-render-service-name.onrender.com
   REACT_APP_FRONTEND_URL=https://thedigitaltrading.com
   ```

6. Deploy the project

## 🔗 Step 4: Configure Custom Domain

### For Vercel (Frontend):
1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain: `thedigitaltrading.com`
4. Follow Vercel's instructions to configure DNS

### For Render (Backend):
1. Go to your Render service settings
2. Navigate to "Custom Domains"
3. Add: `api.thedigitaltrading.com` (optional, for cleaner API URLs)

## 🔒 Step 5: Security Configuration

1. **SSL Certificates**: Both Vercel and Render provide automatic SSL
2. **Environment Variables**: Never commit sensitive data to Git
3. **CORS**: Configured to only allow your domain
4. **Rate Limiting**: Already implemented in the backend

## 🧪 Step 6: Testing Production Deployment

1. Visit your frontend URL: `https://thedigitaltrading.com`
2. Test user registration and login
3. Test API endpoints by checking network tab in browser
4. Verify WebSocket connections work
5. Test email functionality

## 📊 Step 7: Monitoring and Maintenance

### Render Monitoring:
- Check service logs in Render dashboard
- Monitor CPU and memory usage
- Set up alerts for downtime

### Vercel Monitoring:
- Check deployment logs
- Monitor Core Web Vitals
- Set up analytics

## 🚨 Troubleshooting

### Common Issues:

1. **API Connection Failed**:
   - Check if backend service is running on Render
   - Verify environment variables are set correctly
   - Check CORS configuration

2. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check build logs for specific errors

3. **Database Connection Issues**:
   - Verify MongoDB Atlas connection string
   - Check IP whitelist settings
   - Ensure database user has correct permissions

4. **Email Not Working**:
   - Verify Brevo API credentials
   - Check email configuration in environment variables
   - Test with a simple email first

## 📝 Environment Variables Reference

### Backend (.env.production):
```
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/thedigitaltrading
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
BREVO_API_KEY=xkeysib-your-api-key-here
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@domain.com
EMAIL_PASS=your-smtp-password
EMAIL_FROM=noreply@thedigitaltrading.com
CORS_ORIGIN=https://thedigitaltrading.com,https://www.thedigitaltrading.com
FRONTEND_URL=https://thedigitaltrading.com
```

### Frontend (.env.production):
```
REACT_APP_API_URL=https://thedigitaltrading-api.onrender.com
REACT_APP_API_BASE_URL=https://thedigitaltrading-api.onrender.com
REACT_APP_SOCKET_URL=wss://thedigitaltrading-api.onrender.com
REACT_APP_WS_BASE_URL=wss://thedigitaltrading-api.onrender.com
REACT_APP_FRONTEND_URL=https://thedigitaltrading.com
GENERATE_SOURCEMAP=false
```

## 🎉 Success!

Once deployed, your application will be available at:
- **Frontend**: https://thedigitaltrading.com
- **API**: https://thedigitaltrading-api.onrender.com

Your users can now access the full THE DIGITAL TRADING platform with all features including:
- User authentication and registration
- Investment portfolio management
- Real-time market updates
- AI-powered chat support
- Admin dashboard
- Secure payment processing
- And much more!

## 📞 Support

If you encounter any issues during deployment, check the logs in your respective hosting platforms and refer to their documentation for platform-specific troubleshooting.