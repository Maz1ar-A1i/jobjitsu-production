const nodemailer = require('nodemailer');

// Create transporter (configure with your email service)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetLink) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request - JobJitsu',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">JobJitsu</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">AI-Powered Smart Interview Coach</p>
          </div>
          
          <div style="padding: 40px 30px; background: #f8f9fa;">
            <h2 style="color: #2c3e50; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="color: #7f8c8d; line-height: 1.6; margin-bottom: 30px;">
              You recently requested to reset your password for your JobJitsu account. 
              Click the button below to reset it.
            </p>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 30px; 
                        text-decoration: none; 
                        border-radius: 8px; 
                        font-weight: bold;
                        display: inline-block;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #7f8c8d; font-size: 14px; margin-bottom: 20px;">
              This password reset link will expire in 1 hour.
            </p>
            
            <p style="color: #7f8c8d; font-size: 14px; margin-bottom: 20px;">
              If you didn't request a password reset, please ignore this email or contact support if you have concerns.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e9ecef; margin: 30px 0;">
            
            <p style="color: #7f8c8d; font-size: 12px; text-align: center;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetLink}" style="color: #667eea;">${resetLink}</a>
            </p>
          </div>
          
          <div style="background: #2c3e50; padding: 20px; text-align: center; color: white;">
            <p style="margin: 0; font-size: 14px;">
              © 2024 JobJitsu. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email: ', error);
    return false;
  }
};

module.exports = {
  sendPasswordResetEmail,
};
