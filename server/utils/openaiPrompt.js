const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

function sanitize(str) {
    return str
        .normalize("NFKD")                           // normalize weird Unicode
        .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '');   // strip non-printables
}

function truncate(str, maxLength = 3000) {
    return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
}

async function getAnalysis(jobDescription, resumeText, priority) {
    // Sanitize and truncate inputs to avoid long prompts
    jobDescription = sanitize(truncate(jobDescription));
    resumeText = sanitize(truncate(resumeText));

    const prompt = `
You are a resume evaluator AI.

ONLY respond with VALID JSON in the following format:
{ "score": <number>, "explanation": "<string>" }

Evaluate the resume against the job description.
Focus especially on this priority: "${priority}".

Job Description:
${jobDescription}

Resume:
${resumeText}
`;

    console.log("🧠 Sending prompt to Ollama...");

    let json;
    try {
        console.log(`📄 Resume text length: ${resumeText.length}`);
        const res = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "mistral", // ⬅️ use a fast model
                prompt,
                stream: false
            })
        });

        json = await res.json();
        console.log("📩 Ollama response:", json);
    } catch (err) {
        console.error("❌ Failed to fetch or parse response from Ollama:", err.message);
        return {
            score: 0,
            explanation: "Failed to connect to the language model or parse response."
        };
    }

    const rawResponse = json.response;

    try {
        const parsed = JSON.parse(rawResponse);
        validateParsed(parsed);
        return parsed;
    } catch (e1) {
        console.warn("⚠️ First JSON parse failed. Attempting cleanup...");

        const cleaned = rawResponse
            .replace(/[\u0000-\u001F]+/g, ' ')
            .replace(/\\"/g, '"')
            .replace(/\\n/g, ' ')
            .replace(/[\r\n]+/g, ' ');

        try {
            const parsedCleaned = JSON.parse(cleaned);
            validateParsed(parsedCleaned);
            return parsedCleaned;
        } catch (e2) {
            console.error("🧨 Still failed to parse cleaned JSON:", e2.message);
            return {
                score: 0,
                explanation: "Failed to parse JSON from model output."
            };
        }
    }
}

function validateParsed(parsed) {
    if (
        typeof parsed !== 'object' ||
        typeof parsed.score !== 'number' ||
        typeof parsed.explanation !== 'string'
    ) {
        throw new Error("Parsed JSON is missing required fields.");
    }
}

module.exports = { getAnalysis };
