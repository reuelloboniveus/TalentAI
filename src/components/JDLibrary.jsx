import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { saveJD, updateJD, deleteJD } from '../services/firebase';

export default function JDLibrary({ jds = [], onUpdate }) {
    const { currentUser, userData } = useAuth();
    const [isAdding, setIsAdding] = useState(false);
    const [editingJD, setEditingJD] = useState(null);
    const [saving, setSaving] = useState(false);
    
    // Form States
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleOpenAdd = () => {
        setTitle('');
        setContent('');
        setEditingJD(null);
        setIsAdding(true);
    };

    const handleOpenEdit = (jd) => {
        setTitle(jd.title);
        setContent(jd.content);
        setEditingJD(jd);
        setIsAdding(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!currentUser || !title.trim() || !content.trim()) return;

        setSaving(true);
        try {
            if (editingJD) {
                await updateJD(currentUser.uid, editingJD.id, title, content, userData?.orgId);
            } else {
                await saveJD(currentUser.uid, title, content, userData?.orgId);
            }
            setIsAdding(false);
            onUpdate();
        } catch {
            alert("Error saving JD template.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this JD template?")) return;
        try {
            await deleteJD(currentUser.uid, id, userData?.orgId);
            onUpdate();
        } catch {
            alert("Error deleting JD.");
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div className="space-y-2">
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-primary tracking-tight">JD Library</h2>
                    <p className="text-on-surface-variant text-base md:text-lg font-medium opacity-70">Manage your reusable job requirement vectors.</p>
                </div>
                <button 
                    onClick={handleOpenAdd}
                    className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">add</span>
                    Create Template
                </button>
            </div>

            {isAdding ? (
                <div className="card shadow-2xl animate-in zoom-in-95 duration-500">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-secondary text-3xl">{editingJD ? 'edit_note' : 'post_add'}</span>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-primary">{editingJD ? 'Refine Template' : 'New Requirement Vector'}</h3>
                            <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-on-surface-variant">Schema Configuration</p>
                        </div>
                    </div>

                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-primary/60 ml-1">Template Title</label>
                            <input 
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Senior Cloud Architect"
                                className="input-field border-2 border-transparent focus:border-secondary/20 focus:bg-white text-lg font-bold transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-primary/60 ml-1">Job Description Content</label>
                            <textarea 
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Paste the full JD requirements here..."
                                className="input-field min-h-[400px] bg-surface-container-low border-2 border-transparent focus:border-secondary/20 focus:bg-white text-sm leading-relaxed transition-all"
                                required
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="flex-1 btn-primary py-4 text-base md:text-lg"
                            >
                                {saving ? "Synchronizing..." : editingJD ? "Update Template" : "Add to Library"}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setIsAdding(false)}
                                className="px-8 py-4 sm:py-0 border-2 border-outline-variant/10 rounded-2xl font-black text-on-surface-variant hover:bg-surface-container-low transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jds.length === 0 ? (
                        <div className="col-span-full py-20 bg-white rounded-[48px] border-2 border-dashed border-outline-variant/20 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-20 h-20 bg-surface-container-low rounded-3xl flex items-center justify-center">
                                <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">inventory_2</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-primary">Library Empty</h3>
                                <p className="text-on-surface-variant max-w-xs mx-auto">Start building your library of job descriptions to streamline your analysis workflow.</p>
                            </div>
                            <button onClick={handleOpenAdd} className="text-secondary font-black uppercase tracking-widest text-xs hover:underline mt-4">Initialize First Template</button>
                        </div>
                    ) : (
                        jds.map((item) => (
                            <div key={item.id} className="card group hover:shadow-2xl hover:scale-[1.02] transition-all flex flex-col">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                        <span className="material-symbols-outlined text-primary">description</span>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => handleOpenEdit(item)}
                                            className="p-2 hover:bg-secondary/10 text-secondary rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <span className="material-symbols-outlined text-lg">edit</span>
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(item.id)}
                                            className="p-2 hover:bg-error/10 text-error rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <span className="material-symbols-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                </div>
                                <h4 className="text-xl font-black text-primary mb-2 line-clamp-1">{item.title}</h4>
                                <p className="text-sm text-on-surface-variant line-clamp-4 flex-1 opacity-70 leading-relaxed">
                                    {item.content}
                                </p>
                                <div className="mt-6 pt-4 border-t border-outline-variant/10 flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">
                                        {item.createdAt?.toDate ? new Date(item.createdAt.toDate()).toLocaleDateString() : 'Template'}
                                    </span>
                                    <a 
                                        href="#analyze" 
                                        className="text-[10px] font-black uppercase tracking-widest text-secondary hover:text-primary transition-colors"
                                        onClick={() => {
                                            // Optional: Pass this ID to analyze page in future
                                        }}
                                    >
                                        Launch Analysis
                                    </a>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
