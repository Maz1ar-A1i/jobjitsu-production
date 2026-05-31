const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const multer = require('multer');

// Configure multer for temp storage
const upload = multer({ dest: 'uploads/' });

router.post('/chat', aiController.chat);
router.post('/analyze-resume', upload.single('resume'), aiController.analyzeResume);
router.post('/generate-resume', aiController.generateResume);

module.exports = router;
