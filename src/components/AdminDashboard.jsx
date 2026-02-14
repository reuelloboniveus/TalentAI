import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(usersList);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateLimit = async (userId, newLimit) => {
        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, { limit: parseInt(newLimit) });
            setUsers(users.map(u => u.id === userId ? { ...u, limit: parseInt(newLimit) } : u));
            alert("Limit updated successfully!");
        } catch (error) {
            console.error("Error updating limit:", error);
            alert("Failed to update limit.");
        }
    };

    if (loading) return <div className="container" style={{ textAlign: 'center' }}>Loading users...</div>;

    return (
        <div className="container">
            <h2 style={{ marginBottom: '2rem' }}>Admin Dashboard</h2>
            <div className="card" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', color: '#f8fafc' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.1)', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>User ID / Email</th>
                            <th style={{ padding: '1rem' }}>Role</th>
                            <th style={{ padding: '1rem' }}>Usage (Today)</th>
                            <th style={{ padding: '1rem' }}>Limit</th>
                            <th style={{ padding: '1rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} style={{ borderBottom: '1px solid rgba(148, 163, 184, 0.05)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ fontSize: '0.9rem' }}>{user.email}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{user.uid}</div>
                                </td>
                                <td style={{ padding: '1rem' }}>{user.role}</td>
                                <td style={{ padding: '1rem' }}>{user.dailyUsage || 0}</td>
                                <td style={{ padding: '1rem' }}>
                                    <input
                                        type="number"
                                        defaultValue={user.limit || 10}
                                        id={`limit-${user.id}`}
                                        style={{ width: '60px', padding: '0.25rem', fontSize: '0.9rem' }}
                                    />
                                </td>
                                <td style={{ padding: '1rem' }}>
                                    <button
                                        onClick={() => {
                                            const val = document.getElementById(`limit-${user.id}`).value;
                                            updateLimit(user.id, val);
                                        }}
                                        style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                                    >
                                        Update
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
