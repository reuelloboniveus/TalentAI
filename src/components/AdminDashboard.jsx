import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc, query, orderBy, limit } from 'firebase/firestore';

const getEventBadgeClass = (type = '') => {
    const t = type.toUpperCase();
    if (t.includes('ERROR')) return 'bg-red-50 text-red-700 border border-red-100';
    if (t.includes('AUTH')) return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
    if (t.includes('ANALYZE') || t.includes('GENERATE')) return 'bg-blue-50 text-blue-700 border border-blue-100';
    if (t.includes('ADMIN')) return 'bg-purple-50 text-purple-700 border border-purple-100';
    if (t.includes('JD') || t.includes('TEMPLATE')) return 'bg-amber-50 text-amber-700 border border-amber-100';
    return 'bg-slate-50 text-slate-700 border border-slate-100';
};

const getInitials = (email) => {
    if (!email) return '?';
    return email.split('@')[0].substring(0, 2).toUpperCase();
};

const getAvatarColor = (email) => {
    const colors = [
        'from-blue-500 to-indigo-500 text-blue-50',
        'from-emerald-500 to-teal-500 text-emerald-50',
        'from-violet-500 to-purple-500 text-violet-50',
        'from-pink-500 to-rose-500 text-pink-50',
        'from-amber-500 to-orange-500 text-amber-50'
    ];
    let hash = 0;
    const emailStr = email || '';
    for (let i = 0; i < emailStr.length; i++) {
        hash = emailStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

export default function AdminDashboard() {
    const { userData, orgData, updateOrgSettings, getAllOrgs, createOrganization, updateAnyOrgSettings, assignUserToOrg, removeUserFromOrg } = useAuth();
    const [users, setUsers] = useState([]);
    const [allOrgs, setAllOrgs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Org Admin State
    const [apiKey, setApiKey] = useState('');
    const [isSavingKey, setIsSavingKey] = useState(false);

    // Super Admin State
    const [newOrgName, setNewOrgName] = useState('');
    const [isCreatingOrg, setIsCreatingOrg] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [manageOrgId, setManageOrgId] = useState(null);
    const [manageApiKey, setManageApiKey] = useState('');
    const [editingUserId, setEditingUserId] = useState(null);
    const [editForm, setEditForm] = useState({ role: '', orgId: '', limit: 10 });

    // UI enhancements for decluttered design
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [userSearchQuery, setUserSearchQuery] = useState('');

    // Log Viewer State
    const [activeTab, setActiveTab] = useState('directory');
    const [logs, setLogs] = useState([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [expandedLogId, setExpandedLogId] = useState({});
    const [logsSearchQuery, setLogsSearchQuery] = useState('');
    const [logsTypeFilter, setLogsTypeFilter] = useState('');

    const fetchLogs = async () => {
        setLogsLoading(true);
        try {
            const logsRef = collection(db, 'logs');
            const q = query(logsRef, orderBy('timestamp', 'desc'), limit(150));
            const snapshot = await getDocs(q);
            setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Failed to load logs:", error);
        } finally {
            setLogsLoading(false);
        }
    };

    useEffect(() => {
        if (userData?.role === 'super_admin' && activeTab === 'logs') {
            fetchLogs();
        }
    }, [userData, activeTab]);

    const toggleLogDetails = (id) => {
        setExpandedLogId(prev => ({ ...prev, [id]: !prev[id] }));
    };

    useEffect(() => {
        if (userData?.role === 'super_admin') {
            fetchSuperAdminData();
        } else {
            fetchOrgAdminData();
        }
    }, [userData, orgData]);

    const fetchSuperAdminData = async () => {
        setLoading(true);
        try {
            const orgs = await getAllOrgs();
            setAllOrgs(orgs);
            const querySnapshot = await getDocs(collection(db, "users"));
            setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
            console.error("Error loading super admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrgAdminData = async () => {
        setLoading(true);
        try {
            if (orgData?.geminiApiKey) setApiKey(orgData.geminiApiKey);
            const querySnapshot = await getDocs(collection(db, "users"));
            const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(u => u.orgId === userData.orgId);
            setUsers(usersList);
        } catch (error) {
            console.error("Error loading admin data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateOrg = async (e) => {
        e.preventDefault();
        if (!newOrgName.trim()) return;
        setIsCreatingOrg(true);
        try {
            await createOrganization(newOrgName);
            setNewOrgName('');
            setShowCreateForm(false);
            fetchSuperAdminData();
            alert("Organization created!");
        } catch (error) {
            alert(error.message);
        } finally {
            setIsCreatingOrg(false);
        }
    };

    const handleUpdateAnyOrgKey = async (orgId) => {
        try {
            await updateAnyOrgSettings(orgId, manageApiKey);
            alert("API Key updated for organization.");
            setManageOrgId(null);
            setManageApiKey('');
            fetchSuperAdminData();
        } catch (error) {
            console.error("Failed to update key:", error);
            alert("Failed to update key.");
        }
    };

    const handleSaveKey = async () => {
        setIsSavingKey(true);
        try {
            await updateOrgSettings(apiKey);
            alert("API Key saved successfully!");
        } catch (error) {
            console.error("Error saving API key:", error);
            alert("Failed to save API Key.");
        } finally {
            setIsSavingKey(false);
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

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to DELETE this user?")) return;
        try {
            const historyRef = collection(db, "users", userId, "history");
            const historySnapshot = await getDocs(historyRef);
            const deleteHistoryPromises = historySnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deleteHistoryPromises);
            await deleteDoc(doc(db, "users", userId));
            alert("User deleted successfully.");
            fetchSuperAdminData();
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user: " + error.message);
        }
    };

    const handleAssignUser = async (e) => {
        e.preventDefault();
        const userId = e.target.userId.value;
        const orgId = e.target.orgId.value;
        const role = e.target.role.value;
        if (!userId || !orgId) return;
        try {
            await assignUserToOrg(userId, orgId, role);
            alert(`User assigned as ${role}!`);
            e.target.reset();
            setShowAssignForm(false);
            fetchSuperAdminData();
        } catch (error) {
            alert("Failed to assign: " + error.message);
        }
    }

    const startEditUser = (user) => {
        setEditingUserId(user.id);
        setEditForm({ role: user.role || 'user', orgId: user.orgId || '', limit: user.limit || 10 });
    };

    const cancelEditUser = () => {
        setEditingUserId(null);
        setEditForm({ role: '', orgId: '', limit: 10 });
    };

    const handleSaveUserEdit = async (userId) => {
        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, { 
                role: editForm.role, 
                orgId: editForm.orgId || null,
                limit: parseInt(editForm.limit) || 10
            });
            setUsers(users.map(u => u.id === userId 
                ? { ...u, role: editForm.role, orgId: editForm.orgId || null, limit: parseInt(editForm.limit) || 10 } 
                : u
            ));
            setEditingUserId(null);
            setEditForm({ role: '', orgId: '', limit: 10 });
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to update user: " + error.message);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 animate-pulse">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Synchronizing Intelligence...</p>
        </div>
    );

    if (userData?.role === 'super_admin') {
        const filteredLogs = logs.filter(log => {
            const matchesSearch = 
                (log.userEmail || '').toLowerCase().includes(logsSearchQuery.toLowerCase()) ||
                (log.userId || '').toLowerCase().includes(logsSearchQuery.toLowerCase()) ||
                (log.eventDescription || '').toLowerCase().includes(logsSearchQuery.toLowerCase()) ||
                (log.eventType || '').toLowerCase().includes(logsSearchQuery.toLowerCase());
            
            const matchesType = !logsTypeFilter || log.eventType?.toUpperCase().includes(logsTypeFilter.toUpperCase());
            
            return matchesSearch && matchesType;
        });

        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="mb-12">
                    <h2 className="text-3xl font-extrabold text-primary tracking-tight">Talent Control Panel</h2>
                    <p className="text-on-surface-variant font-medium mt-1">Super Admin Overview & Global Orchestration</p>
                </div>

                {/* Tab Switcher */}
                <div className="flex gap-6 border-b border-slate-100 dark:border-outline-variant/10 mb-8 font-headline">
                    <button
                        onClick={() => setActiveTab('directory')}
                        className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
                            activeTab === 'directory'
                                ? 'border-secondary text-secondary'
                                : 'border-transparent text-on-surface-variant hover:text-primary opacity-60 hover:opacity-100'
                        }`}
                    >
                        <span className="material-symbols-outlined text-sm">hub</span>
                        Directory Control
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`pb-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
                            activeTab === 'logs'
                                ? 'border-secondary text-secondary'
                                : 'border-transparent text-on-surface-variant hover:text-primary opacity-60 hover:opacity-100'
                        }`}
                    >
                        <span className="material-symbols-outlined text-sm">terminal</span>
                        Audit Logs
                    </button>
                </div>

                {activeTab === 'directory' ? (
                    <>
                        <div className="grid grid-cols-12 gap-8 mb-12">
                            {/* Metrics Summary */}
                            <div className="col-span-12 md:col-span-4 bg-primary p-8 rounded-2xl shadow-xl shadow-primary/20 relative overflow-hidden text-white">
                                <div className="relative z-10">
                                    <span className="text-primary-fixed-dim text-xs font-bold uppercase tracking-widest">Total Organizations</span>
                                    <div className="text-5xl font-black mt-2">{allOrgs.length}</div>
                                </div>
                                <div className="absolute -right-4 -bottom-4 opacity-20">
                                    <span className="material-symbols-outlined text-8xl" style={{ fontVariationSettings: "'FILL' 1" }}>hub</span>
                                </div>
                            </div>

                            <div className="col-span-12 md:col-span-4 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                                <div>
                                    <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest">Global Talent Pool</span>
                                    <div className="text-5xl font-black text-primary mt-2">{users.length}</div>
                                </div>
                                <div className="mt-4 flex items-center text-emerald-500 text-xs font-bold gap-1">
                                    <span className="material-symbols-outlined text-sm">trending_up</span>
                                    Active Ecosystem
                                </div>
                            </div>

                            <div className="col-span-12 md:col-span-4 bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                                <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Quick Provision</h3>
                                <form onSubmit={handleCreateOrg} className="flex gap-2 w-full items-center">
                                    <input
                                        type="text"
                                        value={newOrgName}
                                        onChange={(e) => setNewOrgName(e.target.value)}
                                        placeholder="New Org Name"
                                        className="flex-1 min-w-0 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isCreatingOrg || !newOrgName.trim()}
                                        className="bg-primary text-white p-3 rounded-xl hover:bg-primary-container hover:scale-105 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center shrink-0"
                                    >
                                        <span className="material-symbols-outlined">add</span>
                                    </button>
                                </form>
                            </div>
                        </div>

                        <div className="grid grid-cols-12 gap-8">
                            {/* Organizations Table */}
                            <div className="col-span-12 lg:col-span-12 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
                                <div className="p-6 border-b border-slate-50">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-bold text-primary">Managed Organizations</h3>
                                        <div className="flex items-center gap-3">
                                            <button className="text-slate-400 text-sm font-bold flex items-center gap-1 hover:text-slate-600 transition-colors">
                                                <span className="material-symbols-outlined text-sm">download</span>
                                                Export
                                            </button>
                                            <button
                                                onClick={() => setShowCreateForm(!showCreateForm)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                                    showCreateForm 
                                                        ? 'bg-slate-100 text-slate-600' 
                                                        : 'bg-secondary text-white shadow-lg shadow-secondary/20 hover:-translate-y-0.5'
                                                }`}
                                            >
                                                <span className="material-symbols-outlined text-sm">{showCreateForm ? 'close' : 'add'}</span>
                                                {showCreateForm ? 'Cancel' : 'Create Organization'}
                                            </button>
                                        </div>
                                    </div>
                                    {showCreateForm && (
                                        <form onSubmit={handleCreateOrg} className="mt-4 flex gap-3 items-end p-4 bg-slate-50 rounded-xl border border-slate-100 animate-in slide-in-from-top-2 duration-300">
                                            <div className="flex-1">
                                                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 block">Organization Name</label>
                                                <input
                                                    type="text"
                                                    value={newOrgName}
                                                    onChange={(e) => setNewOrgName(e.target.value)}
                                                    placeholder="e.g. Acme Corp, Niveus Solutions"
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-secondary/20 focus:border-secondary/30 transition-all"
                                                    autoFocus
                                                />
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={!newOrgName.trim() || isCreatingOrg}
                                                className="bg-primary text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:hover:translate-y-0 flex items-center gap-2"
                                            >
                                                <span className="material-symbols-outlined text-sm">add_business</span>
                                                Create
                                            </button>
                                        </form>
                                    )}
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50">
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Organization</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Identifier</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Intelligence Gateway</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {allOrgs.length === 0 && (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <span className="material-symbols-outlined text-4xl text-slate-200">domain_add</span>
                                                            <p className="text-slate-400 text-sm font-medium">No organizations yet</p>
                                                            <button 
                                                                onClick={() => setIsCreatingOrg(true)}
                                                                className="text-secondary text-xs font-bold hover:underline mt-1"
                                                            >
                                                                Create your first organization →
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                            {allOrgs.map(org => (
                                                <tr key={org.id} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-secondary-fixed flex items-center justify-center text-secondary font-black text-xs">
                                                                {org.name.substring(0, 2).toUpperCase()}
                                                            </div>
                                                            <span className="font-bold text-primary">{org.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <code className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">{org.id}</code>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {manageOrgId === org.id ? (
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="password"
                                                                    value={manageApiKey}
                                                                    onChange={(e) => setManageApiKey(e.target.value)}
                                                                    placeholder="New API Key"
                                                                    className="text-xs bg-slate-100 border-none rounded-lg px-3 py-2 w-full max-w-[200px]"
                                                                />
                                                                <button onClick={() => handleUpdateAnyOrgKey(org.id)} className="text-emerald-600 font-bold text-xs uppercase hover:underline">Commit</button>
                                                                <button onClick={() => setManageOrgId(null)} className="text-slate-400 font-bold text-xs uppercase hover:underline">Void</button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${org.geminiApiKey ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                                                <span className="text-xs font-medium text-slate-600">{org.geminiApiKey ? '••••••••' : 'Not Connected'}</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button 
                                                            onClick={() => { setManageOrgId(org.id); setManageApiKey(org.geminiApiKey || ''); }}
                                                            className="opacity-0 group-hover:opacity-100 p-2 hover:bg-secondary/10 text-secondary rounded-lg transition-all"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">edit</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* All Users Section */}
                            <div className="col-span-12 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
                                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                                    <div>
                                        <h3 className="text-lg font-bold text-primary">Global Talent Directory</h3>
                                        <p className="text-xs text-on-surface-variant font-medium">Provisioning and access control for all users</p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
                                        <div className="relative flex-1 sm:w-64">
                                            <span className="material-symbols-outlined absolute left-3 top-2 text-slate-400 text-lg">search</span>
                                            <input
                                                type="text"
                                                value={userSearchQuery}
                                                onChange={(e) => setUserSearchQuery(e.target.value)}
                                                placeholder="Search talent by email, ID, or org..."
                                                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                                            />
                                        </div>
                                        <button
                                            onClick={() => setShowAssignForm(!showAssignForm)}
                                            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                                showAssignForm 
                                                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' 
                                                    : 'bg-secondary text-white shadow-lg shadow-secondary/20 hover:-translate-y-0.5'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-sm">{showAssignForm ? 'close' : 'person_add'}</span>
                                            {showAssignForm ? 'Cancel' : 'Assign Member'}
                                        </button>
                                    </div>
                                </div>

                                {/* Collapsible Assignment Form Banner */}
                                {showAssignForm && (
                                    <div className="p-6 bg-slate-50 border-b border-slate-100 animate-in slide-in-from-top-2 duration-300">
                                        <form onSubmit={handleAssignUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                            <div className="md:col-span-1">
                                                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">User ID or Email</label>
                                                <input
                                                    name="userId"
                                                    type="text"
                                                    placeholder="e.g. user@example.com"
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">Target Organization</label>
                                                <select
                                                    name="orgId"
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                                                    required
                                                >
                                                    <option value="">Select Org...</option>
                                                    {allOrgs.map(org => <option key={org.id} value={org.id}>{org.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 block">Assigned Role</label>
                                                <select
                                                    name="role"
                                                    defaultValue="recruiter"
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                                                >
                                                    <option value="recruiter">Recruiter</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="user">User</option>
                                                </select>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    type="submit"
                                                    className="flex-1 bg-secondary hover:bg-secondary/90 text-white font-bold h-10 px-4 rounded-xl text-xs transition-all shadow-md shadow-secondary/20 hover:-translate-y-0.5 active:scale-95"
                                                >
                                                    Confirm Assignment
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setShowAssignForm(false)}
                                                    className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-bold h-10 px-4 rounded-xl text-xs transition-all active:scale-95"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50/30">
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Account Entity</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Role</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Organization</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-center">Daily Quota</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Operations</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {users.filter(u => {
                                                if (!userSearchQuery) return true;
                                                const q = userSearchQuery.toLowerCase();
                                                const userOrg = allOrgs.find(org => org.id === u.orgId);
                                                return (u.email || '').toLowerCase().includes(q) ||
                                                       (u.id || '').toLowerCase().includes(q) ||
                                                       (u.role || '').toLowerCase().includes(q) ||
                                                       (userOrg ? userOrg.name : 'unassigned pool').toLowerCase().includes(q);
                                            }).length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-12 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <span className="material-symbols-outlined text-4xl text-slate-200">person_search</span>
                                                            <p className="text-slate-400 text-sm font-medium">No talent found matching "{userSearchQuery}"</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                users.filter(u => {
                                                    if (!userSearchQuery) return true;
                                                    const q = userSearchQuery.toLowerCase();
                                                    const userOrg = allOrgs.find(org => org.id === u.orgId);
                                                    return (u.email || '').toLowerCase().includes(q) ||
                                                           (u.id || '').toLowerCase().includes(q) ||
                                                           (u.role || '').toLowerCase().includes(q) ||
                                                           (userOrg ? userOrg.name : 'unassigned pool').toLowerCase().includes(q);
                                                }).map(user => {
                                                    const userOrg = allOrgs.find(o => o.id === user.orgId);
                                                    return (
                                                        <tr key={user.id} className="hover:bg-slate-50/30 transition-all group">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${getAvatarColor(user.email || '')} flex items-center justify-center font-bold text-xs shadow-sm`}>
                                                                        {getInitials(user.email)}
                                                                    </div>
                                                                    <div>
                                                                        <div className="font-bold text-primary">{user.email}</div>
                                                                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{user.id}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {editingUserId === user.id && user.role !== 'super_admin' ? (
                                                                    <select
                                                                        value={editForm.role}
                                                                        onChange={(e) => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                                                                        className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:ring-2 focus:ring-secondary/20 w-full"
                                                                    >
                                                                        <option value="recruiter">Recruiter</option>
                                                                        <option value="admin">Admin</option>
                                                                        <option value="user">User</option>
                                                                    </select>
                                                                ) : (
                                                                    <span 
                                                                        className={`
                                                                            px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight
                                                                            ${user.role === 'super_admin' ? 'bg-indigo-100 text-indigo-700' : user.role === 'admin' ? 'bg-secondary-fixed text-secondary' : user.role === 'recruiter' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}
                                                                        `}
                                                                    >
                                                                        {user.role}
                                                                    </span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {editingUserId === user.id ? (
                                                                    <select
                                                                        value={editForm.orgId}
                                                                        onChange={(e) => setEditForm(prev => ({ ...prev, orgId: e.target.value }))}
                                                                        className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold focus:ring-2 focus:ring-secondary/20 w-full"
                                                                    >
                                                                        <option value="">— Unassigned —</option>
                                                                        {allOrgs.map(org => (
                                                                            <option key={org.id} value={org.id}>{org.name}</option>
                                                                        ))}
                                                                    </select>
                                                                ) : userOrg ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                                        <span className="text-xs font-bold text-emerald-700">{userOrg.name}</span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                                                                        <span className="text-xs font-bold text-amber-600 italic">Unassigned Pool</span>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                {editingUserId === user.id ? (
                                                                    <div className="flex justify-center">
                                                                        <input
                                                                            type="number"
                                                                            value={editForm.limit}
                                                                            onChange={(e) => setEditForm(prev => ({ ...prev, limit: parseInt(e.target.value) || 0 }))}
                                                                            className="w-16 text-center bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:ring-1 focus:ring-secondary/30 h-8"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-xs font-bold text-primary">{user.limit || 10}</span>
                                                                )}
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                {editingUserId === user.id ? (
                                                                    <div className="flex items-center gap-2">
                                                                        <button
                                                                            onClick={() => handleSaveUserEdit(user.id)}
                                                                            className="flex items-center gap-1 bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-emerald-600 transition-colors shadow-sm"
                                                                        >
                                                                            <span className="material-symbols-outlined text-sm">check</span>
                                                                            Save
                                                                        </button>
                                                                        <button
                                                                            onClick={cancelEditUser}
                                                                            className="flex items-center gap-1 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-slate-200 transition-colors"
                                                                        >
                                                                            <span className="material-symbols-outlined text-sm">close</span>
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex items-center gap-1.5">
                                                                        {user.role !== 'super_admin' && (
                                                                            <button
                                                                                onClick={() => startEditUser(user)}
                                                                                className="p-1.5 text-slate-400 hover:text-secondary hover:bg-secondary/10 rounded-lg transition-all"
                                                                                title="Edit Role & Org"
                                                                            >
                                                                                <span className="material-symbols-outlined text-lg">edit</span>
                                                                            </button>
                                                                        )}
                                                                        {user.orgId && (
                                                                            <button 
                                                                                onClick={() => removeUserFromOrg(user.id).then(fetchSuperAdminData)}
                                                                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                                                                                title="Revoke Org Assignment"
                                                                            >
                                                                                <span className="material-symbols-outlined text-lg">logout</span>
                                                                            </button>
                                                                        )}
                                                                        <button 
                                                                            onClick={() => handleDeleteUser(user.id)}
                                                                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                                                            title="Delete User"
                                                                        >
                                                                            <span className="material-symbols-outlined text-lg">delete</span>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    );
                                                })
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Audit Logs Panel */
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
                            <div className="flex flex-col sm:flex-row gap-3 w-full items-stretch sm:items-center flex-1">
                                <div className="relative flex-1 max-w-md">
                                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-lg">search</span>
                                    <input
                                        type="text"
                                        value={logsSearchQuery}
                                        onChange={(e) => setLogsSearchQuery(e.target.value)}
                                        placeholder="Search logs by email, ID, message..."
                                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                                    />
                                </div>
                                <div className="w-full sm:w-48">
                                    <select
                                        value={logsTypeFilter}
                                        onChange={(e) => setLogsTypeFilter(e.target.value)}
                                        className="w-full bg-slate-50 border-none rounded-xl px-4 py-2.5 text-xs focus:ring-2 focus:ring-secondary/20 outline-none transition-all"
                                    >
                                        <option value="">All Events</option>
                                        <option value="AUTH">Authentication</option>
                                        <option value="ANALYZE">Analysis</option>
                                        <option value="GENERATE">Generators</option>
                                        <option value="ADMIN">Admin Actions</option>
                                        <option value="TEMPLATE">JD Templates</option>
                                        <option value="ERROR">Errors</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={fetchLogs}
                                disabled={logsLoading}
                                className="w-full md:w-auto flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-primary font-bold text-xs px-4 py-2.5 rounded-xl transition-all border border-slate-150 disabled:opacity-50"
                            >
                                <span className={`material-symbols-outlined text-sm ${logsLoading ? 'animate-spin' : ''}`}>refresh</span>
                                <span>{logsLoading ? 'Synchronizing...' : 'Refresh Logs'}</span>
                            </button>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-8">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Timestamp</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Identity</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Event Type</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Action Description</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant text-right">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {logsLoading && logs.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-10 h-10 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading system audit stream...</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filteredLogs.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <span className="material-symbols-outlined text-4xl text-slate-200">terminal</span>
                                                        <p className="text-slate-400 text-sm font-medium">No logs matched filters</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredLogs.map(log => {
                                                const isExpanded = expandedLogId[log.id] || false;
                                                const dateString = log.timestamp?.toDate 
                                                    ? log.timestamp.toDate().toLocaleString() 
                                                    : log.timestamp?.seconds 
                                                        ? new Date(log.timestamp.seconds * 1000).toLocaleString() 
                                                        : 'Just now';
                                                return (
                                                    <React.Fragment key={log.id}>
                                                        <tr className="hover:bg-slate-50/30 transition-colors">
                                                            <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                                                                {dateString}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="text-xs font-bold text-primary">{log.userEmail}</div>
                                                                <div className="text-[9px] text-slate-400 font-mono tracking-tighter mt-0.5">{log.userId}</div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${getEventBadgeClass(log.eventType)}`}>
                                                                    {log.eventType}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-xs font-medium text-slate-700">
                                                                {log.eventDescription}
                                                            </td>
                                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                                <button
                                                                    onClick={() => toggleLogDetails(log.id)}
                                                                    className={`px-3 py-1.5 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                                        isExpanded 
                                                                            ? 'bg-primary/5 text-secondary border-secondary/20' 
                                                                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                                    }`}
                                                                >
                                                                    {isExpanded ? 'Hide' : 'Inspect'}
                                                                </button>
                                                            </td>
                                                        </tr>
                                                        {isExpanded && (
                                                            <tr>
                                                                <td colSpan="5" className="px-6 py-4 bg-slate-50/50 border-t border-slate-50">
                                                                    <div className="space-y-3">
                                                                        <div className="flex justify-between items-center text-[9px] font-black uppercase text-slate-400 tracking-wider">
                                                                            <span>Trace Details</span>
                                                                            <span>User Agent: {log.userAgent || 'N/A'}</span>
                                                                        </div>
                                                                        <pre className="text-left font-mono bg-white p-4 rounded-xl text-[11px] border border-slate-100 overflow-x-auto text-slate-700 max-h-60 custom-scrollbar leading-relaxed">
                                                                            {JSON.stringify({ ...log.details, eventId: log.id }, null, 2)}
                                                                        </pre>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </React.Fragment>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Organization Admin View
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-12">
                <h2 className="text-3xl font-extrabold text-primary tracking-tight">Org Command Center</h2>
                <p className="text-on-surface-variant font-medium mt-1">Managing <span className="text-secondary font-bold">{orgData?.name}</span> infrastructure</p>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Configuration Bento Card */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-secondary">key</span>
                                AI Gateway Settings
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Gemini Pro API Key</label>
                                    <div className="flex flex-col gap-3">
                                        <input
                                            type="password"
                                            value={apiKey}
                                            onChange={(e) => setApiKey(e.target.value)}
                                            placeholder="Enter secure gateway key"
                                            className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20 transition-all"
                                        />
                                        <button
                                            onClick={handleSaveKey}
                                            disabled={isSavingKey}
                                            className="w-full py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:scale-95 transition-all text-sm disabled:opacity-50"
                                        >
                                            {isSavingKey ? 'Synching...' : 'Commit Gateway Key'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-secondary/5 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
                    </div>

                    <div className="bg-emerald-600 p-8 rounded-2xl shadow-xl shadow-emerald-900/10 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Current Capacity</h4>
                            <div className="text-4xl font-black">{users.length}</div>
                            <p className="text-xs mt-2 font-medium opacity-80 leading-relaxed italic">
                                Total active talent evaluators currently provisioned in your ecosystem.
                            </p>
                        </div>
                        <div className="absolute right-[-10%] top-[-10%] opacity-10">
                            <span className="material-symbols-outlined text-[120px]">groups</span>
                        </div>
                    </div>
                </div>

                {/* User List Management Panel */}
                <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-50 bg-slate-50/20">
                        <h3 className="text-lg font-bold text-primary">Intelligence Access Registry</h3>
                        <p className="text-xs font-medium text-on-surface-variant">Define compute limits and provisioned roles</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/10">
                                    <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Administrator / ID</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-center">Protocol Level</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-center">Quota</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">Synchronization</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {users.map(user => (
                                    <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-primary text-sm">{user.email}</div>
                                            <div className="text-[9px] text-slate-400 font-mono tracking-tighter mt-0.5">{user.id}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-secondary-fixed text-secondary px-2 py-0.5 rounded-full text-[9px] font-black uppercase italic">
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <input
                                                    type="number"
                                                    defaultValue={user.limit || 10}
                                                    id={`limit-${user.id}`}
                                                    className="w-12 text-center bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold focus:ring-1 focus:ring-secondary/30 h-8"
                                                />
                                                <span className="text-[8px] text-slate-400 uppercase font-black mt-1">Actions/Day</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => {
                                                    const val = document.getElementById(`limit-${user.id}`).value;
                                                    updateLimit(user.id, val);
                                                }}
                                                className="opacity-0 group-hover:opacity-100 bg-white border border-slate-200 text-primary px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                                            >
                                                Update
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {users.length === 0 && (
                        <div className="p-12 text-center flex flex-col items-center">
                            <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">person_off</span>
                            <p className="text-slate-400 text-sm font-medium">No users provisioned for this organization.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
