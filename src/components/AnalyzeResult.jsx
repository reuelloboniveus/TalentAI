import React, { useState, useMemo } from 'react';

// Single Profile Detail View Component
function SingleResult({ result, onBack }) {
    if (!result) return null;

    const { 
        score, 
        resumeName, 
        profile_fit_analysis, 
        insights, 
        matching_skills = [], 
        missing_skills = [], 
        strong_areas = [] 
    } = result;

    // Normalize score for display (handles transition from 100 to 10)
    const displayScore = score > 10 ? Math.round(score / 10) : score;
    const percentageScore = displayScore * 10;
    
    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {onBack && (
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-secondary hover:translate-x-[-4px] transition-transform mb-6 font-semibold"
                >
                    <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
                    Back to Leaderboard
                </button>
            )}

            {/* Hero Profile Section */}
            <div className="grid grid-cols-12 gap-8 mb-8">
                <div className="col-span-12 lg:col-span-8">
                    <div className="flex items-start gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center shadow-xl shadow-primary/10">
                            <span className="material-symbols-outlined text-4xl text-white">person</span>
                        </div>
                        <div>
                            <h1 className="text-3xl font-extrabold text-primary tracking-tight mb-1">{resumeName || 'Candidate Profile'}</h1>
                            <p className="text-base font-semibold text-secondary mb-3">AI-Analyzed Resume</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 bg-surface-container-high rounded-full text-[10px] font-bold uppercase tracking-wider text-on-surface-variant italic border border-slate-100">Processed by Gemini Pro</span>
                                {displayScore >= 8 && (
                                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                                        Top Fit
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">Executive Summary</h3>
                        <p className="text-on-surface text-sm leading-relaxed max-w-5xl">
                            {profile_fit_analysis || "The candidate profile shows a strong alignment with the technical requirements of the role. The following breakdown highlights specific strengths and areas for growth identified by our AI analysis engine."}
                        </p>
                    </div>
                </div>

                {/* Scorecard */}
                <div className="col-span-12 lg:col-span-4">
                    <div className="bg-primary-container p-6 rounded-2xl relative overflow-hidden h-full flex flex-col justify-between shadow-2xl shadow-primary/10 border border-primary/20">
                        <div className="relative z-10">
                            <h3 className="text-primary-fixed text-xs font-bold uppercase tracking-widest mb-1 opacity-80">AI Relevance Score</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-6xl font-extrabold text-white">{displayScore}</span>
                                <span className="text-xl font-bold text-primary-fixed-dim">/ 10</span>
                            </div>
                        </div>
                        <div className="relative z-10 mt-6 space-y-3">
                            <div className="flex justify-between items-center text-xs text-primary-fixed-dim">
                                <span>Match Probability</span>
                                <span className="text-white font-bold">{displayScore >= 8 ? 'Highly Qualified' : displayScore >= 5 ? 'Potentially Qualified' : 'Underqualified'}</span>
                            </div>
                            <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="bg-secondary h-full rounded-full shadow-[0_0_12px_rgba(0,112,234,0.5)] transition-all duration-1000 ease-out"
                                    style={{ width: `${percentageScore}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-secondary/20 rounded-full blur-3xl"></div>
                    </div>
                </div>
            </div>

            {/* Analysis Grid */}
            <div className="grid grid-cols-12 gap-6">
                {/* Dimensional Analysis */}
                <div className="col-span-12 md:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-primary">Dimensional Analysis</h3>
                        <span className="material-symbols-outlined text-outline" title="Skills comparison breakdown">info</span>
                    </div>
                    <div className="space-y-6">
                        <div className="group">
                            <div className="flex justify-between mb-2">
                                <span className="text-xs font-bold text-on-surface">Matching Skills</span>
                                <span className="text-xs font-bold text-emerald-600">{matching_skills.length} identified</span>
                            </div>
                            <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="bg-emerald-500 h-full transition-all duration-1000 group-hover:bg-emerald-400"
                                    style={{ width: matching_skills.length > 0 ? `${Math.min(matching_skills.length * 10, 100)}%` : '0%' }}
                                ></div>
                            </div>
                            <p className="text-[11px] text-on-surface-variant mt-1.5">Core competencies found in both the job description and the resume.</p>
                        </div>
                        
                        <div className="group">
                            <div className="flex justify-between mb-2">
                                <span className="text-xs font-bold text-on-surface">Missing Skills</span>
                                <span className="text-xs font-bold text-rose-600">{missing_skills.length} gaps</span>
                            </div>
                            <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="bg-rose-500 h-full transition-all duration-1000 group-hover:bg-rose-400"
                                    style={{ width: missing_skills.length > 0 ? `${Math.min(missing_skills.length * 15, 100)}%` : '0%' }}
                                ></div>
                            </div>
                            <p className="text-[11px] text-on-surface-variant mt-1.5">Skills explicitly mentioned in the job post but not clearly stated in the resume.</p>
                        </div>

                        {strong_areas.length > 0 && (
                            <div className="group">
                                <div className="flex justify-between mb-2">
                                    <span className="text-xs font-bold text-on-surface">Growth Areas</span>
                                    <span className="text-xs font-bold text-amber-600">{strong_areas.length} highlighted</span>
                                </div>
                                <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                                    <div 
                                        className="bg-amber-500 h-full transition-all duration-1000 group-hover:bg-amber-400"
                                        style={{ width: `${Math.min(strong_areas.length * 20, 100)}%` }}
                                    ></div>
                                </div>
                                <p className="text-[11px] text-on-surface-variant mt-1.5">Specific areas where the candidate demonstrates exceptional depth.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Expertise Detail Mapping */}
                <div className="col-span-12 md:col-span-5 bg-surface-container-low p-6 rounded-2xl border border-slate-100">
                    <h3 className="text-lg font-bold text-primary mb-5">Expertise Mapping</h3>
                    
                    <div className="space-y-5">
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-emerald-700 mb-2 bg-emerald-100/60 w-fit px-2 py-0.5 rounded">Matching</p>
                            <div className="flex flex-wrap gap-1.5">
                                {matching_skills.length > 0 ? (
                                    matching_skills.map((skill, i) => (
                                        <span key={i} className="px-2 py-1 bg-white text-emerald-700 border border-emerald-100 rounded-lg text-xs font-semibold shadow-sm">
                                            {skill}
                                        </span>
                                    ))
                                ) : <span className="text-xs text-slate-400 italic">No matching skills identified</span>}
                            </div>
                        </div>

                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-rose-700 mb-2 bg-rose-100/60 w-fit px-2 py-0.5 rounded">Missing</p>
                            <div className="flex flex-wrap gap-1.5">
                                {missing_skills.length > 0 ? (
                                    missing_skills.map((skill, i) => (
                                        <span key={i} className="px-2 py-1 bg-white text-rose-700 border border-rose-100 rounded-lg text-xs font-semibold shadow-sm">
                                            {skill}
                                        </span>
                                    ))
                                ) : <span className="text-xs text-slate-400 italic">No missing skills identified</span>}
                            </div>
                        </div>

                        {strong_areas.length > 0 && (
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-amber-700 mb-2 bg-amber-100/60 w-fit px-2 py-0.5 rounded">Strong Areas</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {strong_areas.map((area, i) => (
                                        <span key={i} className="px-2 py-1 bg-white text-amber-700 border border-amber-100 rounded-lg text-xs font-semibold shadow-sm">
                                            {area}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Insight Overlay */}
                <div className="col-span-12 bg-white p-6 rounded-2xl border border-slate-100 relative overflow-hidden shadow-xl shadow-primary/5">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                        </div>
                        <h3 className="text-xl font-black text-primary tracking-tight">AI Curated Insights</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50/50 rounded-xl border-l-4 border-secondary shadow-sm">
                                <h4 className="text-xs font-bold text-secondary mb-1 flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-sm font-bold">lightbulb</span>
                                    Key Findings
                                </h4>
                                <p className="text-xs text-on-surface leading-relaxed">
                                    {insights || "The analysis suggests the candidate is a solid technical fit for the role. Focus on their growth potential in specific domains during technical rounds."}
                                </p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <h4 className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-1.5">
                                Suggested Discussion Points
                            </h4>
                            <ul className="space-y-3">
                                {missing_skills.slice(0, 3).map((skill, i) => (
                                    <li key={i} className="flex gap-3 group">
                                        <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-500 group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0">{i+1}</span>
                                        <span className="text-xs text-on-surface">Explore their familiarity with <span className="font-semibold text-primary">{skill}</span> and related technologies.</span>
                                    </li>
                                ))}
                                {matching_skills.slice(0, 2).map((skill, i) => (
                                    <li key={i+3} className="flex gap-3 group">
                                        <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors flex-shrink-0">{i+4}</span>
                                        <span className="text-xs text-on-surface">Verify depth of experience with <span className="font-semibold text-emerald-600">{skill}</span> in their recent roles.</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex justify-between items-center border-t border-slate-100 pt-6">
                <div className="flex items-center gap-3">
                    <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-primary rounded-xl font-bold flex items-center gap-1.5 transition-colors border border-slate-200 text-xs shadow-sm">
                        <span className="material-symbols-outlined text-sm font-bold">download</span>
                        Export PDF
                    </button>
                    <button className="px-4 py-2 bg-white text-on-surface-variant hover:bg-slate-50 rounded-xl font-bold flex items-center gap-1.5 transition-colors border border-slate-100 text-xs shadow-sm">
                        <span className="material-symbols-outlined text-sm font-bold">share</span>
                        Share Draft
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <button className="px-6 py-2 bg-gradient-to-br from-primary to-primary-container text-white rounded-xl font-bold shadow-xl shadow-primary/20 hover:-translate-y-0.5 active:scale-95 transition-all text-xs">
                        Move to Interview
                    </button>
                </div>
            </div>
        </div>
    );
}

// Custom radial match progress circle
function MatchRadialScore({ score, size = 52 }) {
    const displayScore = score > 10 ? Math.round(score / 10) : score;
    const percentage = displayScore * 10;
    const radius = 20;
    const strokeWidth = 3.5;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    // Set colors according to fit level
    const progressColor = displayScore >= 8 
        ? 'text-emerald-500' 
        : displayScore >= 5 
            ? 'text-amber-500' 
            : 'text-rose-500';

    return (
        <div className="relative inline-flex items-center justify-center select-none" style={{ width: size, height: size }}>
            <svg className="w-full h-full transform -rotate-90">
                {/* Background Ring */}
                <circle
                    className="text-slate-100"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                {/* Active Progress Ring */}
                <circle
                    className={`${progressColor} transition-all duration-1000 ease-out`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            {/* Center Score Number */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[14px] font-black text-slate-800 tracking-tight">{displayScore}</span>
                <span className="text-[8px] font-bold text-slate-400 -mt-1">/10</span>
            </div>
        </div>
    );
}

// Tabbed Card Component
function CandidateCard({ 
    candidate, 
    rank, 
    onSelect, 
    status, 
    onSetStatus 
}) {
    const [activeTab, setActiveTab] = useState('overview');
    const [isExpanded, setIsExpanded] = useState(false);

    const { 
        score, 
        resumeName, 
        profile_fit_analysis, 
        insights, 
        matching_skills = [], 
        missing_skills = [], 
        strong_areas = [] 
    } = candidate;

    const displayScore = score > 10 ? Math.round(score / 10) : score;

    // Shortlist / Pass styles
    const isShortlisted = status === 'shortlisted';
    const isPassed = status === 'passed';

    let cardBorderClass = 'border-slate-100';
    let cardBgClass = 'bg-white';
    let cardOverlayClass = '';

    if (isShortlisted) {
        cardBorderClass = 'border-emerald-500 shadow-lg shadow-emerald-500/5 ring-2 ring-emerald-500/10';
        cardBgClass = 'bg-emerald-50/20';
    } else if (isPassed) {
        cardBorderClass = 'border-slate-200 opacity-60';
        cardBgClass = 'bg-slate-50/50';
        cardOverlayClass = 'grayscale';
    }

    const rankBg = rank === 1 
        ? 'bg-amber-50 text-amber-600 border-amber-200' 
        : rank === 2 
            ? 'bg-gray-50 text-gray-500 border-gray-200' 
            : rank === 3 
                ? 'bg-orange-50 text-orange-500 border-orange-200' 
                : 'bg-gray-50 text-gray-400 border-gray-100';

    return (
        <div className={`group flex flex-col justify-between p-5 border rounded-2xl transition-all duration-300 relative overflow-hidden h-full ${cardBorderClass} ${cardBgClass} ${cardOverlayClass}`}>
            {rank === 1 && !isShortlisted && !isPassed && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-300 to-amber-400"></div>
            )}

            <div>
                {/* Header Section */}
                <div className="flex justify-between items-start gap-3 mb-3">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${rankBg}`}>
                                #{rank}
                            </span>
                            
                            {isShortlisted && (
                                <span className="px-1.5 py-0.5 bg-emerald-500 text-white rounded-md text-[10px] font-medium flex items-center gap-0.5">
                                    <span className="material-symbols-outlined text-[10px]">check</span>
                                    Shortlisted
                                </span>
                            )}

                            {isPassed && (
                                <span className="px-1.5 py-0.5 bg-gray-300 text-white rounded-md text-[10px] font-medium flex items-center gap-0.5">
                                    Passed
                                </span>
                            )}
                        </div>

                        <h3 className="text-[14px] font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1 pr-2" title={resumeName}>
                            {resumeName}
                        </h3>
                    </div>

                    {/* Radial Score Indicator */}
                    <div className="flex-shrink-0">
                        <MatchRadialScore score={score} />
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-100 mb-3">
                    {[
                        { id: 'overview', label: 'Overview', icon: 'description' },
                        { id: 'skills', label: 'Skills', icon: 'rule' },
                        { id: 'insights', label: 'Insights', icon: 'analytics' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveTab(tab.id);
                            }}
                            className={`flex-1 py-2 px-2 text-[11px] font-medium flex items-center justify-center gap-1 transition-all border-b-2 -mb-px ${
                                activeTab === tab.id
                                    ? 'border-gray-800 text-gray-800'
                                    : 'border-transparent text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: activeTab === tab.id ? "'FILL' 1" : "" }}>
                                {tab.icon}
                            </span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Contents */}
                <div className="min-h-[160px] flex flex-col justify-between mb-4">
                    {activeTab === 'overview' && (
                        <div className="relative">
                            <div 
                                className={`text-[12px] text-gray-500 leading-relaxed transition-all duration-300 ${
                                    isExpanded ? '' : 'line-clamp-5 max-h-[105px] overflow-hidden'
                                }`}
                            >
                                {profile_fit_analysis || "No executive summary available for this profile."}
                            </div>
                            
                            {!isExpanded && profile_fit_analysis && profile_fit_analysis.length > 200 && (
                                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none"></div>
                            )}

                            {profile_fit_analysis && profile_fit_analysis.length > 200 && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsExpanded(!isExpanded);
                                    }}
                                    className="text-[11px] font-medium text-blue-500 hover:text-blue-700 mt-1.5 flex items-center gap-0.5"
                                >
                                    {isExpanded ? (
                                        <>Less <span className="material-symbols-outlined text-xs">expand_less</span></>
                                    ) : (
                                        <>Read more <span className="material-symbols-outlined text-xs">expand_more</span></>
                                    )}
                                </button>
                            )}
                        </div>
                    )}

                    {activeTab === 'skills' && (
                        <div className="space-y-3.5">
                            {/* Matching Skills */}
                            <div>
                                <div className="text-[9px] font-black uppercase tracking-wider text-emerald-800 mb-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    Matching Skills ({matching_skills.length})
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {matching_skills.slice(0, 4).map((skill, i) => (
                                        <span key={i} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded text-[9px] font-bold border border-emerald-100/50">
                                            {skill}
                                        </span>
                                    ))}
                                    {matching_skills.length > 4 && (
                                        <span className="px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded text-[9px] font-bold border border-slate-100">
                                            +{matching_skills.length - 4} more
                                        </span>
                                    )}
                                    {matching_skills.length === 0 && (
                                        <span className="text-[10px] text-slate-400 italic">None identified</span>
                                    )}
                                </div>
                            </div>

                            {/* Missing Skills */}
                            <div>
                                <div className="text-[9px] font-black uppercase tracking-wider text-rose-800 mb-1 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                                    Missing Gaps ({missing_skills.length})
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    {missing_skills.slice(0, 4).map((skill, i) => (
                                        <span key={i} className="px-1.5 py-0.5 bg-rose-50 text-rose-700 rounded text-[9px] font-bold border border-rose-100/50">
                                            {skill}
                                        </span>
                                    ))}
                                    {missing_skills.length > 4 && (
                                        <span className="px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded text-[9px] font-bold border border-slate-100">
                                            +{missing_skills.length - 4} more
                                        </span>
                                    )}
                                    {missing_skills.length === 0 && (
                                        <span className="text-[10px] text-slate-400 italic">None identified</span>
                                    )}
                                </div>
                            </div>

                            {/* Strong Areas */}
                            {strong_areas.length > 0 && (
                                <div>
                                    <div className="text-[9px] font-black uppercase tracking-wider text-amber-800 mb-1 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                        Strong Pillars ({strong_areas.length})
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {strong_areas.slice(0, 3).map((area, i) => (
                                            <span key={i} className="px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[9px] font-bold border border-amber-100/50" title={area}>
                                                {area}
                                            </span>
                                        ))}
                                        {strong_areas.length > 3 && (
                                            <span className="px-1.5 py-0.5 bg-slate-50 text-slate-400 rounded text-[9px] font-bold border border-slate-100">
                                                +{strong_areas.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'insights' && (
                        <div className="space-y-3">
                            <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
                                <h4 className="text-[9px] font-black text-secondary flex items-center gap-1 mb-1">
                                    <span className="material-symbols-outlined text-xs font-bold text-amber-500">lightbulb</span>
                                    Key Findings
                                </h4>
                                <p className="text-[11px] text-on-surface-variant leading-relaxed line-clamp-3">
                                    {insights || "Solid core skills aligned with candidate rank. Verify growth in technical rounds."}
                                </p>
                            </div>
                            
                            <div className="space-y-1.5">
                                <h4 className="text-[8px] font-black uppercase tracking-wider text-slate-400">
                                    Interview Strategy
                                </h4>
                                {missing_skills.length > 0 ? (
                                    <div className="text-[11px] text-on-surface leading-normal flex items-start gap-1">
                                        <span className="material-symbols-outlined text-[12px] font-black text-rose-500 mt-0.5">contact_support</span>
                                        <span>Ask: depth of experience with <strong className="text-primary font-bold">{missing_skills[0]}</strong>.</span>
                                    </div>
                                ) : matching_skills.length > 0 ? (
                                    <div className="text-[11px] text-on-surface leading-normal flex items-start gap-1">
                                        <span className="material-symbols-outlined text-[12px] font-black text-emerald-500 mt-0.5">contact_support</span>
                                        <span>Verify: success using <strong className="text-emerald-600 font-bold">{matching_skills[0]}</strong>.</span>
                                    </div>
                                ) : (
                                    <div className="text-[11px] text-slate-400 italic">No interview strategies suggested.</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-gray-100 mt-auto">
                <div className="flex items-center justify-between gap-2">
                    <button
                        type="button"
                        onClick={onSelect}
                        className="text-[12px] font-medium text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-0.5 cursor-pointer"
                    >
                        View details
                        <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                        {isPassed ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onSetStatus(null);
                                }}
                                className="px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 text-[11px] font-medium transition-all flex items-center gap-0.5"
                                title="Re-evaluate candidate"
                            >
                                <span className="material-symbols-outlined text-[12px]">undo</span>
                                Restore
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSetStatus(isShortlisted ? null : 'shortlisted');
                                    }}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-0.5 border ${
                                        isShortlisted 
                                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                                            : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-500'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                    {isShortlisted ? 'Saved' : 'Shortlist'}
                                </button>

                                {!isShortlisted && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSetStatus('passed');
                                        }}
                                        className="p-1 rounded-md bg-white hover:bg-gray-50 border border-gray-200 text-gray-300 hover:text-rose-400 transition-all flex items-center justify-center"
                                        title="Pass candidate"
                                    >
                                        <span className="material-symbols-outlined text-[14px]">block</span>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Interactive Table Row Component for List View
function CandidateTableRow({ 
    candidate, 
    rank, 
    onSelect, 
    status, 
    onSetStatus,
    isExpanded,
    onToggleExpand
}) {
    const { 
        score, 
        resumeName, 
        matching_skills = [], 
        missing_skills = [] 
    } = candidate;

    const displayScore = score > 10 ? Math.round(score / 10) : score;

    const isShortlisted = status === 'shortlisted';
    const isPassed = status === 'passed';

    let rowBgClass = 'bg-white';
    let rowBorderClass = 'border-slate-100';
    let rowOpacityClass = '';

    if (isShortlisted) {
        rowBgClass = 'bg-emerald-50/10 hover:bg-emerald-50/20';
        rowBorderClass = 'border-emerald-100';
    } else if (isPassed) {
        rowBgClass = 'bg-slate-50/50 hover:bg-slate-50';
        rowOpacityClass = 'grayscale opacity-60';
    } else {
        rowBgClass = 'hover:bg-slate-50/50';
    }

    return (
        <>
            <tr 
                onClick={onToggleExpand}
                className={`border-b transition-all cursor-pointer ${rowBgClass} ${rowBorderClass} ${rowOpacityClass}`}
            >
                {/* Expand Chevron & Rank */}
                <td className="py-4 px-4 font-bold text-slate-400 text-center w-14">
                    <div className="flex items-center justify-center gap-1.5">
                        <span className={`material-symbols-outlined text-base font-bold text-slate-400 transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                            chevron_right
                        </span>
                        <span className={`
                            w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black border
                            ${rank === 1 ? 'bg-amber-100 text-amber-800 border-amber-200' : rank === 2 ? 'bg-slate-100 text-slate-700 border-slate-200' : rank === 3 ? 'bg-orange-100 text-orange-800 border-orange-200' : 'bg-slate-50 text-slate-400 border-slate-100'}
                        `}>
                            #{rank}
                        </span>
                    </div>
                </td>

                {/* Candidate Name & Info */}
                <td className="py-4 px-4">
                    <div>
                        <div className="text-sm font-extrabold text-primary flex items-center gap-2">
                            {resumeName}
                            {isShortlisted && (
                                <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[8px] font-black uppercase tracking-wider">
                                    Shortlist
                                </span>
                            )}
                            {isPassed && (
                                <span className="px-1.5 py-0.5 bg-slate-200 text-slate-500 rounded text-[8px] font-black uppercase tracking-wider">
                                    Passed
                                </span>
                            )}
                        </div>
                        <div className="text-[10px] text-on-surface-variant flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-0.5 text-emerald-600 font-bold">
                                <span className="material-symbols-outlined text-[10px] font-black">check</span>
                                {matching_skills.length} skills matched
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="flex items-center gap-0.5 text-rose-600 font-bold">
                                <span className="material-symbols-outlined text-[10px] font-black">warning</span>
                                {missing_skills.length} gaps
                            </span>
                        </div>
                    </div>
                </td>

                {/* Match Score Radial */}
                <td className="py-4 px-4 text-center w-28">
                    <div className="flex justify-center">
                        <MatchRadialScore score={score} size={42} />
                    </div>
                </td>

                {/* Visual Skills Breakdown progress */}
                <td className="py-4 px-4 hidden sm:table-cell max-w-[200px]">
                    <div className="space-y-1">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                            <span>Skills Coverage</span>
                            <span className="text-slate-600">{matching_skills.length} / {matching_skills.length + missing_skills.length}</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
                            {matching_skills.length > 0 && (
                                <div 
                                    className="bg-emerald-500 h-full" 
                                    style={{ width: `${(matching_skills.length / (matching_skills.length + missing_skills.length || 1)) * 100}%` }}
                                ></div>
                            )}
                            {missing_skills.length > 0 && (
                                <div 
                                    className="bg-rose-400 h-full" 
                                    style={{ width: `${(missing_skills.length / (matching_skills.length + missing_skills.length || 1)) * 100}%` }}
                                ></div>
                            )}
                        </div>
                    </div>
                </td>

                {/* Actions Section */}
                <td className="py-4 px-4 text-right w-44">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={onSelect}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-lg text-[10px] font-extrabold transition-all"
                        >
                            Detail Fit
                        </button>

                        {isPassed ? (
                            <button
                                type="button"
                                onClick={() => onSetStatus(null)}
                                className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-bold transition-all flex items-center gap-0.5"
                            >
                                <span className="material-symbols-outlined text-[10px] font-black">undo</span>
                                Restore
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => onSetStatus(isShortlisted ? null : 'shortlisted')}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-0.5 border ${
                                        isShortlisted 
                                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm' 
                                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600'
                                    }`}
                                >
                                    <span className="material-symbols-outlined text-[10px] font-black">check</span>
                                    {isShortlisted ? 'Saved' : 'Shortlist'}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => onSetStatus('passed')}
                                    className="p-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-400 hover:text-rose-500 transition-all flex items-center justify-center"
                                    title="Pass candidate"
                                >
                                    <span className="material-symbols-outlined text-sm font-bold">block</span>
                                </button>
                            </>
                        )}
                    </div>
                </td>
            </tr>

            {/* Inline Dashboard Expansion Row */}
            {isExpanded && (
                <tr className="bg-slate-50/40 border-b border-slate-100">
                    <td colSpan="5" className="p-5">
                        <div className="bg-white rounded-2xl border border-slate-100 p-1 shadow-sm max-w-4xl mx-auto animate-in fade-in slide-in-from-top-2 duration-300">
                            <CandidateCard 
                                candidate={candidate} 
                                rank={rank} 
                                onSelect={onSelect} 
                                status={status} 
                                onSetStatus={onSetStatus}
                            />
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}

// Main Component
export default function AnalyzeResult({ result, onReset }) {
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    // Dashboard Search, Filter, Sort and Action states
    const [searchQuery, setSearchQuery] = useState('');
    const [minScore, setMinScore] = useState(0);
    const [activeFilterPreset, setActiveFilterPreset] = useState('all');
    const [sortField, setSortField] = useState('score'); // 'score' | 'name' | 'rank'
    const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
    const [candidateStatuses, setCandidateStatuses] = useState({}); // { [name]: 'shortlisted' | 'passed' | null }
    const [expandedCandidateRows, setExpandedCandidateRows] = useState({}); // { [name]: boolean }

    if (!result) return null;

    const isBulk = Array.isArray(result);

    // Calculate processed & sorted candidates
    const processedCandidates = useMemo(() => {
        if (!isBulk) return [];

        // 1. First assign original ranks based on initial score sorting
        const withOriginalIndex = [...result]
            .sort((a, b) => b.score - a.score)
            .map((c, idx) => ({
                ...c,
                originalRank: idx + 1,
                displayScore: c.score > 10 ? Math.round(c.score / 10) : c.score
            }));

        // 2. Apply advanced searching
        let filtered = withOriginalIndex.filter(candidate => {
            const query = searchQuery.trim().toLowerCase();
            if (!query) return true;

            const nameMatch = candidate.resumeName?.toLowerCase().includes(query);
            const matchingSkillsMatch = candidate.matching_skills?.some(s => s.toLowerCase().includes(query));
            const missingSkillsMatch = candidate.missing_skills?.some(s => s.toLowerCase().includes(query));
            const strongAreasMatch = candidate.strong_areas?.some(s => s.toLowerCase().includes(query));

            return nameMatch || matchingSkillsMatch || missingSkillsMatch || strongAreasMatch;
        });

        // 3. Apply relevance score slider filter
        filtered = filtered.filter(candidate => candidate.displayScore >= minScore);

        // 4. Apply preset filters
        if (activeFilterPreset === 'top') {
            filtered = filtered.filter(candidate => candidate.displayScore >= 8);
        } else if (activeFilterPreset === 'strong') {
            filtered = filtered.filter(candidate => (candidate.matching_skills?.length || 0) >= 5);
        } else if (activeFilterPreset === 'gaps') {
            filtered = filtered.filter(candidate => (candidate.missing_skills?.length || 0) >= 4 || candidate.displayScore < 5);
        }

        // 5. Apply sorting
        filtered.sort((a, b) => {
            let comparison = 0;
            if (sortField === 'score') {
                comparison = b.score - a.score;
            } else if (sortField === 'name') {
                comparison = a.resumeName.localeCompare(b.resumeName);
            } else if (sortField === 'rank') {
                comparison = a.originalRank - b.originalRank;
            }

            return sortOrder === 'asc' ? comparison * -1 : comparison;
        });

        return filtered;
    }, [result, isBulk, searchQuery, minScore, activeFilterPreset, sortField, sortOrder]);

    // Handle single result detail back flow
    if (isBulk && selectedCandidate) {
        return <SingleResult result={selectedCandidate} onBack={() => setSelectedCandidate(null)} />;
    }

    if (!isBulk) {
        // Individual View (Single result mode)
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div>
                        <h2 className="text-2xl font-black text-primary tracking-tight">Analysis Result</h2>
                        <p className="text-on-surface-variant text-sm font-semibold">Deep AI review completed</p>
                    </div>
                    <button 
                        onClick={onReset}
                        className="btn-primary-outline flex items-center gap-1.5 text-xs"
                    >
                        <span className="material-symbols-outlined text-sm font-bold">refresh</span>
                        New Analysis
                    </button>
                </div>
                <SingleResult result={result} />
            </div>
        );
    }

    // Toggle row expansion in list view
    const handleToggleExpandRow = (name) => {
        setExpandedCandidateRows(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    // Preset counts
    const counts = {
        all: result.length,
        top: result.filter(c => (c.score > 10 ? Math.round(c.score / 10) : c.score) >= 8).length,
        strong: result.filter(c => (c.matching_skills?.length || 0) >= 5).length,
        gaps: result.filter(c => (c.missing_skills?.length || 0) >= 4 || (c.score > 10 ? Math.round(c.score / 10) : c.score) < 5).length
    };

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-5">
            
            {/* Top Leaderboard Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Candidates</h2>
                    <p className="text-gray-400 text-[13px] mt-0.5">
                        {result.length} profiles analyzed &middot; Ranked by AI match score
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    {/* Grid/List Segmented Control */}
                    <div className="bg-gray-100 p-0.5 rounded-lg flex items-center">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-1.5 rounded-md text-[12px] font-semibold flex items-center gap-1 transition-all ${
                                viewMode === 'grid'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[14px]">grid_view</span>
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-1.5 rounded-md text-[12px] font-semibold flex items-center gap-1 transition-all ${
                                viewMode === 'list'
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[14px]">view_list</span>
                            List
                        </button>
                    </div>
                    <button 
                        onClick={onReset}
                        className="px-3.5 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg font-medium text-[12px] transition-colors flex items-center gap-1.5 whitespace-nowrap bg-white"
                    >
                        <span className="material-symbols-outlined text-[14px]">refresh</span>
                        Re-Analyze
                    </button>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                
                {/* Search */}
                <div className="relative flex-1 min-w-0 max-w-sm">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[16px] text-gray-300">search</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search candidates…"
                        className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all text-gray-700 placeholder:text-gray-300"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                        >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                        </button>
                    )}
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-7 bg-gray-100"></div>

                {/* Score Filter */}
                <div className="flex items-center gap-2 min-w-[180px]">
                    <span className="text-[12px] text-gray-400 font-medium whitespace-nowrap">Min score</span>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={minScore}
                        onChange={(e) => setMinScore(Number(e.target.value))}
                        className="flex-1 h-1 bg-gray-100 rounded-full appearance-none cursor-pointer accent-blue-500"
                    />
                    <span className="text-[12px] font-semibold text-gray-600 w-6 text-center">{minScore || '—'}</span>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-7 bg-gray-100"></div>

                {/* Quick Filters */}
                <div className="flex flex-wrap gap-1.5">
                    {[
                        { id: 'all', label: 'All', count: counts.all },
                        { id: 'top', label: 'Top Fit', count: counts.top },
                        { id: 'strong', label: 'Strong Tech', count: counts.strong },
                        { id: 'gaps', label: 'Needs Review', count: counts.gaps }
                    ].map(preset => (
                        <button
                            key={preset.id}
                            onClick={() => setActiveFilterPreset(preset.id)}
                            className={`px-2.5 py-1 rounded-md text-[12px] font-medium transition-all flex items-center gap-1.5 ${
                                activeFilterPreset === preset.id
                                    ? 'bg-gray-900 text-white'
                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                            }`}
                        >
                            {preset.label}
                            <span className={`text-[10px] font-semibold ${
                                activeFilterPreset === preset.id 
                                    ? 'text-gray-400' 
                                    : 'text-gray-300'
                            }`}>
                                {preset.count}
                            </span>
                        </button>
                    ))}
                </div>

            </div>

            {/* Status bar */}
            <div className="flex justify-between items-center px-0.5">
                <div className="flex items-center gap-2">
                    <span className="text-[12px] text-gray-400 font-medium">
                        {processedCandidates.length} of {result.length} shown
                    </span>
                    {(searchQuery || minScore > 0 || activeFilterPreset !== 'all') && (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setMinScore(0);
                                setActiveFilterPreset('all');
                            }}
                            className="text-[12px] text-blue-500 hover:text-blue-700 font-medium flex items-center gap-0.5"
                        >
                            Clear filters
                        </button>
                    )}
                </div>

                {viewMode === 'grid' && (
                    <div className="flex items-center gap-1">
                        <span className="text-[11px] text-gray-300 font-medium mr-1">Sort</span>
                        {[
                            { id: 'score', label: 'Score' },
                            { id: 'name', label: 'Name' },
                            { id: 'rank', label: 'Rank' }
                        ].map(option => (
                            <button
                                key={option.id}
                                onClick={() => handleSort(option.id)}
                                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-0.5 ${
                                    sortField === option.id 
                                        ? 'bg-gray-100 text-gray-700' 
                                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {option.label}
                                {sortField === option.id && (
                                    <span className="material-symbols-outlined text-[10px]">
                                        {sortOrder === 'desc' ? 'arrow_downward' : 'arrow_upward'}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Empty State */}
            {processedCandidates.length === 0 && (
                <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-4 border border-rose-100">
                        <span className="material-symbols-outlined text-2xl font-bold">person_search</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-primary mb-1">No Matches Found</h3>
                    <p className="text-xs text-on-surface-variant mb-6 leading-relaxed">
                        We couldn't find any candidates matching your active search terms, match scores, or filtering presets. Try widening your criteria!
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery('');
                            setMinScore(0);
                            setActiveFilterPreset('all');
                        }}
                        className="px-4 py-2 bg-secondary hover:bg-secondary/95 text-white rounded-xl font-bold text-xs shadow-md shadow-secondary/15 transition-all"
                    >
                        Reset All Filters
                    </button>
                </div>
            )}

            {/* Grid Layout View */}
            {viewMode === 'grid' && processedCandidates.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {processedCandidates.map((candidate) => {
                        const uniqueName = candidate.resumeName;
                        return (
                            <CandidateCard
                                key={uniqueName}
                                candidate={candidate}
                                rank={candidate.originalRank}
                                onSelect={() => setSelectedCandidate(candidate)}
                                status={candidateStatuses[uniqueName] || null}
                                onSetStatus={(newStatus) => setCandidateStatuses(prev => ({
                                    ...prev,
                                    [uniqueName]: newStatus
                                }))}
                            />
                        );
                    })}
                </div>
            )}

            {/* List Layout View (Expandable Rows Table) */}
            {viewMode === 'list' && processedCandidates.length > 0 && (
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 select-none text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    <th 
                                        onClick={() => handleSort('rank')}
                                        className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100/80 transition-colors w-14"
                                    >
                                        <div className="flex items-center justify-center gap-0.5">
                                            Rank
                                            {sortField === 'rank' && (
                                                <span className="material-symbols-outlined text-[10px] font-black">
                                                    {sortOrder === 'desc' ? 'arrow_downward' : 'arrow_upward'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('name')}
                                        className="py-3 px-4 cursor-pointer hover:bg-slate-100/80 transition-colors"
                                    >
                                        <div className="flex items-center gap-0.5">
                                            Candidate Name & Skills coverage
                                            {sortField === 'name' && (
                                                <span className="material-symbols-outlined text-[10px] font-black">
                                                    {sortOrder === 'desc' ? 'arrow_downward' : 'arrow_upward'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th 
                                        onClick={() => handleSort('score')}
                                        className="py-3 px-4 text-center cursor-pointer hover:bg-slate-100/80 transition-colors w-28"
                                    >
                                        <div className="flex items-center justify-center gap-0.5">
                                            Fit Score
                                            {sortField === 'score' && (
                                                <span className="material-symbols-outlined text-[10px] font-black">
                                                    {sortOrder === 'desc' ? 'arrow_downward' : 'arrow_upward'}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                    <th className="py-3 px-4 hidden sm:table-cell max-w-[200px]">Skills Mix</th>
                                    <th className="py-3 px-4 text-right w-44">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {processedCandidates.map((candidate) => {
                                    const uniqueName = candidate.resumeName;
                                    return (
                                        <CandidateTableRow
                                            key={uniqueName}
                                            candidate={candidate}
                                            rank={candidate.originalRank}
                                            onSelect={() => setSelectedCandidate(candidate)}
                                            status={candidateStatuses[uniqueName] || null}
                                            onSetStatus={(newStatus) => setCandidateStatuses(prev => ({
                                                ...prev,
                                                [uniqueName]: newStatus
                                            }))}
                                            isExpanded={!!expandedCandidateRows[uniqueName]}
                                            onToggleExpand={() => handleToggleExpandRow(uniqueName)}
                                        />
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
    );
}
