const Session = require('../models/sessionModel');
const { generateQuestion, generateFeedback } = require('../services/interview_manager');

// ─── Session Initialization ───────────────────────────────────────────────────

const initSession = async (req, res) => {
    try {
        const { domain, experienceLevel } = req.body;
        const user_id = req.userId || '507f1f77bcf86cd799439011'; // Valid ObjectId

        // Generate the first HR question with no history
        const firstQuestion = await generateQuestion('hr', domain, experienceLevel, [], 0);

        const newSession = await Session.create({
            user_id,
            domain: domain || 'General',
            experienceLevel: experienceLevel || 'Junior',
            status: 'active',
            questions: [],
        });

        res.status(201).json({
            message: 'Session initialized',
            session_id: newSession._id,
            session: newSession,
            first_question: {
                avatar: 'hr',
                text: firstQuestion,
                question_number: 1,
            },
        });
    } catch (error) {
        console.error('Init Session Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ─── Save Response & Generate Per-Question Feedback ──────────────────────────

const saveResponse = async (req, res) => {
    try {
        const { session_id, avatar_id, question_text, response_data } = req.body;
        const session = await Session.findById(session_id);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Extract ML face & voice metrics if provided by the frontend payload
        const faceParams = response_data.faceMetrics || {};
        const voiceParams = response_data.voiceMetrics || {};

        const mlMetrics = {
            emotion: faceParams.expression || 'neutral',
            eyeContact: (faceParams.eye_contact === 'looking at camera') ? 'High' : (faceParams.eye_contact === 'looking away' ? 'Low' : 'Moderate'),
            posture: faceParams.head_pose || 'centered',
            voiceTone: voiceParams.tone || 'neutral'
        };

        const questionEntry = {
            avatar_id,
            question_text,
            response: {
                ...response_data,
                respondedAt: new Date(),
                analysis: {
                    clarityScore: 70, // Temporary default
                    confidenceScore: 0.9, 
                    technicalAccuracy: 0.7,

                    // ML visual feedback mapping
                    sentiment: faceParams.expression || 'neutral',
                    emotion: faceParams.expression || 'neutral',
                    eyeContact: faceParams.eye_contact === 'looking at camera' ? 1.0 : (faceParams.eye_contact === 'looking away' ? 0.3 : 0.7),
                    posture: faceParams.head_pose || 'centered',

                    feedback: 'Processing feedback in background...',
                    strengths: [],
                    improvements: [],
                    processing: true // Flag to identify background completion state
                },
            },
        };

        session.questions.push(questionEntry);
        await session.save();

        // Return immediately to the client so it can request the next question without waiting
        res.status(200).json({ message: 'Response saved', feedback: questionEntry.response.analysis });

        // Generate structured feedback asynchronously in the background
        (async () => {
            try {
                const feedback = await generateFeedback(
                    question_text,
                    response_data.transcript,
                    session.domain,
                    session.experienceLevel,
                    mlMetrics
                );

                const updatedSession = await Session.findById(session_id);
                if (updatedSession) {
                    const qIndex = updatedSession.questions.findIndex(q => q.question_text === question_text);
                    if (qIndex !== -1) {
                        updatedSession.questions[qIndex].response.analysis = {
                            ...updatedSession.questions[qIndex].response.analysis,
                            clarityScore: feedback.score,
                            technicalAccuracy: feedback.score / 100,
                            feedback: feedback.feedback,
                            strengths: feedback.strengths,
                            improvements: feedback.improvements,
                            processing: false
                        };
                        updatedSession.markModified('questions');
                        await updatedSession.save();
                        console.log(`[Background Feedback] Saved for question: "${question_text.substring(0, 30)}..."`);
                    }
                }
            } catch (bgError) {
                console.error('[Background Feedback Error]:', bgError);
            }
        })();

    } catch (error) {
        console.error('Save Response Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ─── Next Question ────────────────────────────────────────────────────────────

const nextQuestion = async (req, res) => {
    try {
        const { session_id, avatar_id, current_question_count } = req.body;
        const session = await Session.findById(session_id);

        if (!session) return res.status(404).json({ message: 'Session not found' });

        // Build full history for context + deduplication
        const history = session.questions.map(q => ({
            question: q.question_text,
            answer: q.response.transcript,
            avatar_id: q.avatar_id,
        }));

        const question = await generateQuestion(
            avatar_id,
            session.domain,
            session.experienceLevel,
            history,
            current_question_count
        );

        res.status(200).json({ question, avatar_id });
    } catch (error) {
        console.error('Next Question Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// ─── End Session ──────────────────────────────────────────────────────────────

const endSession = async (req, res) => {
    try {
        const { session_id } = req.body;
        const session = await Session.findByIdAndUpdate(
            session_id,
            { status: 'completed', endTime: new Date() },
            { new: true }
        );
        res.status(200).json({ message: 'Session ended', session });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Session Feedback Report ──────────────────────────────────────────────────

const getSessionFeedback = async (req, res) => {
    try {
        const { session_id } = req.params;
        const session = await Session.findById(session_id);

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Check if any background evaluations are still pending, and run them synchronously if so
        let hasModified = false;
        for (let i = 0; i < session.questions.length; i++) {
            const q = session.questions[i];
            if (q.response?.analysis?.processing) {
                try {
                    const faceParams = q.response.faceMetrics || {};
                    const voiceParams = q.response.voiceMetrics || {};
                    const mlMetrics = {
                        emotion: faceParams.expression || 'neutral',
                        eyeContact: (faceParams.eye_contact === 'looking at camera') ? 'High' : (faceParams.eye_contact === 'looking away' ? 'Low' : 'Moderate'),
                        posture: faceParams.head_pose || 'centered',
                        voiceTone: voiceParams.tone || 'neutral'
                    };

                    console.log(`[SessionFeedback] Synchronously generating feedback for pending question: "${q.question_text.substring(0, 30)}..."`);
                    const feedback = await generateFeedback(
                        q.question_text,
                        q.response.transcript,
                        session.domain,
                        session.experienceLevel,
                        mlMetrics
                    );

                    q.response.analysis = {
                        clarityScore: feedback.score,
                        confidenceScore: 0.9,
                        technicalAccuracy: feedback.score / 100,
                        sentiment: faceParams.expression || 'neutral',
                        emotion: faceParams.expression || 'neutral',
                        eyeContact: faceParams.eye_contact === 'looking at camera' ? 1.0 : (faceParams.eye_contact === 'looking away' ? 0.3 : 0.7),
                        posture: faceParams.head_pose || 'centered',
                        ...feedback,
                        processing: false
                    };
                    hasModified = true;
                } catch (e) {
                    console.error('[SessionFeedback Sync Error]:', e);
                    q.response.analysis.processing = false;
                    hasModified = true;
                }
            }
        }
        if (hasModified) {
            session.markModified('questions');
            await session.save();
        }

        const scores = session.questions.map(q => q.response.analysis.clarityScore || 0);
        const avgScore = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);

        // Aggregate ML visual metrics
        const eyeContactScores = session.questions.map(q => q.response.analysis.eyeContact || 0);
        const avgEyeContact = eyeContactScores.length > 0
            ? eyeContactScores.reduce((a, b) => a + b, 0) / eyeContactScores.length
            : 0;

        // Find most frequent expression
        const expressions = session.questions.map(q => q.response.analysis.emotion).filter(Boolean);
        const expressionCounts = expressions.reduce((acc, exp) => {
            acc[exp] = (acc[exp] || 0) + 1;
            return acc;
        }, {});
        const primaryExpression = Object.keys(expressionCounts).sort((a, b) => expressionCounts[b] - expressionCounts[a])[0] || 'neutral';


        // Group strengths / weak areas by avatar
        const strengthsByAvatar = { hr: [], technical: [], team_lead: [] };
        const weakAreasByAvatar = { hr: [], technical: [], team_lead: [] };

        session.questions.forEach(q => {
            const avatar = q.avatar_id || 'hr';
            (q.response.analysis.strengths || []).forEach(s => {
                if (strengthsByAvatar[avatar]) strengthsByAvatar[avatar].push(s);
            });
            (q.response.analysis.improvements || []).forEach(s => {
                if (weakAreasByAvatar[avatar]) weakAreasByAvatar[avatar].push(s);
            });
        });

        // Deduplicate per avatar
        Object.keys(strengthsByAvatar).forEach(k => {
            strengthsByAvatar[k] = [...new Set(strengthsByAvatar[k])].slice(0, 4);
            weakAreasByAvatar[k] = [...new Set(weakAreasByAvatar[k])].slice(0, 4);
        });

        const allStrengths = session.questions.flatMap(q => q.response.analysis.strengths || []);
        const allImprovements = session.questions.flatMap(q => q.response.analysis.improvements || []);

        const recommendation =
            avgScore >= 75 ? '✅ Strong Hire' :
                avgScore >= 55 ? '🟡 Potential Hire — Needs Development' :
                    '❌ Not Recommended at This Time';

        const feedback = {
            totalQuestions: session.questions.length,
            overallScore: Math.round(avgScore),
            hiring_recommendation: recommendation,
            overall_summary: `The candidate completed ${session.questions.length} interview questions across HR, Technical, and Team Lead rounds for a ${session.domain} role at ${session.experienceLevel} level.`,

            // New ML Metrics
            visual_metrics: {
                averageEyeContact: Math.round(avgEyeContact * 100) + '%',
                primaryExpression: primaryExpression,
            },

            strengths: [...new Set(allStrengths)].slice(0, 5),
            improvements: [...new Set(allImprovements)].slice(0, 5),
            strengths_by_avatar: strengthsByAvatar,
            weak_areas_by_avatar: weakAreasByAvatar,
            questions: session.questions,
        };

        res.status(200).json(feedback);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ─── Standalone Question Generator Endpoint ──────────────────────────────────
// GET /api/session/generate_question?role=hr&domain=aiml&difficulty=Mid

const generateQuestionEndpoint = async (req, res) => {
    try {
        const { role = 'hr', domain = 'fullstack', difficulty = 'Mid' } = req.query;

        const validRoles = ['hr', 'technical', 'team_lead'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
        }

        const question = await generateQuestion(role, domain, difficulty, [], 0);
        res.status(200).json({ question, role, domain, difficulty });
    } catch (error) {
        console.error('Generate Question Endpoint Error:', error);
        res.status(500).json({ error: 'Failed to generate question' });
    }
};

module.exports = {
    initSession,
    saveResponse,
    nextQuestion,
    endSession,
    getSessionFeedback,
    generateQuestionEndpoint,
};
