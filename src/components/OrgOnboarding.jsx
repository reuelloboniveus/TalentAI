import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function OrgOnboarding() {
    const { createOrganization } = useAuth();
    const [orgName, setOrgName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!orgName.trim()) return;

        setLoading(true);
        setError('');

        try {
            await createOrganization(orgName);
            // AuthContext will update and redirect automatically
        } catch (err) {
            setError(err.message || "Failed to create organization.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '500px', marginTop: '4rem' }}>
            <div className="card">
                <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>Welcome to TalentAI</h2>
                <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2rem' }}>
                    To get started, please create an organization for your team.
                </p>

                {error && <div className="error">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="orgName">Organization Name</label>
                        <input
                            type="text"
                            id="orgName"
                            value={orgName}
                            onChange={(e) => setOrgName(e.target.value)}
                            placeholder="e.g. Acme Corp"
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading || !orgName.trim()}>
                        {loading ? 'Creating Organization...' : 'Create Organization'}
                    </button>
                </form>
            </div>
        </div>
    );
}
