# Forgot Password Flow Implementation

## Overview
This document describes the complete forgot/reset password flow implemented in JobJitsu.

## Flow Sequence

### 1. Forgot Password Page (`/forgot-password`)
- **Purpose**: Ask user for their email address
- **Features**:
  - Beautiful gradient background
  - Glassmorphism design with backdrop blur
  - Form validation for email
  - Loading states with spinner
  - Success state with checkmark icon
  - Responsive design

### 2. Email Sending Process
- **Backend**: `/user/forgot-password` endpoint
- **Process**:
  1. Validates email exists in database
  2. Generates JWT token (valid for 1 hour)
  3. Creates reset link with token
  4. Sends email with reset link (optional - commented out for development)
  5. Returns success response

### 3. Reset Password Page (`/resetpassword?token=...`)
- **Purpose**: Allow user to set new password
- **Features**:
  - Extracts token from URL parameters
  - Validates token on form submission
  - Attractive interface with key icon
  - Password and confirm password fields
  - Form validation
  - Auto-redirect to login after success

## Files Created/Modified

### Frontend
- `src/pages/forgotpassword/forgot.password.jsx` - Forgot password page
- `src/pages/forgotpassword/forgot.password.scss` - Styles for forgot password
- `src/pages/forgotpassword/change.password.scss` - Updated styles for reset password
- `src/routes/publicRoutes.js` - Added forgot password route
- `src/features/auth/login.form.jsx` - Updated forgot password link
- `src/services/apis/authService.js` - Fixed forgot password API call

### Backend
- `server/controllers/userControllers.js` - Added forgotPassword function
- `server/routes/userRoutes.js` - Added forgot password route
- `server/services/emailService.js` - Email service for production

## API Endpoints

### POST `/user/forgot-password`
**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "status": 1,
  "message": "Password reset link sent to your email",
  "resetLink": "http://localhost:5173/resetpassword?token=..."
}
```

### POST `/user/resetpassword`
**Request Body:**
```json
{
  "email": "user@example.com",
  "newPassword": "newPassword123",
  "token": "jwt_token_here"
}
```

**Response:**
```json
{
  "status": 1,
  "message": "Password updated successfully"
}
```

## Security Features

1. **JWT Token**: Reset tokens are JWT-based with 1-hour expiration
2. **Token Validation**: Server validates token before allowing password reset
3. **Email Verification**: Token is tied to specific email address
4. **Password Hashing**: New passwords are hashed using bcrypt

## Email Configuration (Production)

To enable email sending in production:

1. Set environment variables:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   FRONTEND_URL=https://yourdomain.com
   ```

2. Uncomment email sending code in `userControllers.js`:
   ```javascript
   const emailSent = await sendPasswordResetEmail(email, resetLink);
   if (!emailSent) {
     return res.status(500).json({ status: 0, errMsg: "Failed to send email" });
   }
   ```

3. Remove `resetLink` from response (security best practice)

## Styling Features

- **Gradient Backgrounds**: Beautiful purple-blue gradients
- **Glassmorphism**: Semi-transparent cards with backdrop blur
- **Animations**: Smooth hover effects and fade-in animations
- **Responsive Design**: Works on all screen sizes
- **Loading States**: Spinner animations during API calls
- **Success States**: Checkmark icons and success messages

## Usage

1. User clicks "Forgot password?" on login page
2. User enters email on forgot password page
3. System sends reset link via email (or logs it in development)
4. User clicks link in email to go to reset password page
5. User enters new password and confirms
6. System validates token and updates password
7. User is redirected to login page

## Development vs Production

### Development
- Reset links are logged to console
- Email sending is commented out
- `resetLink` is included in API response for testing

### Production
- Enable email sending
- Remove `resetLink` from API response
- Configure proper email service credentials
- Set up proper domain URLs
