/**
 * interview_manager.js
 * Central service: assembles prompts from role/domain/difficulty modules,
 * injects conversation history for deduplication, and calls Cohere LLM.
 *
 * v2 — Conversational interview engine with skill assessment and
 *       context-aware follow-up logic.
 */
const { CohereClient } = require('cohere-ai');
const { ROLE_PROMPTS } = require('../prompts/role_prompts');
const { DOMAIN_PROMPTS, normalizeDomain } = require('../prompts/domain_prompts');
const { DIFFICULTY_PROMPTS } = require('../prompts/difficulty_prompts');
const dataset = require('../data/questions.json');

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
});

/**
 * Helper to pick a question from the dataset based on history and role.
 */
const getDatasetQuestion = (askedQuestions = []) => {
    const allQuestions = dataset.flatMap(cat => cat.questions);
    const available = allQuestions.filter(q => !askedQuestions.includes(q));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
};

/**
 * Summarize the conversation history into a compact context block.
 * This keeps the context window efficient while preserving key information.
 */
const summarizeHistory = (history = []) => {
    if (!history || history.length === 0) return '';

    // For short histories, include full detail
    if (history.length <= 4) {
        return history.map((h, i) =>
            `[Q${i + 1}] (${h.avatar_id || 'interviewer'}): "${h.question}"\n   Candidate: "${h.answer}"`
        ).join('\n\n');
    }

    // For longer histories, summarize older entries, keep last 3 in full detail
    const older = history.slice(0, -3);
    const recent = history.slice(-3);

    const olderSummary = older.map((h, i) =>
        `[Q${i + 1}] ${h.avatar_id}: Asked about "${h.question.substring(0, 60)}..." → Candidate responded ${h.answer.length > 30 ? 'with a detailed answer' : 'briefly'}.`
    ).join('\n');

    const recentDetail = recent.map((h, i) =>
        `[Q${older.length + i + 1}] (${h.avatar_id || 'interviewer'}): "${h.question}"\n   Candidate: "${h.answer}"`
    ).join('\n\n');

    return `--- Earlier in the interview (summary) ---\n${olderSummary}\n\n--- Recent exchanges (full detail) ---\n${recentDetail}`;
};

/**
 * Build the full LLM prompt for generating the next interview question.
 *
 * @param {string} role       - 'hr' | 'technical' | 'team_lead'
 * @param {string} domain     - Any domain string (normalized internally)
 * @param {string} difficulty - 'Junior' | 'Mid' | 'Senior' | 'Easy' | 'Medium' | 'Hard'
 * @param {Array}  history    - Array of { question, answer, avatar_id } objects from past turns
 * @param {number} questionCount - How many questions this avatar has asked so far (0-based)
 * @returns {string} Fully assembled prompt string
 */
const generatePrompt = (role, domain, difficulty, history = [], questionCount = 0) => {
    const normalizedDomain = normalizeDomain(domain);

    const rolePrompt = ROLE_PROMPTS[role] || ROLE_PROMPTS.hr;
    const domainPrompt = DOMAIN_PROMPTS[normalizedDomain] || DOMAIN_PROMPTS[domain] || DOMAIN_PROMPTS.fullstack;
    const difficultyPrompt = DIFFICULTY_PROMPTS[difficulty] || DIFFICULTY_PROMPTS.Mid;

    const historyContext = summarizeHistory(history);
    const lastInteraction = history.length > 0 ? history[history.length - 1] : null;

    // Build follow-up analysis context
    let followUpContext = '';
    if (lastInteraction) {
        const answerLength = (lastInteraction.answer || '').trim().length;
        const isShortAnswer = answerLength < 80;
        const isEmptyAnswer = answerLength < 15 || lastInteraction.answer.includes('No answer provided');

        followUpContext = `
CANDIDATE'S LAST ANSWER ANALYSIS:
- Question asked: "${lastInteraction.question}"
- Answer: "${lastInteraction.answer}"
- Answer depth: ${isEmptyAnswer ? 'EMPTY/SKIPPED — the candidate did not answer. Move to a different topic.' : isShortAnswer ? 'BRIEF — probe deeper with a follow-up' : 'SUBSTANTIAL — you may follow up on an interesting point or move to a new topic'}
- Asked by: ${lastInteraction.avatar_id || 'previous interviewer'}
`;
    }

    return `${rolePrompt}

${domainPrompt}

DIFFICULTY LEVEL: ${difficultyPrompt}

FULL INTERVIEW HISTORY:
${historyContext || '(This is the start of the interview — no history yet.)'}

${followUpContext}

This is question #${questionCount + 1} in your section of the interview.

YOUR TASK:
Generate the next interview question. Follow these rules:

1. CONVERSATIONAL FLOW: Your question should feel like a natural continuation of the conversation. Reference the candidate's previous answers when relevant.

2. FOLLOW-UP vs NEW TOPIC:
   - If the candidate's last answer was brief, vague, or incomplete → ask a probing follow-up that digs deeper into the same topic.
   - If the candidate's last answer was strong and detailed → acknowledge briefly (1–3 words max like "Good" or "I see") then transition to a NEW topic.
   - If the candidate skipped or gave no answer → move to an entirely different, easier topic.

3. SKILL ASSESSMENT: For technical and team lead rounds, probe specific skills from the domain. Test practical knowledge, not just theory. Ask scenario-based questions ("How would you...", "Walk me through...", "What would you do if...").

4. AVOID REPETITION: Never repeat a question that has already been asked in the interview history. Check the full history above.

5. FORMAT: Output ONLY the question text. Do not include any prefix, label, numbering, or explanation. Just the question itself, spoken naturally as an interviewer would say it.

6. LENGTH: Keep it concise — 1 to 3 sentences maximum. Sound human, not like a textbook.`;
};

