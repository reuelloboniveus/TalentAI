import { useState } from 'react';
import { parseFile } from '../utils/fileParser';
import { generateQuestions } from '../services/gemini_questions';

export default function QuestionsGenerator({ onCreditDeduct }) {
    const [jobRole, setJobRole] = useState('');
    const [resumeText, setResumeText] = useState('');
    const [questionsData, setQuestionsData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [copiedId, setCopiedId] = useState(null);
    const [expandedQuestion, setExpandedId] = useState({});

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        const file = files[0];
        if (file) {
            setIsParsing(true);
            try {
                const text = await parseFile(file);
                setResumeText(text);
            } catch (error) {
                alert(error.message || "Failed to parse resume.");
            } finally {
                setIsParsing(false);
            }
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!resumeText.trim()) return;

        setLoading(true);
        try {
            // Deduct 1 credit for questions generation
            if (onCreditDeduct) {
                const success = await onCreditDeduct(1);
                if (!success) {
                    setLoading(false);
                    return;
                }
            }

            const data = await generateQuestions(resumeText, jobRole);
            setQuestionsData(data);
        } catch (error) {
            alert(error.message || "An error occurred while generating questions.");
        } finally {
            setLoading(false);
        }
    };

    const handleCopyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const toggleExpand = (id) => {
        setExpandedId(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handlePrint = () => {
        window.print();
    };

    const handleReset = () => {
        setQuestionsData(null);
        setResumeText('');
        setJobRole('');
        setExpandedId({});
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="space-y-2">
                <h2 className="text-4xl lg:text-5xl font-black text-primary tracking-tight">Q&A Studio</h2>
                <p className="text-on-surface-variant text-lg font-medium opacity-70">Generate tailored, interview-ready screening questions directly from a candidate's resume.</p>
            </div>

            {!questionsData ? (
                <div className="grid grid-cols-12 gap-8">
                    {/* Input Form */}
                    <div className="col-span-12 lg:col-span-8 space-y-8">
                        <div className="card shadow-xl shadow-primary/5 bg-white dark:bg-[#081f33] p-8 rounded-[32px] border border-outline-variant/10">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Job Role (Optional) */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-primary dark:text-slate-300">Target Job Role <span className="opacity-50">(Optional)</span></label>
                                    <input
                                        type="text"
                                        value={jobRole}
                                        onChange={(e) => setJobRole(e.target.value)}
                                        placeholder="e.g. Lead React Developer, Python Backend Architect..."
                                        className="w-full bg-slate-50 dark:bg-[#041627] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20 dark:text-white outline-none transition-all"
                                    />
                                </div>

                                {/* Drag & Drop / File Upload */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-primary dark:text-slate-300">Candidate Resume</label>
                                    <div 
                                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                                        onDragLeave={() => setDragging(false)}
                                        onDrop={handleDrop}
                                        onClick={() => document.getElementById('resume-file-upload').click()}
                                        className={`group border-2 border-dashed rounded-2xl py-10 px-8 text-center transition-all cursor-pointer bg-slate-50 dark:bg-[#041627]/50 ${
                                            dragging ? 'border-secondary bg-secondary/5' : 'border-outline-variant hover:border-secondary/40'
                                        }`}
                                    >
                                        <input id="resume-file-upload" type="file" className="hidden" accept=".pdf,.txt" onChange={handleFileChange} />
                                        <div className="w-14 h-14 bg-primary-fixed rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-primary text-2xl">upload_file</span>
                                        </div>
                                        <h4 className="font-headline font-bold text-sm text-primary dark:text-white">Upload Resume File</h4>
                                        <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-1">PDF or plain text up to 5MB</p>
                                        {resumeText && <p className="text-xs text-emerald-500 font-bold uppercase mt-3 flex items-center justify-center gap-1"><span className="material-symbols-outlined text-sm">check_circle</span> Resume Loaded</p>}
                                    </div>
                                </div>

                                {/* Manual Resume Paste */}
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-[0.2em] text-primary dark:text-slate-300">Or Paste Resume Text</label>
                                    <textarea
                                        value={resumeText}
                                        onChange={(e) => setResumeText(e.target.value)}
                                        placeholder="Paste the plain text resume here..."
                                        className="w-full bg-slate-50 dark:bg-[#041627] border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20 dark:text-white outline-none transition-all min-h-[180px] leading-relaxed resize-y"
                                    />
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Launch Card */}
                    <div className="col-span-12 lg:col-span-4 space-y-6">
                        <div className="bg-primary text-white rounded-[32px] p-8 shadow-xl relative overflow-hidden h-[300px] flex flex-col justify-end">
                            <div className="absolute -right-16 -top-16 w-56 h-56 bg-secondary/20 rounded-full blur-3xl animate-pulse"></div>
                            <div className="relative z-10 space-y-6">
                                <div>
                                    <h4 className="text-2xl font-headline font-black mb-2">Ready to Engine Q&As?</h4>
                                    <p className="text-primary-fixed-dim text-xs leading-relaxed">Generates 5 basic yet highly professional questions with answers curated precisely from their background.</p>
                                </div>
                                <button 
                                    onClick={handleSubmit}
                                    disabled={!resumeText.trim() || loading || isParsing}
                                    className="w-full bg-[#ff7b54] hover:bg-[#ff8e66] disabled:opacity-40 text-white font-black text-sm uppercase tracking-widest py-4 px-6 rounded-xl flex items-center justify-center gap-3 shadow-lg hover:translate-y-[-2px] active:translate-y-[1px] transition-all"
                                >
                                    <span className="material-symbols-outlined text-base">psychology</span>
                                    <span>{loading ? 'Synthesizing...' : 'Generate Questions'}</span>
                                    <span className="material-symbols-outlined text-base">arrow_forward</span>
                                </button>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-[#081f33] rounded-3xl p-6 border border-outline-variant/10 space-y-4">
                            <h5 className="font-headline font-bold text-primary dark:text-slate-100 flex items-center gap-2 text-sm">
                                <span className="material-symbols-outlined text-secondary text-sm">info</span>
                                Recruitment Standards
                            </h5>
                             <ul className="space-y-3">
                                <li className="flex items-start gap-2 text-xs font-medium text-on-surface-variant dark:text-slate-300">
                                    <span className="material-symbols-outlined text-secondary text-base">filter_list</span>
                                    <span>**L1 Gatekeeper**: Designed specifically for initial HR screening to filter out resume fabrication.</span>
                                </li>
                                <li className="flex items-start gap-2 text-xs font-medium text-on-surface-variant dark:text-slate-300">
                                    <span className="material-symbols-outlined text-secondary text-base">fact_check</span>
                                    <span>**Strict Verifiability**: Tests actual metrics, systems, or responsibilities mentioned.</span>
                                </li>
                                <li className="flex items-start gap-2 text-xs font-medium text-on-surface-variant dark:text-slate-300">
                                    <span className="material-symbols-outlined text-secondary text-base">gavel</span>
                                    <span>**No Fake Answers**: Gives recruiters precise answer keys with targeted keyword checklist.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            ) : (
                /* Results Section */
                <div className="space-y-8 animate-in fade-in duration-500 max-w-[1200px] mx-auto print:bg-white print:text-black">
                    {/* Dashboard Header Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-6 bg-white dark:bg-[#081f33] rounded-2xl border border-outline-variant/10 print:hidden">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center">
                                <span className="material-symbols-outlined">badge</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-primary dark:text-white leading-none">
                                    {questionsData.candidate_name || "Extracted Candidate"}
                                </h3>
                                <p className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant dark:text-slate-400 mt-1">
                                    {jobRole ? `Screening for: ${jobRole}` : 'L1 Resume Screening Questionnaire'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-[#041627] hover:bg-slate-200 dark:hover:bg-[#081f33] text-primary dark:text-white font-bold text-xs rounded-xl transition-all border border-outline-variant/10"
                            >
                                <span className="material-symbols-outlined text-sm">print</span>
                                <span>Export / Print</span>
                            </button>
                            <button
                                onClick={handleReset}
                                className="flex items-center gap-2 px-4 py-2 bg-secondary text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-secondary/15 hover:translate-y-[-1px]"
                            >
                                <span className="material-symbols-outlined text-sm">refresh</span>
                                <span>Reset Studio</span>
                            </button>
                        </div>
                    </div>

                    {/* Print Only Header */}
                    <div className="hidden print:block space-y-4 mb-8">
                        <h1 className="text-3xl font-bold border-b pb-2">TalentAI L1 Screening Report</h1>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <div><strong>Candidate:</strong> {questionsData.candidate_name}</div>
                            <div><strong>Role:</strong> {jobRole || 'General Screening'}</div>
                        </div>
                    </div>

                    {/* Questions List */}
                    <div className="space-y-6">
                        {questionsData.questions?.map((item) => {
                            const isExpanded = expandedQuestion[item.id] || false;
                            return (
                                <div 
                                    key={item.id} 
                                    className="bg-white dark:bg-[#081f33] rounded-3xl border border-outline-variant/10 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
                                >
                                    {/* Question Card Header */}
                                    <div className="p-6 md:p-8 flex flex-col md:flex-row items-start justify-between gap-6">
                                        <div className="flex gap-4 items-start flex-1">
                                            <div className="w-10 h-10 bg-primary text-white rounded-xl font-headline font-black flex items-center justify-center shrink-0">
                                                {item.id}
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-secondary-fixed text-secondary tracking-widest leading-none">
                                                        {item.category}
                                                    </span>
                                                    <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 tracking-widest leading-none">
                                                        {item.difficulty}
                                                    </span>
                                                </div>
                                                <h4 className="text-base md:text-lg font-headline font-extrabold text-primary dark:text-white leading-snug">
                                                    {item.question}
                                                </h4>
                                            </div>
                                        </div>

                                        <div className="flex md:flex-col items-center gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-outline-variant/5">
                                            <button
                                                onClick={() => handleCopyToClipboard(item.question, item.id)}
                                                className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-on-surface-variant dark:text-slate-300 font-bold text-xs rounded-xl transition-colors border border-outline-variant/10"
                                                title="Copy Question to Clipboard"
                                            >
                                                <span className="material-symbols-outlined text-sm">
                                                    {copiedId === item.id ? 'check' : 'content_copy'}
                                                </span>
                                                <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                                            </button>

                                            <button
                                                onClick={() => toggleExpand(item.id)}
                                                className={`flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 font-bold text-xs rounded-xl transition-all border ${
                                                    isExpanded 
                                                        ? 'bg-primary/5 dark:bg-white/5 text-secondary border-secondary/20' 
                                                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-on-surface-variant dark:text-slate-300 border-outline-variant/10'
                                                }`}
                                            >
                                                <span className="material-symbols-outlined text-sm">
                                                    {isExpanded ? 'visibility_off' : 'visibility'}
                                                </span>
                                                <span>{isExpanded ? 'Hide Answer' : 'Reveal Answer'}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expandable Key Section */}
                                    {isExpanded && (
                                        <div className="p-6 md:p-8 bg-slate-50/50 dark:bg-[#041627]/40 border-t border-outline-variant/10 space-y-6 animate-in slide-in-from-top-2 duration-300 print:block">
                                            {/* Rationale */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-secondary dark:text-secondary-fixed-dim tracking-widest">
                                                    <span className="material-symbols-outlined text-sm">psychology</span>
                                                    <span>Question Rationale</span>
                                                </div>
                                                <p className="text-xs text-on-surface-variant dark:text-slate-300 font-medium leading-relaxed italic border-l-4 border-secondary dark:border-secondary-fixed-dim pl-3">
                                                    {item.rationale}
                                                </p>
                                            </div>

                                            {/* Ideal Answer Key */}
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-primary dark:text-slate-300 tracking-widest">
                                                    <span className="material-symbols-outlined text-sm">fact_check</span>
                                                    <span>Expected Answer Key & Keywords to Probe</span>
                                                </div>
                                                <p className="text-sm text-primary dark:text-slate-200 leading-relaxed bg-white dark:bg-[#081f33] p-5 rounded-2xl border border-outline-variant/5">
                                                    {item.expected_answer}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Parsing/Processing Overlay */}
            {isParsing && (
                 <div className="fixed inset-0 z-[110] bg-primary/40 backdrop-blur-md flex items-center justify-center">
                    <div className="bg-white p-10 rounded-3xl shadow-2xl flex flex-col items-center gap-6 max-w-sm text-center">
                        <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                        <div>
                            <h3 className="text-xl font-headline font-black text-primary mb-2">Ingesting Resume</h3>
                            <p className="text-sm text-on-surface-variant">Converting documents into plain text context...</p>
                        </div>
                    </div>
                 </div>
            )}

            {/* Generating Overlay */}
            {loading && (
                 <div className="fixed inset-0 z-[110] bg-primary/40 backdrop-blur-md flex items-center justify-center">
                    <div className="bg-white p-10 rounded-3xl shadow-2xl flex flex-col items-center gap-6 max-w-md text-center">
                        <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                        <div>
                            <h3 className="text-xl font-headline font-black text-primary mb-2">Cognitive Questioning</h3>
                            <p className="text-sm text-on-surface-variant mb-1">Vertex AI is evaluating details of the resume to design deep questions...</p>
                            <span className="text-[10px] text-secondary font-black uppercase tracking-widest">Constructing L1 Gatekeeper Key</span>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    );
}
