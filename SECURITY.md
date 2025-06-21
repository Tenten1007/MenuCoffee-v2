# 🔒 Security Documentation - MenuCoffee System

## Overview
This document outlines the security measures implemented in the MenuCoffee system to protect against common web application vulnerabilities.

## 🔐 Authentication & Authorization

### JWT Token Security
- **Token Expiration**: 24 hours for access tokens, 7 days for refresh tokens
- **Secret Key**: Uses environment variable `JWT_SECRET` (minimum 32 characters recommended)
- **Token Validation**: Verifies token signature, expiration, and user existence in database
- **Refresh Token**: Separate secret for refresh tokens to limit exposure

### Password Security
- **Hashing**: bcrypt with configurable rounds (default: 12)
- **Password Policy**: Minimum 6 characters
- **Salt**: Automatic salt generation by bcrypt

### Rate Limiting
- **API Rate Limit**: 100 requests per 15 minutes per IP
- **Login Rate Limit**: 5 attempts per 15 minutes per IP
- **Slow Down**: Progressive delay after 100 requests

## 🛡️ Input Validation & Sanitization

### Request Validation
- **Express Validator**: Comprehensive input validation for all endpoints
- **Input Sanitization**: HTML sanitization to prevent XSS
- **Type Checking**: Validates data types and formats
- **Length Limits**: Prevents buffer overflow attacks

### File Upload Security
- **File Type Validation**: Only allows image files (JPEG, PNG, GIF, WebP)
- **File Size Limit**: Maximum 5MB per file
- **Filename Sanitization**: Uses UUID for secure filenames
- **MIME Type Checking**: Validates both extension and MIME type
- **Automatic Cleanup**: Removes old files after 7 days

## 🌐 Network Security

### CORS Configuration
- **Origin Validation**: Whitelist approach for allowed origins
- **Credentials**: Supports secure cookie-based authentication
- **Methods**: Restricts HTTP methods to necessary ones
- **Headers**: Controls allowed request headers

### Security Headers
- **Helmet.js**: Comprehensive security headers
- **Content Security Policy**: Restricts resource loading
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME type sniffing
- **X-XSS-Protection**: Additional XSS protection

## 🗄️ Database Security

### SQL Injection Prevention
- **Parameterized Queries**: All database queries use prepared statements
- **Input Validation**: Validates all user inputs before database operations
- **Connection Pooling**: Secure connection management
- **Error Handling**: Prevents information leakage in error messages

### Database Configuration
- **Environment Variables**: Database credentials stored in environment variables
- **Connection Limits**: Prevents connection exhaustion
- **Timeout Settings**: Configurable connection timeouts
- **Reconnection**: Automatic reconnection on connection loss

## 📝 Error Handling

### Error Response Security
- **Production Mode**: Hides internal error details in production
- **Logging**: Comprehensive error logging for debugging
- **User-Friendly Messages**: Generic error messages for users
- **Stack Trace**: Only shown in development mode

### Graceful Shutdown
- **Signal Handling**: Proper handling of SIGTERM and SIGINT
- **Connection Cleanup**: Closes database connections properly
- **Resource Cleanup**: Releases system resources

## 🔄 Session Management

### Token Management
- **Secure Storage**: Tokens stored in httpOnly cookies (recommended)
- **Token Refresh**: Automatic token refresh mechanism
- **Token Invalidation**: Proper logout handling
- **Session Timeout**: Configurable session duration

## 📊 Monitoring & Logging

### Security Logging
- **Authentication Events**: Logs login attempts and failures
- **Rate Limit Violations**: Tracks rate limit exceedances
- **File Upload Events**: Logs file upload attempts
- **Error Tracking**: Comprehensive error logging

### Health Monitoring
- **Health Check Endpoint**: `/api/health` for system monitoring
- **Database Connectivity**: Monitors database connection status
- **System Metrics**: Basic system performance metrics

## 🚨 Incident Response

### Security Incidents
1. **Immediate Response**: Log incident details
2. **Assessment**: Evaluate impact and scope
3. **Containment**: Isolate affected systems
4. **Investigation**: Analyze root cause
5. **Recovery**: Restore normal operations
6. **Post-Incident**: Document lessons learned

### Contact Information
- **Security Team**: [security@menucoffee.com]
- **Emergency Contact**: [emergency@menucoffee.com]

## 📋 Security Checklist

### Pre-Deployment
- [ ] Environment variables properly configured
- [ ] Database credentials secured
- [ ] JWT secrets are strong and unique
- [ ] File upload restrictions in place
- [ ] Rate limiting configured
- [ ] CORS settings validated
- [ ] Security headers enabled
- [ ] Error handling tested

### Regular Maintenance
- [ ] Update dependencies monthly
- [ ] Review security logs weekly
- [ ] Monitor rate limit violations
- [ ] Check for suspicious activities
- [ ] Backup security configurations
- [ ] Test security measures

### Incident Response
- [ ] Monitor system logs
- [ ] Track authentication failures
- [ ] Monitor file upload patterns
- [ ] Check for unusual traffic patterns
- [ ] Review error logs regularly

## 🔧 Security Configuration

### Environment Variables
```bash
# Required for production
NODE_ENV=production
JWT_SECRET=your_very_long_random_secret_key_here
DB_PASSWORD=your_secure_database_password
COOKIE_SECRET=your_cookie_secret_here

# Recommended settings
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_MAX_REQUESTS=5
MAX_FILE_SIZE=5242880
```

### Security Headers
```javascript
// Automatically configured by helmet.js
Content-Security-Policy: default-src 'self'
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
```

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practices-security.html)
- [JWT Security](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

**Last Updated**: December 2024
**Version**: 1.0
**Maintainer**: Security Team 