// src/screens/AnalyzeScreen.js
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import '../App.css';

function AnalyzeScreen() {
    const [jobDesc, setJobDesc] = useState('');
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const mode = searchParams.get("mode") || "recruiter";

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            alert("Please upload a resume file.");
            return;
        }

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobDescription', jobDesc);
        formData.append('mode', mode);

        try {
            setLoading(true);
            setResult(null);
            const res = await axios.post('/api/analyze', formData);
            setResult(res.data);
        } catch (error) {
            alert("Error analyzing resume.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="analyze-wrapper">
            <h2 className="analyze-title">
                Resume Analyzer ({mode === 'recruiter' ? 'Recruiter View' : 'Candidate View'})
            </h2>

            <form onSubmit={handleSubmit} className="analyze-form">
                <textarea
                    placeholder="Paste job description..."
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    rows={6}
                    className="analyze-textarea"
                />

                <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="analyze-file"
                />

                <button type="submit" className="analyze-button">Analyze</button>
            </form>

            {loading && (
                <div className="analyze-result">
                    <p>Analyzing... Please wait ⏳</p>
                </div>
            )}

            {result && (
                <div className="analyze-result">
                    <h3>Score: <span>{result.score}</span></h3>
                    <p>{result.explanation}</p>
                </div>
            )}
        </div>
    );
}

export default AnalyzeScreen;
