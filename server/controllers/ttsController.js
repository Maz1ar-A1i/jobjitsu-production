const sdk = require("microsoft-cognitiveservices-speech-sdk");

const generateAudio = async (req, res) => {
    try {
        const { text, avatar_id } = req.body;

        // Use environment variable for Azure Speech Services Key
        const apiKey = process.env.AZURE_TTS_KEY;
        const region = process.env.AZURE_TTS_REGION || "eastus";

        if (!apiKey) {
            console.error("Speech synthesis failed: AZURE_TTS_KEY is not configured.");
            return res.status(500).json({ message: "Speech synthesis failed: AZURE_TTS_KEY is missing." });
        }


        const speechConfig = sdk.SpeechConfig.fromSubscription(apiKey, region);
        speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

        // Map Avatar ID to an appropriate Azure Voice
        let voiceName = "en-US-JennyNeural"; // Default female voice for HR
        if (avatar_id === 'technical') voiceName = "en-US-DavisNeural"; // Male voice for Tech
        else if (avatar_id === 'team_lead') voiceName = "en-US-GuyNeural"; // Male voice for Team Lead

        speechConfig.speechSynthesisVoiceName = voiceName;

        // We do not need an output audio file; we'll stream to memory
        let synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);
        let visemes = [];

        // Azure provides visemes as an event
        synthesizer.visemeReceived = function (s, e) {
            visemes.push({
                audioOffsetMs: e.audioOffset / 10000, // Convert ticks (100 nanoseconds) to ms
                visemeId: e.visemeId
            });
        };

        // Construct SSML to ensure visemes and proper neural voice formatting are respected
        const ssml = `
<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="http://www.w3.org/2001/mstts" xml:lang="en-US">
    <voice name="${voiceName}">
        ${text}
    </voice>
</speak>`;

        synthesizer.speakSsmlAsync(
            ssml,
            function (result) {
                if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                    const audioBuffer = Buffer.from(result.audioData);
                    res.status(200).json({
                        audioBase64: audioBuffer.toString('base64'),
                        visemes: visemes
                    });
                } else {
                    console.error("Speech synthesis canceled, " + result.errorDetails);
                    res.status(500).json({ message: "Speech synthesis failed: " + result.errorDetails });
                }
                synthesizer.close();
                synthesizer = null;
            },
            function (err) {
                console.error("Synthesis error - " + err);
                synthesizer.close();
                synthesizer = null;
                res.status(500).json({ message: err });
            }
        );

    } catch (error) {
        console.error("Generate Audio Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { generateAudio };
