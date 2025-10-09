# 🚀 THE DIGITAL TRADING - Production Deployment Guide

## 📋 Overview
This guide will help you deploy THE DIGITAL TRADING platform to production using Render for both the backend API and frontend.

## 🏗️ Architecture
- **Frontend**: React SPA hosted on Render (thedigitaltrading-frontend.onrender.com)
- **Backend**: Node.js API hosted on Render (thedigitaltrading-api.onrender.com)
- **Database**: MongoDB Atlas (cloud database)

## 📦 Prerequisites
1. GitHub repository with your code
2. Render account (for both frontend and backend)
3. MongoDB Atlas account (for database)
4. Domain name (optional, for custom domain)

## 🗄️ Step 1: Set Up MongoDB Atlas Database

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster (free tier is fine for testing)
3. Create a database user with read/write permissions
4. Whitelist your IP addresses (or use 0.0.0.0/0 for all IPs)
5. Get your connection string (it should look like: `mongodb+srv://username:password@cluster.mongodb.net/database`)

## 🔧 Step 2: Deploy to Render

### Option 1: Deploy using render.yaml (Recommended)

1. Go to [Render](https://render.com/) and sign up/login
2. Connect your GitHub repository
3. Create a new "Blueprint" deployment
4. Select your repository
5. Render will automatically detect the `render.yaml` file and deploy both services
6. Set the required environment variables (see below)

### Option 2: Deploy services manually

#### Deploy Backend API:
1. Create a new Web Service in Render
2. Connect your GitHub repository
3. Set root directory to `server`
4. Use these settings:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
   - **Region**: Choose closest to your users

#### Deploy Frontend:
1. Create a new Static Site in Render
2. Connect your GitHub repository  
3. Set root directory to `client`
4. Use these settings:
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`

### Environment Variables for Backend:
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
```

### Environment Variables for Frontend:
```
REACT_APP_API_URL=https://thedigitaltrading-api.onrender.com
REACT_APP_API_BASE_URL=https://thedigitaltrading-api.onrender.com
REACT_APP_SOCKET_URL=wss://thedigitaltrading-api.onrender.com
REACT_APP_WS_BASE_URL=wss://thedigitaltrading-api.onrender.com
REACT_APP_FRONTEND_URL=https://thedigitaltrading-frontend.onrender.com
```

## 🔗 Step 3: Configure Custom Domain (Optional)

### For Render Frontend:
1. In your Render dashboard, go to your frontend service settings
2. Navigate to "Custom Domains"
3. Add your custom domain: `thedigitaltrading.com`
4. Add www subdomain: `www.thedigitaltrading.com`
5. Configure your DNS provider:
   - Add CNAME record: `www` → `thedigitaltrading-frontend.onrender.com`
   - Add CNAME record: `@` → `thedigitaltrading-frontend.onrender.com`

### For Render Backend:
1. In your Render dashboard, go to your backend service settings
2. Navigate to "Custom Domains"
3. Add your API subdomain: `api.thedigitaltrading.com`
4. Configure your DNS provider:
   - Add CNAME record: `api` → `thedigitaltrading-api.onrender.com`

## 🔒 Step 5: Security Configuration

1. **SSL Certificates**: Both Vercel and Render provide automatic SSL
2. **Environment Variables**: Never commit sensitive data to Git
3. **CORS**: Configured to only allow your domain
4. **Rate Limiting**: Already implemented in the backend

## 🧪 Step 4: Testing Production Deployment

1. **Test Backend API**:
   ```bash
   curl https://thedigitaltrading-api.onrender.com/api/health
   ```

2. **Test Frontend**:
   - Visit `https://thedigitaltrading-frontend.onrender.com`
   - Check all pages load correctly
   - Test user registration/login
   - Test trading features

3. **Test Integration**:
   - Ensure frontend can communicate with backend
   - Test WebSocket connections
   - Verify email functionality

## 📊 Step 5: Monitoring and Maintenance

### Render Monitoring:
- Monitor both frontend and backend service health in Render dashboard
- Set up alerts for downtime
- Monitor resource usage and build times
- Review deployment logs for errors

### Database Monitoring:
- Monitor MongoDB Atlas performance
- Set up alerts for connection issues
- Regular backup verification

## 🚨 Troubleshooting

### Common Issues:

1. **Backend not starting**:
   - Check environment variables in Render
   - Verify MongoDB connection string
   - Check Render service logs
   - Ensure Node.js version is compatible (18.x)

2. **Frontend build failing**:
   - Check Node.js version compatibility
   - Verify all dependencies are listed in package.json
   - Check Render build logs
   - Ensure build command is correct: `npm install && npm run build`

3. **CORS errors**:
   - Verify CORS_ORIGIN includes your frontend URL
   - Check that frontend is making requests to correct backend URL
   - Ensure environment variables are properly set

4. **Database connection issues**:
   - Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
   - Check connection string format
   - Verify database user permissions

5. **Service communication issues**:
   - Verify both services are deployed and running
   - Check that environment variables reference correct service URLs
   - Test API endpoints directly

6. **Email Not Working**:
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