const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'abandoned'],
        default: 'active'
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    domain: {
        type: String,
        required: true
    },
    experienceLevel: {
        type: String,
        required: true
    },
    questions: [{
        avatar_id: {
            type: String,
            enum: ['hr', 'technical', 'team_lead'],
            required: true
        },
        question_text: {
            type: String,
            required: true
        },
        askedAt: {
            type: Date,
            default: Date.now
        },
        response: {
            audioUrl: String,
            transcript: String,
            durationSeconds: Number,
            respondedAt: Date,
            analysis: {
                clarityScore: Number,
                confidenceScore: Number,
                fillerWordCount: Number,
                sentiment: String,
                emotion: String,
                posture: String,
                eyeContact: Number,
                bodyLanguage: String,
                technicalAccuracy: Number,
                feedback: String,
                score: Number,
                strengths: [String],
                improvements: [String]
            }
        }
    }],
    metadata: {
        userAgent: String,
        ipAddress: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
