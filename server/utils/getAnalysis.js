const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

function sanitize(str) {
    return str.normalize("NFKD").replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '');
}

function truncate(str, maxLength = 3000) {
    return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
}

async function getAnalysis(jobDescription, resumeText, mode = "recruiter") {
    jobDescription = sanitize(truncate(jobDescription));
    resumeText = sanitize(truncate(resumeText));

    let prompt;

    if (mode === "candidate") {
        prompt = `
You are a helpful AI that evaluates resumes to help job applicants improve them.

ONLY respond with VALID JSON in this format:
{ "score": <number>, "explanation": "<string>" }

Score how well the resume matches the job description, and explain how the applicant can improve.

Job Description:
${jobDescription}

Resume:
${resumeText}
`;
    } else {
        prompt = `
You are a resume evaluator AI acting as a recruiter.

ONLY respond with VALID JSON in this format:
{ "score": <number>, "explanation": "<string>" }

Evaluate how well the resume fits the job description.

Job Description:
${jobDescription}

Resume:
${resumeText}
`;
    }

    try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`
            },
            body: JSON.stringify({
                model: "mistralai/mistral-7b-instruct",
                messages: [
                    { role: "system", content: "You are a resume evaluator AI. ONLY respond with valid JSON." },
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await res.json();
        const rawResponse = data.choices?.[0]?.message?.content || "";

        try {
            const parsed = JSON.parse(rawResponse);
            validateParsed(parsed);
            return parsed;
        } catch (e) {
            const cleaned = rawResponse
                .replace(/[\u0000-\u001F]+/g, ' ')
                .replace(/\\"/g, '"')
                .replace(/\\n/g, ' ')
                .replace(/[\r\n]+/g, ' ');

            const parsedCleaned = JSON.parse(cleaned);
            validateParsed(parsedCleaned);
            return parsedCleaned;
        }
    } catch (err) {
        console.error("❌ Failed to fetch or parse OpenRouter response:", err.message);
        return {
            score: 0,
            explanation: "Error fetching analysis from language model."
        };
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
