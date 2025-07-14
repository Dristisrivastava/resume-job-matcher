const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { getAnalysis } = require('../utils/openaiPrompt');

const router = express.Router();
const upload = multer();

router.post('/', upload.single('resume'), async (req, res) => {
    console.log("📥 Request received at /api/analyze");

    const { jobDescription } = req.body;
    const resumeBuffer = req.file?.buffer;

    if (!resumeBuffer) {
        console.error("❌ No file received");
        return res.status(400).json({ error: "No resume file provided." });
    }

    try {
        const pdfText = (await pdfParse(resumeBuffer)).text;
        console.log("📝 Extracted resume text:", pdfText.slice(0, 100) + "...");

        const { score, explanation } = await getAnalysis(jobDescription, pdfText);
        console.log("✅ Analysis complete:", score, explanation.slice(0, 80) + "...");

        res.json({ score, explanation });
    } catch (err) {
        console.error("❌ Error during resume analysis:", err.message);
        res.status(500).json({ error: 'Error analyzing resume' });
    }
});

module.exports = router;
