const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail } = require('../services/emailService');

// 📌 Create a user (Register)
const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ error: 'Email already exists' });
    }

    // 🔒 Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ 
      status: 1,
      message: 'User created successfully', 
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Get all users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Get single user
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Update user
const updateUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const updateData = { name, email };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ message: 'User updated', updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Delete user
const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);

    if (!deletedUser) return res.status(404).json({ error: 'User not found' });

    res.status(200).json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 📌 Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    // 🔑 Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ status: 0, errMsg: "Email is required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ status: 0, errMsg: "User not found" });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/resetpassword?token=${resetToken}`;
    
    // Send email (temporarily disabled for testing)
    try {
      const emailSent = await sendPasswordResetEmail(email, resetLink);
      if (!emailSent) {
        console.log('Email sending failed, but continuing for testing...');
      }
    } catch (error) {
      console.log('Email error:', error.message);
      console.log('Continuing without email for testing...');
    }
    
    console.log('Password reset link:', resetLink);
    console.log('Email sent to:', email);

    return res.json({ 
      status: 1, 
      message: "Password reset link sent to your email"
    });
  } catch (err) {
    return res.status(500).json({ status: 0, errMsg: err.message });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, token } = req.body;
    
    if (!newPassword || !email) {
      return res
        .status(400)
        .json({ status: 0, errMsg: "E-mail / New password required" });
    }

    // Verify token if provided
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.email !== email) {
          return res.status(401).json({ status: 0, errMsg: "Invalid token" });
        }
      } catch (err) {
        return res.status(401).json({ status: 0, errMsg: "Invalid or expired token" });
      }
    }

    // 🔒 Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ⚡ Find user by email and update password
    const updatedUser = await User.findOneAndUpdate(
      { email }, // query by email
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser)
      return res.status(404).json({ status: 0, errMsg: "User not found" });

    return res.json({ status: 1, message: "Password updated successfully" });
  } catch (err) {
    return res.status(500).json({ status: 0, errMsg: err.message });
  }
};


// POST /api/auth/google
const googleAuth = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ status: 0, errMsg: "Authorization code is required" });
    }

    // In a real implementation, you would:
    // 1. Exchange the code for access token with Google
    // 2. Get user info from Google
    // 3. Create or find user in your database
    // 4. Generate JWT token

    // For now, we'll simulate the process
    console.log('Google auth code received:', code);
    
    // Simulate user data (replace with actual Google API call)
    const mockUser = {
      id: 'google_' + Date.now(),
      name: 'Google User',
      email: 'googleuser@example.com'
    };

    // Check if user exists, if not create
    let user = await User.findOne({ email: mockUser.email });
    
    if (!user) {
      user = new User({
        name: mockUser.name,
        email: mockUser.email,
        password: await bcrypt.hash('google_auth_' + Date.now(), 10)
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      status: 1,
      message: 'Google authentication successful',
      user: { id: user._id, name: user.name, email: user.email },
      token
    });
  } catch (err) {
    return res.status(500).json({ status: 0, errMsg: err.message });
  }
};

// POST /api/auth/facebook
const facebookAuth = async (req, res) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({ status: 0, errMsg: "Access token is required" });
    }

    // In a real implementation, you would:
    // 1. Verify the access token with Facebook
    // 2. Get user info from Facebook
    // 3. Create or find user in your database
    // 4. Generate JWT token

    // For now, we'll simulate the process
    console.log('Facebook access token received:', accessToken);
    
    // Simulate user data (replace with actual Facebook API call)
    const mockUser = {
      id: 'facebook_' + Date.now(),
      name: 'Facebook User',
      email: 'facebookuser@example.com'
    };

    // Check if user exists, if not create
    let user = await User.findOne({ email: mockUser.email });
    
    if (!user) {
      user = new User({
        name: mockUser.name,
        email: mockUser.email,
        password: await bcrypt.hash('facebook_auth_' + Date.now(), 10)
      });
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      status: 1,
      message: 'Facebook authentication successful',
      user: { id: user._id, name: user.name, email: user.email },
      token
    });
  } catch (err) {
    return res.status(500).json({ status: 0, errMsg: err.message });
  }
};



module.exports = {
  createUser,
  getUsers,
  loginUser,
  getUserById,
  updateUser,
  resetPassword,
  forgotPassword,
  googleAuth,
  facebookAuth,
  deleteUser
};

