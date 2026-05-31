const express = require('express');
const router = express.Router();
const {
    initSession,
    saveResponse,
    nextQuestion,
    endSession,
    getSessionFeedback,
    generateQuestionEndpoint,
} = require('../controllers/sessionController');
const { generateAudio } = require('../controllers/ttsController');
const authRequired = require('../middleware/authRequired');

// Protect all session routes (enable when auth is fully integrated)
router.use(authRequired);

// ── Session Lifecycle ──────────────────────────────────────────────────────────
router.post('/init', initSession);
router.post('/response', saveResponse);
router.post('/next-question', nextQuestion);
router.post('/end', endSession);

// ── Audio ─────────────────────────────────────────────────────────────────────
router.post('/generate-audio', generateAudio);

// ── Session Report ────────────────────────────────────────────────────────────
router.get('/:session_id/feedback', getSessionFeedback);

// ── Standalone Question Generator ─────────────────────────────────────────────
// GET /api/session/generate_question?role=hr&domain=fullstack&difficulty=Mid
router.get('/generate_question', generateQuestionEndpoint);

module.exports = router;
