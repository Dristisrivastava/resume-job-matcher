// src/screens/HomeScreen.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function HomeScreen() {
    const navigate = useNavigate();

    return (
        <div className="home-wrapper">
            <div className="home-left">
                <h1 className="home-title">Welcome to Resume Analyzer</h1>
                <p className="home-description">Choose how you want to analyze your resume:</p>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="home-button"
                        onClick={() => navigate('/analyze?mode=recruiter')}
                    >
                        Analyze as Recruiter
                    </button>

                    <button
                        className="home-button"
                        onClick={() => navigate('/analyze?mode=candidate')}
                    >
                        Analyze as Candidate
                    </button>
                </div>
            </div>

            <div className="home-right-slider">
                <div className="image-slider">
                    {[1, 2, 3, 4, 5].map((num) => (
                        <img
                            key={num}
                            src={`/images/resumeimg${num}.png`}
                            alt={`Resume ${num}`}
                            className="slider-image"
                        />
                    ))}
                    {[1, 2, 3, 4, 5].map((num) => (
                        <img
                            key={`dup-${num}`}
                            src={`/images/resumeimg${num}.png`}
                            alt={`Resume ${num}`}
                            className="slider-image"
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default HomeScreen;
