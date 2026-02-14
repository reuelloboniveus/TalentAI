import React from 'react';

export default function AnalyzeResult({ result, onReset }) {
    if (!result) return null;

    const { score, matching_skills, missing_skills, insights } = result;

    // Determine color based on score
    const scoreColor = score >= 80 ? 'text-green-500' : score >= 50 ? 'text-yellow-500' : 'text-red-500';

    return (
        <div className="result-container card">
            <h2>Analysis Result</h2>

            <div className="score-section">
                <h3>Match Score</h3>
                <div className={`score-display ${scoreColor}`}>
                    {score}%
                </div>
            </div>

            <div className="skills-grid">
                <div className="skills-column match">
                    <h3>Matching Skills</h3>
                    <ul>
                        {matching_skills && matching_skills.length > 0 ? (
                            matching_skills.map((skill, index) => (
                                <li key={index}>✅ {skill}</li>
                            ))
                        ) : (
                            <li>No direct matches found.</li>
                        )}
                    </ul>
                </div>

                <div className="skills-column miss">
                    <h3>Missing Skills</h3>
                    <ul>
                        {missing_skills && missing_skills.length > 0 ? (
                            missing_skills.map((skill, index) => (
                                <li key={index}>❌ {skill}</li>
                            ))
                        ) : (
                            <li>No missing skills identified!</li>
                        )}
                    </ul>
                </div>
            </div>

            <div className="insights-section">
                <h3>Insights</h3>
                <p>{insights}</p>
            </div>

            <button onClick={onReset} className="reset-btn">
                Start New Analysis
            </button>
        </div>
    );
}
