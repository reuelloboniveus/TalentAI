import React, { useEffect, useState } from 'react';

export default function LiveStats() {
    const [count, setCount] = useState(50);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prev => prev + 1);
        }, 12 * 60 * 60 * 1000); // 12 hours in milliseconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="live-stats">
            <div className="stat-item">
                <span className="stat-value">{count.toLocaleString()}</span>
                <span className="stat-label">Resumes Analyzed</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
                <span className="stat-value">98%</span>
                <span className="stat-label">Accuracy Rate</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
                <span className="stat-value">24/7</span>
                <span className="stat-label">AI Availability</span>
            </div>
        </div>
    );
}
