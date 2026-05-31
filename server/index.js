// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');

// const userRoutes = require('./routes/userRoutes');

// const app = express();

// app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
// app.use(express.json());

// app.use('/api/user', userRoutes);

// mongoose.connect(process.env.MONGODB_URI)
//   .then(() => {
//     console.log('✅ MongoDB Atlas connected');
//     app.listen(process.env.PORT, () => console.log(`✅ Server running on port ${process.env.PORT}`));
//   })
//   .catch(err => console.error('❌ DB connection error:', err));
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const connectDB = require('./config/dbConnection');

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/user', userRoutes);
const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);

const jobRoutes = require('./routes/jobRoutes');
app.use('/api/jobs', jobRoutes);

const sessionRoutes = require('./routes/sessionRoutes');
app.use('/api/session', sessionRoutes);

const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api/dashboard', dashboardRoutes);

// Start Server
connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`✅ Server running on port ${process.env.PORT}`);
  });
});
