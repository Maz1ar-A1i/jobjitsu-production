# Email Setup Guide for Password Reset

## Quick Setup for Gmail

### 1. Enable 2-Factor Authentication
- Go to your Google Account settings
- Enable 2-Factor Authentication

### 2. Generate App Password
- Go to Google Account → Security → App passwords
- Select "Mail" and your device
- Copy the generated 16-character password

### 3. Update Environment Variables
Add these to your `server/.env` file:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
FRONTEND_URL=http://localhost:5173
```

### 4. Restart Server
After updating the environment variables, restart your server.

## Alternative Email Services

### Outlook/Hotmail
```javascript
// In emailService.js, change service to:
service: 'outlook'
```

### Custom SMTP
```javascript
// In emailService.js, replace createTransporter with:
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: 'your-smtp-host.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};
```

## Testing

1. Start your server
2. Go to `/forgot-password` page
3. Enter your email address
4. Check your inbox for the reset link

## Troubleshooting

### "Invalid login" error
- Make sure you're using an App Password, not your regular password
- Verify 2-Factor Authentication is enabled

### "Connection timeout" error
- Check your internet connection
- Try a different email service

### Email not received
- Check spam folder
- Verify email address is correct
- Check server console for error messages
