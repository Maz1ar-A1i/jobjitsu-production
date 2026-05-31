const { CohereClient } = require("cohere-ai");
const fs = require('fs');
const pdf = require('pdf-parse');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
});

exports.chat = async (req, res) => {
    try {
        const { message } = req.body;
        console.log("AI Chat Request received:", message);

        if (!process.env.COHERE_API_KEY) {
            console.error("Missing API Key");
            return res.status(500).json({ error: "COHERE_API_KEY not configured on server" });
        }

        const response = await cohere.chat({
            message: message,
            model: "command-r-08-2024",
        });

        const text = response.text;
        console.log("AI Response generated successfully");
        res.json({ reply: text });
    } catch (error) {
        console.error("AI Chat Error Detailed:", error);
        res.status(500).json({ error: "Failed to generate response. Ensure API Key is valid." });
    }
};

exports.analyzeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        let text = "";
        if (req.file.mimetype === 'application/pdf') {
            const dataBuffer = fs.readFileSync(req.file.path);
            const data = await pdf(dataBuffer);
            text = data.text;
        } else {
            // Fallback for text files
            text = fs.readFileSync(req.file.path, 'utf8');
        }

        // Cleanup uploaded file
        try {
            fs.unlinkSync(req.file.path);
        } catch (e) { console.warn("Failed to delete temp file", e); }

        const prompt = `You are an expert ATS (Applicant Tracking System) resume analyst and career coach.

Analyze the following resume and respond with ONLY a valid JSON object (no markdown code fences, no extra text) in this exact format:
{
  "atsScore": <integer from 0 to 100>,
  "scoreBreakdown": {
    "formatting": <integer 0-25, score for clean ATS-friendly formatting>,
    "keywords": <integer 0-25, score for relevant keywords and skills>,
    "experience": <integer 0-25, score for experience clarity and impact>,
    "completeness": <integer 0-25, score for resume completeness>
  },
  "analysis": "<full markdown analysis with ## headers, bullet points, strengths, weaknesses, and specific improvement suggestions>"
}

Resume Content:
${text}`;

        const response = await cohere.chat({
            message: prompt,
            model: "command-r-08-2024",
        });

        let rawText = response.text.trim();

        let atsScore = null;
        let scoreBreakdown = null;
        let analysis = null;

        // Bulletproof JSON extraction from LLM response
        let parsed = null;
        try {
            parsed = JSON.parse(rawText);
        } catch (e) {
            // Try extracting code block contents
            const codeBlockMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
            if (codeBlockMatch) {
                try {
                    parsed = JSON.parse(codeBlockMatch[1].trim());
                } catch (e2) {}
            }
            if (!parsed) {
                // Try finding between first { and last }
                const firstBrace = rawText.indexOf('{');
                const lastBrace = rawText.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    const potentialJson = rawText.substring(firstBrace, lastBrace + 1);
                    try {
                        parsed = JSON.parse(potentialJson);
                    } catch (e3) {}
                }
            }
        }

        if (parsed) {
            // Extracted successfully
            atsScore = parsed.atsScore !== undefined ? parseInt(parsed.atsScore, 10) : null;
            if (parsed.scoreBreakdown) {
                scoreBreakdown = {
                    formatting: parseInt(parsed.scoreBreakdown.formatting, 10) || 0,
                    keywords: parseInt(parsed.scoreBreakdown.keywords, 10) || 0,
                    experience: parseInt(parsed.scoreBreakdown.experience, 10) || 0,
                    completeness: parseInt(parsed.scoreBreakdown.completeness, 10) || 0
                };
            }
            analysis = parsed.analysis || null;
        } else {
            console.warn("[Resume Analysis] Failed to parse any JSON from LLM response. Raw response was:", rawText);
        }

        // Fallbacks if LLM omitted fields or returned invalid structure
        if (atsScore === null || isNaN(atsScore)) {
            // Try fallback regex on raw text
            const scoreMatch = rawText.match(/"atsScore"\s*:\s*(\d+)/);
            if (scoreMatch) {
                atsScore = Math.min(100, Math.max(0, parseInt(scoreMatch[1], 10)));
            } else if (scoreBreakdown) {
                atsScore = (scoreBreakdown.formatting + scoreBreakdown.keywords + scoreBreakdown.experience + scoreBreakdown.completeness);
            } else {
                atsScore = 75; // Reasonable default
            }
        } else {
            atsScore = Math.min(100, Math.max(0, atsScore));
        }

        if (!scoreBreakdown) {
            // Synthesize a breakdown if missing
            scoreBreakdown = {
                formatting: Math.round(atsScore * 0.25),
                keywords: Math.round(atsScore * 0.25),
                experience: Math.round(atsScore * 0.25),
                completeness: Math.round(atsScore * 0.25)
            };
        }

        if (!analysis) {
            // If the model returned plain text instead of JSON
            analysis = rawText;
        }

        res.json({ analysis, atsScore, scoreBreakdown });

    } catch (error) {
        console.error("Resume Analysis Error:", error);
        res.status(500).json({ error: "Failed to analyze resume" });
    }
};

