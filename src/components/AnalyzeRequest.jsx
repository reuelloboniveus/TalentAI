import { useState } from 'react';
import { parseFile } from '../utils/fileParser';

export default function AnalyzeRequest({ onAnalyze, savedJDs = [], onSaveJD }) {
    const [mode, setMode] = useState('individual'); // 'individual' or 'bulk'
    const [jd, setJd] = useState('');
    const [resume, setResume] = useState('');
    const [bulkFiles, setBulkFiles] = useState([]);
    const [isParsing, setIsParsing] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [isJDSelectorOpen, setIsJDSelectorOpen] = useState(false);

    const handleSaveJD = () => {
        if (!jd.trim()) return;
        const title = prompt("Enter a title for this Job Description:");
        if (title) {
            onSaveJD(title, jd);
        }
    };

    const selectSavedJD = (item) => {
        setJd(item.content);
        setIsJDSelectorOpen(false);
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (mode === 'individual') {
            const file = files[0];
            if (file) {
                setIsParsing(true);
                try {
                    const text = await parseFile(file);
                    setResume(text);
                } catch (error) {
                    alert(error.message);
                } finally {
                    setIsParsing(false);
                }
            }
        } else {
            // Bulk Mode
            if (files.length + bulkFiles.length > 15) {
                alert("You can only upload a maximum of 15 resumes.");
                return;
            }

            const newFiles = files.map(file => ({
                file,
                name: file.name,
                status: 'pending'
            }));

            setBulkFiles(prev => [...prev, ...newFiles]);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const mockEvent = { target: { files: e.dataTransfer.files } };
            handleFileChange(mockEvent);
            e.dataTransfer.clearData();
        }
    };

    const removeFile = (index) => {
        setBulkFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (mode === 'individual') {
            if (jd && resume) {
                onAnalyze(jd, resume, 'individual');
            }
        } else {
            if (jd && bulkFiles.length > 0) {
                setIsParsing(true);
                try {
                    // Process files sequentially to avoid overloading the worker/memory
                    const resumes = [];
                    for (const item of bulkFiles) {
                        const text = await parseFile(item.file);
                        resumes.push({ name: item.name, text });
                    }
                    onAnalyze(jd, resumes, 'bulk');
                } catch (error) {
                    alert("Error parsing some files: " + error.message);
                } finally {
                    setIsParsing(false);
                }
            }
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Mode Switcher */}
            <div className="flex p-1 bg-surface-container-low rounded-xl w-full sm:w-fit mx-auto border border-outline-variant/10 overflow-x-auto">
                <button
                    onClick={() => { setMode('individual'); setBulkFiles([]); setResume(''); }}
                    className={`flex-1 sm:flex-none px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${mode === 'individual' ? 'bg-white shadow-sm text-secondary' : 'text-on-surface-variant hover:text-primary'}`}
                >
                    Individual Analysis
                </button>
                <button
                    onClick={() => { setMode('bulk'); setResume(''); }}
                    className={`flex-1 sm:flex-none px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all whitespace-nowrap ${mode === 'bulk' ? 'bg-white shadow-sm text-secondary' : 'text-on-surface-variant hover:text-primary'}`}
                >
                    Bulk Pipeline (Max 15)
                </button>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* JD Input */}
                <div className="col-span-12">
                    <div className="card shadow-xl shadow-primary/5">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                                    <span className="material-symbols-outlined text-secondary">description</span>
                                </div>
                                <div>
                                    <h3 className="text-xl font-headline font-black text-primary">Job Description</h3>
                                    <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">Requirement Vector</p>
                                </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <div className="relative flex-1 sm:flex-none">
                                    <button 
                                        onClick={() => setIsJDSelectorOpen(!isJDSelectorOpen)}
                                        className="w-full flex items-center justify-between sm:justify-start gap-2 px-4 py-2 bg-surface-container-low hover:bg-surface-container-high rounded-xl text-xs font-bold text-primary transition-all border border-outline-variant/10"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">library_books</span>
                                            {savedJDs.length > 0 ? "Library" : "Empty"}
                                        </div>
                                        <span className="material-symbols-outlined text-sm">expand_more</span>
                                    </button>
                                    
                                    {isJDSelectorOpen && savedJDs.length > 0 && (
                                        <div className="absolute left-0 right-0 sm:left-auto sm:right-0 top-full mt-2 sm:w-72 bg-white rounded-2xl shadow-2xl border border-outline-variant/20 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="p-3 border-b border-surface-container-low bg-surface-bright">
                                                <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Saved Templates</h4>
                                            </div>
                                            <div className="max-h-64 overflow-y-auto">
                                                {savedJDs.map((item) => (
                                                    <button
                                                        key={item.id}
                                                        onClick={() => selectSavedJD(item)}
                                                        className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-all group"
                                                    >
                                                        <div className="text-sm font-bold text-primary group-hover:text-secondary">{item.title}</div>
                                                        <div className="text-[10px] text-on-surface-variant line-clamp-1 opacity-60">{item.content}</div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button 
                                    onClick={handleSaveJD}
                                    disabled={!jd.trim()}
                                    className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary/10 hover:bg-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-xs font-bold text-secondary transition-all"
                                >
                                    <span className="material-symbols-outlined text-sm">save</span>
                                    Save
                                </button>
                            </div>
                        </div>
                        <textarea
                            className="input-field min-h-[200px] bg-surface-container-low border-2 border-transparent focus:border-secondary/20 focus:bg-white transition-all text-sm leading-relaxed"
                            placeholder="Paste the full job requirements and expectations here..."
                            value={jd}
                            onChange={(e) => setJd(e.target.value)}
                        />
                    </div>
                </div>


                {/* Resume Upload / Text Area Area */}
                <div className="col-span-12 lg:col-span-8">
                    {mode === 'individual' ? (
                        <div className="space-y-6">
                             <div 
                                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('individual-upload').click()}
                                className={`group border-2 border-dashed rounded-2xl py-12 px-10 text-center transition-all cursor-pointer bg-white ${
                                    dragging ? 'border-secondary bg-secondary/5' : 'border-outline-variant hover:border-secondary/50'
                                }`}
                            >
                                <input id="individual-upload" type="file" className="hidden" accept=".pdf,.txt" onChange={handleFileChange} />
                                <div className="w-16 h-16 bg-primary-fixed rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-primary text-3xl">upload_file</span>
                                </div>
                                <h4 className="font-headline font-bold text-lg text-primary">Upload Resume</h4>
                                <p className="text-sm text-on-surface-variant mb-4">Click to browse or drag & drop PDF/Text</p>
                                {resume && <p className="text-xs text-secondary font-black uppercase">Resume Loaded & Parsed <span className="material-symbols-outlined text-[10px] align-middle">check_circle</span></p>}
                            </div>

                            <div className="card">
                                <label className="label-text">Or Paste Resume Text</label>
                                <textarea
                                    className="input-field min-h-[250px] bg-surface-container-low text-xs"
                                    placeholder="If you don't have a file, paste the resume content here..."
                                    value={resume}
                                    onChange={(e) => setResume(e.target.value)}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div 
                                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                onDragLeave={() => setDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => bulkFiles.length < 15 && document.getElementById('bulk-upload').click()}
                                className={`group border-2 border-dashed rounded-2xl py-12 px-10 text-center transition-all cursor-pointer bg-white ${
                                    dragging ? 'border-secondary bg-secondary/5' : 'border-outline-variant hover:border-secondary/50'
                                } ${bulkFiles.length >= 15 ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                <input id="bulk-upload" type="file" className="hidden" accept=".pdf,.txt" multiple onChange={handleFileChange} />
                                <div className="w-16 h-16 bg-primary-fixed rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined text-primary text-3xl">library_add</span>
                                </div>
                                <h4 className="font-headline font-bold text-lg text-primary">{bulkFiles.length >= 15 ? 'Max Files Reached' : 'Upload Multiple Resumes'}</h4>
                                <p className="text-sm text-on-surface-variant">Batch process up to 15 resumes simultaneously</p>
                            </div>

                            {bulkFiles.length > 0 && (
                                <div className="bg-white rounded-2xl shadow-sm border border-outline-variant/10 overflow-hidden">
                                     <div className="px-6 py-4 bg-surface-container-low flex justify-between items-center">
                                        <h5 className="font-headline font-bold text-sm text-primary">Bulk Queue</h5>
                                        <button onClick={() => setBulkFiles([])} className="text-[10px] font-black uppercase text-error hover:underline">Clear All</button>
                                     </div>
                                     <div className="divide-y divide-surface-container-low">
                                        {bulkFiles.map((file, idx) => (
                                            <div key={idx} className="px-6 py-4 flex items-center justify-between group hover:bg-surface-bright">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-secondary text-lg">description</span>
                                                    <span className="text-sm font-medium text-primary line-clamp-1">{file.name}</span>
                                                </div>
                                                <button onClick={(e) => { e.stopPropagation(); removeFile(idx); }} className="p-1 text-on-surface-variant hover:text-error transition-colors">
                                                    <span className="material-symbols-outlined text-lg">close</span>
                                                </button>
                                            </div>
                                        ))}
                                     </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Action Sidebar */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-primary text-white rounded-2xl p-8 shadow-xl relative overflow-hidden h-[300px] flex flex-col justify-end">
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-pulse"></div>
                        <div className="relative z-10">
                            <h4 className="text-2xl font-headline font-black mb-4">AI Ready.</h4>
                            <p className="text-primary-fixed-dim text-sm leading-relaxed mb-8">Click start to initiate deep neural analysis and skill-match mapping.</p>
                            
                            <button 
                                onClick={handleSubmit}
                                disabled={!jd || (mode === 'individual' ? !resume : bulkFiles.length === 0) || isParsing}
                                className="w-full btn-primary flex items-center justify-center gap-3 py-4 shadow-2xl shadow-primary/50 group"
                            >
                                <span className="font-headline font-black text-lg">
                                    {isParsing ? 'Processing...' : 'Run Analysis'}
                                </span>
                                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </button>
                        </div>
                    </div>

                    <div className="card bg-surface-container-lowest">
                         <h5 className="font-headline font-bold text-primary mb-4">Precision Metrics</h5>
                         <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                                <span className="material-symbols-outlined text-secondary text-sm">verified_user</span>
                                150+ Semantic Vectors
                            </li>
                            <li className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                                <span className="material-symbols-outlined text-secondary text-sm">psychology</span>
                                Implicit Skill Detection
                            </li>
                             <li className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                                <span className="material-symbols-outlined text-secondary text-sm">trending_up</span>
                                Potential Trajectory Mapping
                            </li>
                         </ul>
                    </div>
                </div>
            </div>

            {/* Loading Overlay */}
            {isParsing && (
                 <div className="fixed inset-0 z-[110] bg-primary/40 backdrop-blur-md flex items-center justify-center">
                    <div className="bg-white p-10 rounded-3xl shadow-2xl flex flex-col items-center gap-6 max-w-sm text-center">
                        <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                        <div>
                            <h3 className="text-xl font-headline font-black text-primary mb-2">Engaging AI Engine</h3>
                            <p className="text-sm text-on-surface-variant">Converting documents into vectorized vectors for neural analysis...</p>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
}
