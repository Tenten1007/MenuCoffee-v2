# 🚀 Railway Deployment Guide - MenuCoffee

## 📋 Prerequisites
- GitHub account
- Railway account (https://railway.app)
- Credit card (for verification, won't charge if under $5/month)

## 🚀 Quick Deploy Steps

### 1. Prepare Your Code
```bash
# Make sure all files are committed to GitHub
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 2. Deploy on Railway

#### Step 1: Sign up on Railway
- Go to https://railway.app
- Sign up with your GitHub account
- Add credit card (required for verification)

#### Step 2: Create New Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Choose your MenuCoffee repository
- Click "Deploy Now"

#### Step 3: Add Database
- In your Railway project dashboard
- Click "New" → "Database" → "MySQL"
- Railway will create a MySQL database for you
- Note down the database credentials

#### Step 4: Configure Environment Variables
- Go to your project settings
- Click "Variables" tab
- Add the following variables (replace with your values):

```
NODE_ENV=production
PORT=5000
DB_HOST=your-railway-mysql-host
DB_USER=your-railway-mysql-user
DB_PASSWORD=your-railway-mysql-password
DB_NAME=your-railway-mysql-database
DB_PORT=3306
JWT_SECRET=3286de2515af11b2415410445387f9f0f5ec50a71d24d2d7346baded81fa6c3e
JWT_REFRESH_SECRET=83a8a6bb224b8b6901d3834c115fdf21f672f123b7b14f164eacda50f5e1955a
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d
SESSION_SECRET=your_session_secret_here
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_HTTPONLY=true
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp
CORS_ORIGIN=https://your-railway-domain.railway.app
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ADMIN_EMAIL=admin@menucoffee.com
ADMIN_PASSWORD=admin123456
LOG_LEVEL=info
LOG_FILE=./logs/app.log
```

#### Step 5: Initialize Database
- Railway will automatically run the build process
- The database will be initialized with the tables
- Check the logs to ensure everything is working

#### Step 6: Access Your App
- Railway will provide you with a URL (e.g., https://your-app.railway.app)
- Your app is now live with SSL!

## 🔧 Troubleshooting

### Common Issues:
1. **Build fails**: Check if all dependencies are in package.json
2. **Database connection fails**: Verify database credentials in environment variables
3. **Port issues**: Railway automatically sets PORT environment variable
4. **File uploads**: Railway provides persistent storage for uploads

### Check Logs:
- Go to your Railway project dashboard
- Click on your service
- Check the "Logs" tab for any errors

## 💰 Cost Management
- Railway gives $5 credit/month (free tier)
- MenuCoffee typically uses $2-4/month
- Monitor usage in Railway dashboard
- Set up alerts if needed

## 🔒 Security Notes
- All environment variables are encrypted
- SSL is automatically provided
- Database is isolated and secure
- File uploads are stored securely

## 📞 Support
- Railway documentation: https://docs.railway.app
- Community support: Railway Discord
- Email support: Available for paid plans

## 🎉 Success!
Your MenuCoffee app is now live on Railway with:
- ✅ SSL Certificate (HTTPS)
- ✅ Database
- ✅ File uploads
- ✅ Automatic deployments
- ✅ Monitoring and logs 