/**
 * Generate a single interview question using the Cohere LLM.
 *
 * @param {string} role       - 'hr' | 'technical' | 'team_lead'
 * @param {string} domain     - Candidate role/domain (any format)
 * @param {string} difficulty - Experience level
 * @param {Array}  history    - Past Q&A history for context and deduplication
 * @param {number} questionCount - Questions asked by this avatar so far
 * @returns {Promise<string>} The generated question
 */
const generateQuestion = async (role, domain, difficulty, history = [], questionCount = 0) => {
    // For the very first question of the entire interview, use a warm opener
    if (history.length === 0 && questionCount === 0) {
        const introCat = dataset.find(cat => cat.category === 'introduction');
        if (introCat) return introCat.questions[0]; // "Tell me about yourself."
        return "Tell me about yourself and what brings you here today.";
    }

    const prompt = generatePrompt(role, domain, difficulty, history, questionCount);

    try {
        const response = await cohere.chat({
            message: prompt,
            model: 'command-r-08-2024',
            temperature: 0.4, // Lower temp for more focused, relevant questions
        });

        let result = response.text.trim();

        // Clean up any unwanted prefixes the LLM might add
        result = result
            .replace(/^(Question\s*\d*\s*[:.]?\s*)/i, '')
            .replace(/^(Q\d+\s*[:.]?\s*)/i, '')
            .replace(/^(Here'?s?\s*(my|the|your)\s*(next\s*)?question\s*[:.]?\s*)/i, '')
            .replace(/^(Sure[,!.]?\s*)/i, '')
            .replace(/^(Okay[,.]?\s*)/i, '')
            .trim();

        // Remove surrounding quotes if the LLM wrapped the question
        if ((result.startsWith('"') && result.endsWith('"')) ||
            (result.startsWith("'") && result.endsWith("'"))) {
            result = result.slice(1, -1).trim();
        }

        // If the result is too long (LLM went off-script), truncate to first question
        if (result.length > 300) {
            const firstQuestion = result.split(/[.?!]\s/)[0];
            if (firstQuestion) result = firstQuestion + (firstQuestion.endsWith('?') ? '' : '?');
        }

        // Fallback if result is empty or nonsensical
        if (!result || result.length < 10) {
            const asked = history.map(h => h.question);
            return getDatasetQuestion(asked) || `Can you tell me more about your experience with ${domain}?`;
        }

        return result;
    } catch (error) {
        console.error('[InterviewManager] Question generation error:', error.message);
        const asked = history.map(h => h.question);
        return getDatasetQuestion(asked) || "Can you tell me more about your most recent project experience?";
    }
};

/**
 * Generate structured feedback for a candidate's answer using the Cohere LLM.
 *
 * @param {string} question   - The question that was asked
 * @param {string} answer     - The candidate's answer/transcript
 * @param {string} domain     - Candidate's domain
 * @param {string} difficulty - Experience level
 * @param {Object} mlMetrics  - Per-question ML metrics (e.g. eye contact, emotion)
 * @returns {Promise<Object>} Structured feedback: { feedback, score, strengths, improvements }
 */
const generateFeedback = async (question, answer, domain, difficulty, mlMetrics = {}) => {

    // Handle empty/skipped answers
    const trimmed = (answer || '').trim();
    const isEmptyAnswer = !answer
        || trimmed.length < 10
        || trimmed.includes('No answer provided')
        || trimmed.includes('No audible response detected')
        || trimmed === '(No answer provided)';

    if (isEmptyAnswer) {
        return {
            feedback: 'The candidate did not provide an answer to this question.',
            score: 0,
            strengths: [],
            improvements: ['Provide a clear, structured answer', 'Use specific examples from experience'],
        };
    }

    // Convert ML metrics into a textual description for the LLM
    let mlContext = '';
    if (Object.keys(mlMetrics).length > 0) {
        mlContext = `
ML Visual & Vocal Analysis of Candidate during this answer:
- Primary Emotion: ${mlMetrics.emotion || 'neutral'}
- Eye Contact: ${mlMetrics.eyeContact}
- Head Posture: ${mlMetrics.posture}
- Voice Tone: ${mlMetrics.voiceTone || 'neutral'}
`;
    }

    const prompt = `You are an expert interviewer evaluating a ${difficulty}-level ${domain} candidate.

Question: "${question}"
Candidate Answer: "${answer}"
${mlContext}
Analyze this response strictly and objectively.
If the ML Analysis shows poor eye contact, negative emotions (like confusion), or poor voice tone, gently mention it in your feedback.

Return a JSON object with this exact structure:
{
    "feedback": "A short, constructive critique (max 2 sentences). Focus on what was missing or what was good.",
    "score": <integer 1–100 based on quality, depth, and relevance>,
    "strengths": ["Key strength 1", "Key strength 2"],
    "improvements": ["Specific improvement 1", "Specific improvement 2"]
}

Return ONLY the raw JSON. Do not add markdown formatting, code fences, or explanatory text.`;

    try {
        const response = await cohere.chat({
            message: prompt,
            model: 'command-r-08-2024',
            temperature: 0.3,
        });

        let text = response.text.trim();
        // Strip markdown code fences if present
        text = text.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '');

        return JSON.parse(text);
    } catch (error) {
        console.error('[InterviewManager] Feedback generation error:', error.message);
        return {
            feedback: 'Response recorded. Keep working on providing more detailed and structured answers.',
            score: 50,
            strengths: ['Attempted to answer the question'],
            improvements: ['Add more specific examples', 'Provide deeper technical detail'],
        };
    }
};

module.exports = { generatePrompt, generateQuestion, generateFeedback };
