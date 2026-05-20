import React from 'react';

export default function Sidebar({ history, onSelect, isOpen, toggleSidebar }) {
    if (!isOpen) return null;

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h3>History</h3>
                <button onClick={toggleSidebar} className="close-btn">&times;</button>
            </div>
            <div className="history-list">
                {history.length === 0 ? (
                    <p className="no-history">No history found (last 30 days).</p>
                ) : (
                    history.map((item) => (
                        <div key={item.id} className="history-item" onClick={() => onSelect(item)}>
                            <div className="history-score" style={{
                                borderColor: item.matchScore >= 70 ? '#4ade80' : item.matchScore >= 40 ? '#facc15' : '#f87171',
                                color: item.matchScore >= 70 ? '#4ade80' : item.matchScore >= 40 ? '#facc15' : '#f87171'
                            }}>
                                {item.matchScore}%
                            </div>
                            <div className="history-details">
                                <span className="history-date">
                                    {item.createdAt?.toDate().toLocaleDateString()}
                                </span>
                                <span className="history-summary">
                                    {item.jdSummary || "Resume Analysis"}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
