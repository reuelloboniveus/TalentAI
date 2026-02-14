import React from 'react';

export default function Benefits() {
    return (
        <section className="benefits">
            <div className="benefits-header">
                <h2>Scale Your Recruitment, Not Your Overhead</h2>
                <p>Empower your lean team to process thousands of resumes with AI efficiency.</p>
            </div>

            <div className="benefits-grid">
                <div className="benefit-card">
                    <div className="benefit-icon">⚡</div>
                    <h3>10x Faster Screening</h3>
                    <p>Stop manually reading every line. Let AI highlight the best matches instantly, allowing you to focus on the top 1% of talent.</p>
                </div>

                <div className="benefit-card">
                    <div className="benefit-icon">👥</div>
                    <h3>Lean Team, Big Impact</h3>
                    <p>Handle the volume of a large agency with a fraction of the staff. Automate the initial screen and free up your recruiters for high-value interviews.</p>
                </div>

                <div className="benefit-card">
                    <div className="benefit-icon">🎯</div>
                    <h3>Unbiased Matching</h3>
                    <p>Standardize your screening process. AI evaluates candidates based purely on skills and experience match against the JD.</p>
                </div>

                <div className="benefit-card">
                    <div className="benefit-icon">📉</div>
                    <h3>Reduce Cost per Hire</h3>
                    <p>Save distinct hours per requisition. Lower your operational costs while increasing your placement speed and quality.</p>
                </div>
            </div>
        </section>
    );
}
