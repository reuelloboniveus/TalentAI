import React from 'react';

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="nav-container">
                <div className="nav-logo">
                    <h1>HireMeAI</h1>
                </div>
                <div className="nav-links">
                    <a href="#features">How it Works</a>
                    <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
                </div>
            </div>
        </nav>
    );
}
