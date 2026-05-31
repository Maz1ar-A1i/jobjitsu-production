module.paths.push('./server/node_modules');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'server/.env' });

const API_URL = 'http://localhost:5000/api/session';
const SECRET = process.env.JWT_SECRET;

// ─── Test: Standalone /generate_question endpoint ─────────────────────────────
async function testGenerateQuestionEndpoint() {
    console.log('\n═══════════════════════════════════════════');
    console.log('Testing GET /generate_question endpoint...');
    console.log('═══════════════════════════════════════════');

    const testCases = [
        { role: 'hr', domain: 'Java Developer', difficulty: 'Junior' },
        { role: 'technical', domain: 'Full Stack Developer', difficulty: 'Mid' },
        { role: 'team_lead', domain: 'AI / ML Engineer', difficulty: 'Senior' },
    ];

    for (const tc of testCases) {
        const params = new URLSearchParams(tc).toString();
        const res = await fetch(`${API_URL}/generate_question?${params}`);
        const data = await res.json();

        if (!res.ok || !data.question) {
            console.error(`  ❌ FAILED [${tc.role} / ${tc.domain} / ${tc.difficulty}]:`, data);
        } else {
            console.log(`\n  ✅ [${tc.role.toUpperCase()} | ${tc.domain} | ${tc.difficulty}]`);
            console.log(`     "${data.question}"`);
        }
    }
}

async function runTest() {
    console.log("Starting Session API Test...");

    // Test the new standalone endpoint first
    await testGenerateQuestionEndpoint();

    // 1. Generate Token
    if (!SECRET) {
        console.error("JWT_SECRET missing!");
        process.exit(1);
    }
    const token = jwt.sign({ id: "507f1f77bcf86cd799439011" }, SECRET, { expiresIn: '1h' });
    console.log("Token generated.");

    // 2. Init Session
    try {
        console.log("\n--- Testing /init ---");
        const initRes = await fetch(`${API_URL}/init`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ domain: 'Java Developer', experienceLevel: 'Junior' })
        });

        if (!initRes.ok) {
            const text = await initRes.text();
            throw new Error(`Server Error (${initRes.status}): ${text}`);
        }

        const initData = await initRes.json();
        console.log("Session Initialized:", initData.session_id);
        const sessionId = initData.session_id;

        // 3. Save Response
        console.log("\n--- Testing /response ---");
        const respRes = await fetch(`${API_URL}/response`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
                session_id: sessionId,
                avatar_id: 'hr',
                question_text: 'Tell me about yourself.',
                response_data: {
                    audioUrl: 'mock.mp3',
                    transcript: 'I am a Java Developer.',
                    durationSeconds: 5,
                    faceMetrics: {
                        expression: 'smile',
                        eye_contact: 'looking at camera',
                        head_pose: 'centered'
                    }
                }
            })
        });
        const respData = await respRes.json();
        if (!respRes.ok) throw new Error(respData.message);
        console.log("Response Saved. Analysis:", respData.analysis);

        // 4. End Session
        console.log("\n--- Testing /end ---");
        const endRes = await fetch(`${API_URL}/end`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ session_id: sessionId })
        });
        const endData = await endRes.json();
        if (!endRes.ok) throw new Error(endData.message);
        console.log("Session Ended:", endData.message);

        // 5. Get Feedback
        console.log("\n--- Testing /feedback ---");
        const feedRes = await fetch(`${API_URL}/${sessionId}/feedback`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const feedData = await feedRes.json();
        if (!feedRes.ok) throw new Error(feedData.message);
        console.log("Feedback Retrieved:", feedData.overallScore);

        console.log("\nAll tests passed!");

    } catch (error) {
        console.error("Test Failed:", error);
    }
}

runTest();
