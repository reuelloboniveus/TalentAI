import React, { useState, useEffect } from 'react';
import LiveStats from './LiveStats';

export default function Hero() {
    const [text, setText] = useState('');
    const fullText = "Recruitment Process";

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            setText(fullText.substring(0, index));
            index++;
            if (index > fullText.length) {
                clearInterval(interval);
            }
        }, 150);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="hero">
            <div className="hero-content">
                <h1>Supercharge Your <span className="text-gradient typing-effect">{text}</span> <br /> with AI</h1>
                <p>
                    Whether you're a job seeker perfecting your resume or an agency screening thousands of candidates,
                    HireMeAI delivers instant, data-driven match analysis to save you time.
                </p>
                <div className="hero-badges">
                    <span className="badge">🚀 10x Faster Screening</span>
                    <span className="badge">⚡ Instant Insights</span>
                    <span className="badge">💼 For Agencies & Seekers</span>
                </div>
            </div>
            <LiveStats />
        </section>
    );
}
