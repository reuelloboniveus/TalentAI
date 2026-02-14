import React from 'react';

export default function Features() {
    return (
        <section id="features" className="features">
            <h2>How It Works</h2>
            <div className="feature-grid">
                <div className="feature-card">
                    <div className="feature-icon">1</div>
                    <h3>Upload JD</h3>
                    <p>Paste the job description you are targeting.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">2</div>
                    <h3>Upload Resume</h3>
                    <p>Upload your PDF/TXT resume or paste the text.</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">3</div>
                    <h3>Get Insights</h3>
                    <p>Receive a detailed AI analysis and match score.</p>
                </div>
            </div>
        </section>
    );
}
