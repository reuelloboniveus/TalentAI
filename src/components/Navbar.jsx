import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar(props) {
    const { currentUser, userData, login, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = '/';
        } catch (error) {
            console.error("Failed to logout", error);
        }
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {props.onMenuClick && (
                        <button
                            onClick={props.onMenuClick}
                            className="menu-btn"
                            aria-label="Toggle Menu"
                        >
                            ☰
                        </button>
                    )}
                    <h1>TalentAI</h1>
                </div>
                <div className="nav-links">
                    {currentUser ? (
                        <>
                            {userData && (
                                <span className="user-info" style={{ color: '#94a3b8', marginRight: '1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center' }}>
                                    <span className="hidden-mobile">Credits: </span>
                                    {(userData.role === 'admin' || userData.role === 'super_admin') ? (
                                        <span style={{ color: '#4ade80', fontWeight: 'bold', marginLeft: '0.3rem' }}>Unlimited</span>
                                    ) : (
                                        Math.max(0, (userData.limit || 10) - (userData.dailyUsage || 0))
                                    )}
                                </span>
                            )}
                            <a href="#generator" style={{ marginRight: '1rem', color: '#2dd4bf' }}>Job Generator</a>
                            {userData?.role === 'admin' && (
                                <a href="#admin" style={{ marginRight: '1rem', color: '#a78bfa' }}>Admin</a>
                            )}
                            <button
                                onClick={handleLogout}
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
