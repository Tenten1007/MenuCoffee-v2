# 🚀 Production Deployment Guide - MenuCoffee

## 📋 Pre-Deployment Checklist

### ✅ Security Requirements
- [ ] Generate strong JWT secrets (minimum 32 characters)
- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL
- [ ] Configure proper CORS origins
- [ ] Set up monitoring and logging

### ✅ Infrastructure Requirements
- [ ] Production database (MySQL/PostgreSQL)
- [ ] File storage solution (AWS S3, Google Cloud Storage)
- [ ] Domain and SSL certificate
- [ ] Load balancer (optional)
- [ ] CDN for static files (optional)

### ✅ Environment Setup
- [ ] Production environment variables configured
- [ ] Database migrations completed
- [ ] Initial admin user created
- [ ] File upload directory configured
- [ ] Logging infrastructure set up

## 🌐 Deployment Options

### Option 1: VPS/Cloud Server (Recommended)

#### 1.1 Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MySQL
sudo apt install mysql-server -y

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y
```

#### 1.2 Application Setup
```bash
# Clone repository
git clone https://github.com/your-repo/menucoffee.git
cd menucoffee

# Install dependencies
cd server && npm install --production
cd ../client && npm install --production

# Build client
npm run build

# Set up environment variables
cp env-production.txt .env
# Edit .env with your production values
nano .env
```

#### 1.3 Database Setup
```sql
-- Create database and user
CREATE DATABASE coffee_menu_db;
CREATE USER 'menucoffee_user'@'localhost' IDENTIFIED BY 'your-strong-password';
GRANT ALL PRIVILEGES ON coffee_menu_db.* TO 'menucoffee_user'@'localhost';
FLUSH PRIVILEGES;

-- Run database initialization
mysql -u menucoffee_user -p coffee_menu_db < server/db/init.sql
```

#### 1.4 PM2 Configuration
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'menucoffee-server',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 1.5 Nginx Configuration
```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/menucoffee

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    # SSL configuration
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Client files
    location / {
        root /path/to/menucoffee/client/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # File uploads
    location /uploads/ {
        alias /path/to/menucoffee/server/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/menucoffee /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Option 2: Cloud Platforms

#### 2.1 Heroku
```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login and create app
heroku login
heroku create your-menucoffee-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret-key
# ... set all other environment variables

# Deploy
git push heroku main
```

#### 2.2 Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### 2.3 DigitalOcean App Platform
- Create new app in DigitalOcean dashboard
- Connect GitHub repository
- Configure environment variables
- Deploy automatically

## 🔧 Post-Deployment Tasks

### 1. Security Verification
```bash
# Run security tests
npm run security:test

# Check SSL configuration
curl -I https://your-domain.com

# Test rate limiting
for i in {1..110}; do curl https://your-domain.com/api/health; done
```

### 2. Performance Monitoring
```bash
# Monitor application
pm2 monit

# Check logs
pm2 logs menucoffee-server

# Monitor system resources
htop
```

### 3. Backup Setup
```bash
# Database backup script
#!/bin/bash
mysqldump -u menucoffee_user -p coffee_menu_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Add to crontab for daily backups
0 2 * * * /path/to/backup-script.sh
```

## 📊 Monitoring & Maintenance

### Daily Tasks
- [ ] Check application logs
- [ ] Monitor error rates
- [ ] Verify database connectivity
- [ ] Check disk space

### Weekly Tasks
- [ ] Review security logs
- [ ] Update dependencies
- [ ] Backup verification
- [ ] Performance analysis

### Monthly Tasks
- [ ] Security audit
- [ ] SSL certificate renewal
- [ ] System updates
- [ ] Capacity planning

## 🚨 Emergency Procedures

### Application Down
```bash
# Restart application
pm2 restart menucoffee-server

# Check logs
pm2 logs menucoffee-server --lines 100

# Rollback if needed
pm2 restart menucoffee-server --update-env
```

### Database Issues
```bash
# Check database status
sudo systemctl status mysql

# Restart database
sudo systemctl restart mysql

# Restore from backup if needed
mysql -u menucoffee_user -p coffee_menu_db < backup_file.sql
```

## 📞 Support Contacts

- **Technical Support**: tech@menucoffee.com
- **Security Issues**: security@menucoffee.com
- **Emergency**: +66-XX-XXX-XXXX

---

**Last Updated**: December 2024
**Version**: 1.0 