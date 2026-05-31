const { CohereClient } = require("cohere-ai");
require('dotenv').config();

const cohere = new CohereClient({
    token: process.env.COHERE_API_KEY,
});

async function listModels() {
    try {
        const response = await cohere.models.list();
        console.log("Available Models:");
        response.models.forEach(m => {
            if (m.name.includes('command')) {
                console.log(`- ${m.name}`);
            }
        });
        // Also print all just in case
        console.log("All Models:", response.models.map(m => m.name).join(', '));
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
