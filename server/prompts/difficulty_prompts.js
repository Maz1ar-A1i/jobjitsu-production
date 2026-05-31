/**
 * DIFFICULTY_PROMPTS
 * Controls the complexity level of interview questions.
 * Keys match the experienceLevel values used throughout the app.
 */
const DIFFICULTY_PROMPTS = {
    Junior: "Ask beginner-level questions suitable for fresh graduates with 0–1 years of experience. Questions should test foundational concepts and basic practical knowledge.",
    Mid: "Ask intermediate-level questions suitable for candidates with 2–4 years of experience. Questions should require practical hands-on knowledge and some depth.",
    Senior: "Ask advanced, senior-level questions suitable for candidates with 5+ years of experience. Questions should probe architectural thinking, trade-offs, and real-world production experience.",

    // Aliases for flexibility
    Easy: "Ask beginner-level questions suitable for fresh graduates with 0–1 years of experience. Keep it simple and foundational.",
    Medium: "Ask intermediate-level questions requiring some practical experience and depth.",
    Hard: "Ask advanced, expert-level questions that test deep architectural and production-grade knowledge.",
};

module.exports = { DIFFICULTY_PROMPTS };
