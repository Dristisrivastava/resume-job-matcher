const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const getAnalysis = require('../utils/getAnalysis');


const upload = multer();

router.post("/", upload.single("resume"), async (req, res) => {
    try {
        const jobDescription = req.body.jobDescription;
        const mode = req.body.mode || "recruiter";
        const resumeFile = req.file;

        if (!resumeFile) {
            return res.status(400).json({ error: "No resume file uploaded." });
        }

        const pdfData = await pdfParse(resumeFile.buffer);
        const resumeText = pdfData.text;

        const result = await getAnalysis(jobDescription, resumeText, mode);
        res.json(result);
    } catch (err) {
        console.error("❌ Error analyzing resume:", err.message);
        res.status(500).json({ error: "Failed to analyze resume." });
    }
});

module.exports = router;