exports.generateResume = async (req, res) => {
    try {
        const { personalInfo, education, experience, skills, summary } = req.body;

        // Helper to safely get array
        const expList = Array.isArray(experience) ? experience : [];
        const eduList = Array.isArray(education) ? education : [];
        const skillList = Array.isArray(skills) ? skills : (skills ? [skills] : []);

        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    // --- HEADER ---
                    new Paragraph({
                        text: personalInfo.name || "Your Name",
                        heading: HeadingLevel.TITLE,
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 },
                    }),
                    new Paragraph({
                        text: [
                            personalInfo.email,
                            personalInfo.phone,
                            personalInfo.address
                        ].filter(Boolean).join(" | "),
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 600 },
                    }),

                    // --- SUMMARY ---
                    ...(summary ? [
                        new Paragraph({
                            text: "PROFESSIONAL SUMMARY",
                            heading: HeadingLevel.HEADING_1,
                            thematicBreak: false, // Clean look for ATS
                            spacing: { before: 200, after: 100 },
                            border: { bottom: { color: "000000", space: 1, style: "single", size: 6 } }
                        }),
                        new Paragraph({
                            text: summary,
                            spacing: { after: 400 },
                        })
                    ] : []),

                    // --- EXPERIENCE ---
                    new Paragraph({
                        text: "WORK EXPERIENCE",
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 200, after: 100 },
                        border: { bottom: { color: "000000", space: 1, style: "single", size: 6 } }
                    }),
                    ...expList.map(exp => [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: exp.title,
                                    bold: true,
                                    size: 24, // 12pt
                                }),
                                new TextRun({
                                    text: `  |  ${exp.company}`,
                                    italics: true,
                                    size: 24,
                                })
                            ],
                            spacing: { before: 200, after: 0 },
                        }),
                        new Paragraph({
                            text: exp.description,
                            spacing: { after: 200 },
                        }),
                    ]).flat(),

                    // --- EDUCATION ---
                    new Paragraph({
                        text: "EDUCATION",
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 200, after: 100 },
                        border: { bottom: { color: "000000", space: 1, style: "single", size: 6 } }
                    }),
                    ...eduList.map(edu => [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: edu.degree,
                                    bold: true,
                                    size: 24,
                                }),
                                new TextRun({
                                    text: `  |  ${edu.institution}`,
                                    italics: true,
                                    size: 24,
                                }),
                                new TextRun({
                                    text: `  (${edu.year})`,
                                    size: 24,
                                }),
                            ],
                            spacing: { before: 100, after: 200 },
                        }),
                    ]).flat(),

                    // --- SKILLS ---
                    new Paragraph({
                        text: "KEY SKILLS",
                        heading: HeadingLevel.HEADING_1,
                        spacing: { before: 200, after: 100 },
                        border: { bottom: { color: "000000", space: 1, style: "single", size: 6 } }
                    }),
                    new Paragraph({
                        text: skillList.join(" • "),
                        spacing: { after: 200 },
                    }),
                ],
            }],
        });

        const b64 = await Packer.toBase64String(doc);
        res.json({ file: b64, filename: "Resumified_CV_ATO.docx" });

    } catch (error) {
        console.error("Resume Generation Error:", error);
        res.status(500).json({ error: "Failed to generate resume" });
    }
};
