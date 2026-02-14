import React from 'react';

export default function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>HireMeAI</h3>
                    <p>Empowering job seekers with AI tools.</p>
                </div>
                <div className="footer-section">
                    <h4>Links</h4>
                    <a href="#home">Home</a>
                    <a href="#features">Features</a>
                </div>
                <div className="footer-section">
                    <h4>Legal</h4>
                    <a href="#" style={{ cursor: 'not-allowed', opacity: 0.6 }}>Privacy Policy</a>
                    <a href="#" style={{ cursor: 'not-allowed', opacity: 0.6 }}>Terms of Service</a>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} HireMeAI. Powered by Google Gemini.</p>
            </div>
        </footer>
    );
}
