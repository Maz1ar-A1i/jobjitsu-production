const Session = require('../models/sessionModel');

/**
 * GET /api/dashboard/stats
 * Aggregates all session data for the currently logged-in user.
 */
const getDashboardStats = async (req, res) => {
    try {
        const user_id = req.userId;
        console.log(`[DEBUG] getDashboardStats called for user: ${user_id}`);
        if (!user_id) return res.status(401).json({ message: 'Unauthorized' });

        const sessions = await Session.find({ user_id, status: 'completed' })
            .sort({ endTime: -1 })
            .lean();

        // ─── 1. Quick Stats ──────────────────────────────────────
        const totalSessions = sessions.length;

        const allScores = sessions.flatMap(s =>
            s.questions.map(q => q.response?.analysis?.clarityScore || 0)
        );
        const avgScore = allScores.length
            ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
            : 0;
        const bestScore = allScores.length ? Math.max(...allScores) : 0;

        // Practice streak: consecutive days (backwards from today) with at least 1 session
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const sessionDates = new Set(
            sessions.map(s => {
                const d = new Date(s.endTime || s.createdAt);
                d.setHours(0, 0, 0, 0);
                return d.toISOString();
            })
        );
        let streak = 0;
        for (let i = 0; i < 365; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(checkDate.getDate() - i);
            if (sessionDates.has(checkDate.toISOString())) {
                streak++;
            } else if (i > 0) {
                break; // don't break on today if no session yet today
            }
        }

        // ─── 2. Daily Progress (last 30 days) ───────────────────
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const dailyMap = {};
        sessions.forEach(s => {
            const date = new Date(s.endTime || s.createdAt);
            if (date >= thirtyDaysAgo) {
                const key = date.toISOString().split('T')[0];
                const scores = s.questions.map(q => q.response?.analysis?.clarityScore || 0);
                const sessionAvg = scores.length
                    ? scores.reduce((a, b) => a + b, 0) / scores.length
                    : 0;
                if (!dailyMap[key]) {
                    dailyMap[key] = { total: 0, count: 0 };
                }
                dailyMap[key].total += sessionAvg;
                dailyMap[key].count += 1;
            }
        });

        const dailyProgress = Object.entries(dailyMap)
            .map(([date, { total, count }]) => ({
                date,
                score: Math.round(total / count),
                sessions: count,
            }))
            .sort((a, b) => a.date.localeCompare(b.date));

        // ─── 3. Skill Radar ─────────────────────────────────────
        const skillTotals = {
            communication: 0,
            technical: 0,
            confidence: 0,
            eyeContact: 0,
            bodyLanguage: 0,
            emotionalControl: 0,
        };
        let questionCount = 0;

        sessions.forEach(s => {
            s.questions.forEach(q => {
                const a = q.response?.analysis;
                if (!a) return;
                questionCount++;
                skillTotals.communication += (a.clarityScore || 0);
                skillTotals.technical += ((a.technicalAccuracy || 0) * 100);
                skillTotals.confidence += ((a.confidenceScore || 0) * 100);
                skillTotals.eyeContact += ((a.eyeContact || 0) * 100);
                // Map posture string to a score
                const postureMap = { centered: 90, tilted: 60, slouching: 30 };
                skillTotals.bodyLanguage += (postureMap[a.posture] || 50);
                // Map sentiment to score
                const sentimentMap = { happy: 95, neutral: 70, sad: 40, angry: 30, surprised: 60, fear: 35, disgust: 25 };
                skillTotals.emotionalControl += (sentimentMap[a.emotion] || 50);
            });
        });

        const safeDiv = (val) => questionCount ? Math.round(val / questionCount) : 0;
        const skillRadar = [
            { skill: 'Communication', value: safeDiv(skillTotals.communication) },
            { skill: 'Technical', value: safeDiv(skillTotals.technical) },
            { skill: 'Confidence', value: safeDiv(skillTotals.confidence) },
            { skill: 'Eye Contact', value: safeDiv(skillTotals.eyeContact) },
            { skill: 'Body Language', value: safeDiv(skillTotals.bodyLanguage) },
            { skill: 'Emotional Control', value: safeDiv(skillTotals.emotionalControl) },
        ];

        // ─── 4. Strengths & Improvements ────────────────────────
        const allStrengths = sessions.flatMap(s =>
            s.questions.flatMap(q => q.response?.analysis?.strengths || [])
        );
        const allImprovements = sessions.flatMap(s =>
            s.questions.flatMap(q => q.response?.analysis?.improvements || [])
        );

        // Count frequency and return top 5
        const topItems = (arr, limit = 5) => {
            const counts = {};
            arr.forEach(item => { counts[item] = (counts[item] || 0) + 1; });
            return Object.entries(counts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, limit)
                .map(([text, count]) => ({ text, count }));
        };

        // ─── 5. Recent Sessions ─────────────────────────────────
        const recentSessions = sessions.slice(0, 5).map(s => {
            const scores = s.questions.map(q => q.response?.analysis?.clarityScore || 0);
            const sessionAvg = scores.length
                ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
                : 0;
            return {
                id: s._id,
                domain: s.domain,
                experienceLevel: s.experienceLevel,
                date: s.endTime || s.createdAt,
                questionCount: s.questions.length,
                avgScore: sessionAvg,
                status: s.status,
            };
        });

        // ─── 6. Most practiced domains (for job suggestions) ────
        const domainCounts = {};
        sessions.forEach(s => {
            const d = (s.domain || 'general').toLowerCase();
            domainCounts[d] = (domainCounts[d] || 0) + 1;
        });
        const topDomains = Object.entries(domainCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([domain]) => domain);

        // ─── Response ───────────────────────────────────────────
        res.status(200).json({
            quickStats: {
                totalSessions,
                avgScore,
                bestScore,
                streak,
            },
            dailyProgress,
            skillRadar,
            strengths: topItems(allStrengths),
            improvements: topItems(allImprovements),
            recentSessions,
            topDomains,
        });
    } catch (error) {
        console.error('Dashboard Stats Error:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats };
