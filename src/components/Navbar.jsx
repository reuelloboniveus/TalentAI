import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { currentUser, userData, login, logout } = useAuth();

    return (
        <nav className="navbar">
            <div className="nav-container">
                <div className="nav-logo">
                    <h1>HireMeAI</h1>
                </div>
                <div className="nav-links">
                    {currentUser ? (
                        <>
                            {userData && (
                                <span className="user-info" style={{ color: '#94a3b8', marginRight: '1rem', fontSize: '0.9rem' }}>
                                    Credits: {Math.max(0, (userData.limit || 10) - (userData.dailyUsage || 0))}/{userData.limit || 10}
                                </span>
                            )}
                            {userData?.role === 'admin' && (
                                <a href="#admin" style={{ marginRight: '1rem', color: '#a78bfa' }}>Admin</a>
                            )}
                            <button
                                onClick={logout}
                                className="btn-link"
                                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem' }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={login}
                            className="btn-primary"
                            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', width: 'auto' }}
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}
