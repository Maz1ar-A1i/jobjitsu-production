const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');
const authRequired = require('../middleware/authRequired');

// Protect dashboard route
router.use(authRequired);

router.get('/stats', getDashboardStats);

module.exports = router;
