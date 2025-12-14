# API Documentation - Node.js Sarahah App

## Table of Contents

- [Overview](#overview)
- [Base URL](#base-url)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [Authentication Routes](#authentication-routes)
  - [User Routes](#user-routes)
  - [Message Routes](#message-routes)
- [Error Handling](#error-handling)
- [Deployment Guide](#deployment-guide)

---

## Overview

This is a Node.js backend API for a Sarahah-like anonymous messaging application. The API provides user authentication, profile management, and anonymous messaging functionality.

**Tech Stack:**

- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- Bcrypt for password hashing
- Nodemailer for email services

---

## Base URL

```
Development: http://localhost:3000
Production: [Your deployed URL]
```

---

## Authentication

This API uses **JWT (JSON Web Tokens)** for authentication. There are two types of tokens:

1. **Access Token**: Short-lived token (1 hour) for API requests
2. **Refresh Token**: Long-lived token (1 day) to obtain new access tokens

### Protected Routes

Protected routes require an `accesstoken` header:

```
Headers:
  accesstoken: <your-access-token>
```

### Admin Routes

Admin-only routes require both authentication and admin role authorization.

---

## API Endpoints

### Authentication Routes

Base path: `/auth`

#### 1. Sign Up

**POST** `/auth/signUp`

Create a new user account. A verification email will be sent to the provided email address.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "confirmPassword": "SecurePass123",
  "username": "johndoe",
  "phone": "1234567890",
  "age": 25
}
```

**Response (201 Created):**

```json
{
  "message": "user created successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "johndoe",
    "phone": "encrypted_phone_value",
    "age": 25,
    "isEmailVerified": false,
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

- `400`: Password and confirm password do not match
- `409`: Email already exists
- `500`: Internal server error

---

#### 2. Verify Email

**GET** `/auth/verify-email/:token`

Verify user email address using the token sent via email.

**URL Parameters:**

- `token`: JWT token from verification email

**Response (200 OK):**

```json
{
  "message": "email verified successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "isEmailVerified": true,
    ...
  }
}
```

**Error Responses:**

- `500`: Invalid or expired token

---

#### 3. Sign In

**POST** `/auth/signIn`

Authenticate user and receive access and refresh tokens.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200 OK):**

```json
{
  "message": "signin successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

- `404`: Email not found, please sign up
- `401`: Invalid password
- `500`: Internal server error

---

#### 4. Refresh Token

**POST** `/auth/refreshtoken`

Get a new access token using a valid refresh token.

**Request Headers:**

```
refreshtoken: <your-refresh-token>
```

**Response (200 OK):**

```json
{
  "message": "refresh successdfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**

- `401`: Refresh token missing
- `500`: Invalid or expired refresh token

---

#### 5. Sign Out

**POST** `/auth/signout`

Invalidate current access and refresh tokens (adds them to blacklist).

**Request Headers:**

```
accesstoken: <your-access-token>
refreshtoken: <your-refresh-token>
```

**Response (200 OK):**

```json
{
  "message": "signout successdfully"
}
```

**Error Responses:**

- `500`: Invalid tokens or internal server error

---

#### 6. Forget Password

**POST** `/auth/forgetpassword`

Request a password reset OTP via email.

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**

```json
{
  "message": "otp sent successfully"
}
```

**Error Responses:**

- `404`: This email is not registered
- `500`: Internal server error

---

#### 7. Reset Password

**POST** `/auth/resetpassword`

Reset password using the OTP received via email.

**Request Body:**

```json
{
  "email": "user@example.com",
  "otp": "550e8400-e29b-41d4-a716-446655440000",
  "password": "NewSecurePass123",
  "confirmpassword": "NewSecurePass123"
}
```

**Response (200 OK):**

```json
{
  "message": "password reset successfully"
}
```

**Error Responses:**

- `400`: Passwords do not match or invalid OTP
- `404`: User not found or no OTP sent
- `500`: Internal server error

---

### User Routes

Base path: `/user`

All user routes require authentication via `accesstoken` header.

#### 1. Get Profile

**GET** `/user/profile`

🔒 **Protected Route** - Requires authentication

Get the authenticated user's profile information.

**Request Headers:**

```
accesstoken: <your-access-token>
```

**Response (200 OK):**

```json
{
  "message": "user profile fetched successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "username": "johndoe",
    "phone": "1234567890",
    "age": 25,
    "isEmailVerified": true,
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

- `401`: Unauthorized (invalid or missing token)
- `404`: User not found
- `500`: Internal server error

---

#### 2. Update Password

**PATCH** `/user/updatepassword`

🔒 **Protected Route** - Requires authentication

Update the authenticated user's password. This will invalidate the current access token.

**Request Headers:**

```
accesstoken: <your-access-token>
```

**Request Body:**

```json
{
  "oldPassword": "OldSecurePass123",
  "newPassword": "NewSecurePass123",
  "confirmNewPassword": "NewSecurePass123"
}
```

**Response (200 OK):**

```json
{
  "message": "password updated successfully"
}
```

**Error Responses:**

- `401`: Invalid old password or unauthorized
- `400`: New password and confirm password do not match
- `404`: User not found
- `500`: Internal server error

---

#### 3. Update Profile

**PUT** `/user/updateprofile`

🔒 **Protected Route** - Requires authentication

Update user profile information (username, phone, email). If email is changed, a new verification email will be sent.

**Request Headers:**

```
accesstoken: <your-access-token>
```

**Request Body:**

```json
{
  "username": "newusername",
  "phone": "9876543210",
  "email": "newemail@example.com"
}
```

**Note:** All fields are optional. Only include fields you want to update.

**Response (200 OK):**

```json
{
  "message": "profile updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "newemail@example.com",
    "username": "newusername",
    "phone": "encrypted_phone_value",
    "isEmailVerified": false,
    ...
  }
}
```

**Error Responses:**

- `401`: Unauthorized
- `404`: User not found
- `409`: Email already exists
- `500`: Internal server error

---

#### 4. List All Users

**GET** `/user/listuser`

🔒 **Protected Route** - Requires authentication and **ADMIN** role

Get a list of all users in the system. Only accessible by administrators.

**Request Headers:**

```
accesstoken: <your-admin-access-token>
```

**Response (200 OK):**

```json
{
  "message": "users fetched successfully",
  "users": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "email": "user1@example.com",
      "username": "user1",
      "role": "user",
      ...
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "email": "admin@example.com",
      "username": "admin",
      "role": "admin",
      ...
    }
  ]
}
```

**Error Responses:**

- `401`: Unauthorized
- `403`: Forbidden (not an admin)
- `500`: Internal server error

---

### Message Routes

Base path: `/message`

#### 1. Send Message

**POST** `/message/send-message`

Send an anonymous message to a user.

**Request Body:**

```json
{
  "body": "This is an anonymous message",
  "ownerId": "507f1f77bcf86cd799439011"
}
```

**Response (201 Created):**

```json
{
  "message": "Message sent successfully",
  "message": {
    "_id": "507f1f77bcf86cd799439013",
    "body": "This is an anonymous message",
    "ownerId": "507f1f77bcf86cd799439011",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**

- `404`: User not found
- `500`: Internal server error

---

#### 2. Get All Messages

**GET** `/message/get-messages`

Get all messages in the system with populated user information.

**Response (200 OK):**

```json
{
  "message": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "body": "This is an anonymous message",
      "ownerId": {
        "_id": "507f1f77bcf86cd799439011",
        "username": "johndoe",
        "email": "user@example.com",
        "role": "user"
      },
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

- `500`: Internal server error

---

#### 3. Get User Messages

**GET** `/message/get-user-messages`

🔒 **Protected Route** - Requires authentication

Get all messages sent to the authenticated user.

**Request Headers:**

```
accesstoken: <your-access-token>
```

**Response (200 OK):**

```json
{
  "message": "success",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "body": "This is an anonymous message",
      "ownerId": "507f1f77bcf86cd799439011",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

**Error Responses:**

- `401`: Unauthorized
- `500`: Internal server error

---

## Error Handling

The API uses a global error handler that returns errors in JSON format.

### Common Error Response Format

```json
{
  "message": "Error description",
  "error": {
    // Error details (in development mode)
  }
}
```

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `500 Internal Server Error`: Server error

---

## Deployment Guide

### Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** (local or cloud instance like MongoDB Atlas)
3. **SMTP Server** (for email functionality)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000

# Database
MONGODB_URI=mongodb://localhost:27017/sarahah-app
# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sarahah-app

# JWT Secret Keys
JWT_SECRET_KEY=your-secret-key-for-email-verification
JWT_LOGIN_SECRET_KEY=your-secret-key-for-login
JWT_REFRESH_SECRET_KEY=your-secret-key-for-refresh-token

# Encryption
ENCRYPTED_KEY=your-encryption-key
SALT=10

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Installation Steps

1. **Clone the repository:**

   ```bash
   git clone <your-repo-url>
   cd Backend_project
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   - Create a `.env` file in the root directory
   - Add all required environment variables (see above)

4. **Start MongoDB:**

   - Local: Ensure MongoDB service is running
   - Cloud: Ensure MongoDB Atlas cluster is accessible

5. **Run the application:**

   ```bash
   # Development
   node index.js

   # Or with nodemon for auto-restart
   npm install -g nodemon
   nodemon index.js
   ```

6. **Verify the server is running:**
   ```
   Server is running on port 3000
   ```

### Deployment to Production

#### Option 1: Deploy to Heroku

1. **Install Heroku CLI:**

   ```bash
   npm install -g heroku
   ```

2. **Login to Heroku:**

   ```bash
   heroku login
   ```

3. **Create a new Heroku app:**

   ```bash
   heroku create your-app-name
   ```

4. **Set environment variables:**

   ```bash
   heroku config:set JWT_SECRET_KEY=your-secret-key
   heroku config:set JWT_LOGIN_SECRET_KEY=your-login-secret
   heroku config:set JWT_REFRESH_SECRET_KEY=your-refresh-secret
   heroku config:set MONGODB_URI=your-mongodb-atlas-uri
   heroku config:set EMAIL_HOST=smtp.gmail.com
   heroku config:set EMAIL_USER=your-email@gmail.com
   heroku config:set EMAIL_PASSWORD=your-app-password
   heroku config:set SALT=10
   ```

5. **Deploy:**
   ```bash
   git push heroku main
   ```

#### Option 2: Deploy to Railway

1. **Install Railway CLI:**

   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**

   ```bash
   railway login
   ```

3. **Initialize project:**

   ```bash
   railway init
   ```

4. **Add environment variables via Railway dashboard**

5. **Deploy:**
   ```bash
   railway up
   ```

#### Option 3: Deploy to Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Set environment variables in the Render dashboard
4. Deploy automatically on push to main branch

#### Option 4: Deploy to VPS (DigitalOcean, AWS EC2, etc.)

1. **SSH into your server:**

   ```bash
   ssh user@your-server-ip
   ```

2. **Install Node.js and MongoDB:**

   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Clone and setup the project:**

   ```bash
   git clone <your-repo-url>
   cd Backend_project
   npm install
   ```

4. **Set up environment variables:**

   ```bash
   nano .env
   # Add all environment variables
   ```

5. **Use PM2 for process management:**

   ```bash
   npm install -g pm2
   pm2 start index.js --name sarahah-api
   pm2 startup
   pm2 save
   ```

6. **Set up Nginx as reverse proxy:**

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Testing the Deployment

Use tools like **Postman**, **Insomnia**, or **curl** to test your deployed API:

```bash
# Test health check
curl https://your-deployed-url.com/auth/signIn

# Test sign up
curl -X POST https://your-deployed-url.com/auth/signUp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123",
    "confirmPassword": "Test123",
    "username": "testuser",
    "phone": "1234567890",
    "age": 25
  }'
```

### Security Recommendations

1. **Use strong JWT secret keys** (at least 32 characters)
2. **Enable HTTPS** in production (use Let's Encrypt for free SSL)
3. **Set up CORS** properly to restrict origins
4. **Use rate limiting** to prevent abuse
5. **Sanitize user inputs** to prevent injection attacks
6. **Keep dependencies updated** regularly
7. **Use environment variables** for all sensitive data
8. **Enable MongoDB authentication** in production
9. **Set up monitoring** (e.g., PM2, New Relic, Datadog)
10. **Implement logging** for debugging and auditing

### Monitoring and Maintenance

- **Logs**: Use PM2 logs or cloud provider logging
- **Uptime Monitoring**: Use services like UptimeRobot or Pingdom
- **Performance**: Monitor with New Relic or Application Insights
- **Database Backups**: Set up automated MongoDB backups

---

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [JWT.io](https://jwt.io/)
- [Nodemailer Documentation](https://nodemailer.com/)

---

## Support

For issues or questions, please contact the development team or create an issue in the repository.

**Last Updated:** December 2024
