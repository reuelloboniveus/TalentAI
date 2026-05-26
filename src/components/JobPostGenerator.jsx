import React, { useState } from 'react';
import { generateJobPostImageRest } from '../services/nanobanana';
import { logEvent } from '../services/logger';

export default function JobPostGenerator({ onCreditDeduct }) {
    const [jobData, setJobData] = useState({
        title: '',
        company: '',
        description: '',
        requirements: ''
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState(null);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setJobData(prev => ({ ...prev, [name]: value }));
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setError(null);

        if (!jobData.title || !jobData.description) {
            setError("Title and Description are required.");
            return;
        }

        // Check credits (assumes 2 credits per image)
        const canProceed = onCreditDeduct(2);
        if (!canProceed) return;

        setIsGenerating(true);
        try {
            const prompt = `Professional job post marketing image for ${jobData.title} at ${jobData.company}. 
            Context: ${jobData.description}. 
            Requirements: ${jobData.requirements}. 
            Style: Modern, sleek, professional tech corporate branding, high quality, 4k.`;

            const imageData = await generateJobPostImageRest(prompt);
            setGeneratedImage(imageData);
            await logEvent('GENERATE_MARKETING_VISUAL', `Generated marketing visual for job post`, { title: jobData.title, company: jobData.company });
        } catch (err) {
            console.error("Image generation failed:", err);
            setError(err.message || "Failed to generate image. Please try again.");
            await logEvent('GENERATE_MARKETING_VISUAL_ERROR', `Failed marketing visual generation: ${err.message || err}`, { title: jobData.title, company: jobData.company });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-white shadow-lg shadow-secondary/20">
                        <span className="material-symbols-outlined">palette</span>
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold text-primary tracking-tight">AI Marketing Studio</h2>
                        <p className="text-on-surface-variant font-medium">Generate high-impact visuals for your job postings.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Configuration Panel */}
                <div className="col-span-12 lg:col-span-4 space-y-6">
                    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-bold text-primary uppercase tracking-widest mb-6">Campaign Controls</h3>
                        
                        <form onSubmit={handleGenerate} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface-variant ml-1">Job Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={jobData.title}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20 transition-all placeholder:text-slate-400"
                                    placeholder="e.g., Lead Design Engineer"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface-variant ml-1">Company Name</label>
                                <input
                                    type="text"
                                    name="company"
                                    value={jobData.company}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20 transition-all placeholder:text-slate-400"
                                    placeholder="e.g., TechNova Global"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface-variant ml-1">Contextual Brief</label>
                                <textarea
                                    name="description"
                                    value={jobData.description}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20 transition-all placeholder:text-slate-400 resize-none"
                                    placeholder="Describe the role's vibe and mission..."
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-on-surface-variant ml-1">Key Keywords</label>
                                <input
                                    type="text"
                                    name="requirements"
                                    value={jobData.requirements}
                                    onChange={handleChange}
                                    className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-secondary/20 transition-all placeholder:text-slate-400"
                                    placeholder="e.g., UX, React, Strategy"
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-xl text-xs font-medium animate-shake">
                                    {error}
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={isGenerating || !jobData.title}
                                className={`
                                    w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all
                                    ${isGenerating 
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                        : 'bg-gradient-to-br from-primary to-primary-container text-white shadow-xl shadow-primary/20 hover:-translate-y-1 active:scale-[0.98]'
                                    }
                                `}
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-slate-300 border-t-primary rounded-full animate-spin"></div>
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-sm">auto_fix</span>
                                        Generate Visual
                                    </>
                                )}
                            </button>
                            
                            <div className="flex items-center justify-center gap-2 pt-2 text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-60">
                                <span className="material-symbols-outlined text-[12px]">token</span>
                                Cost: 2 Credits
                            </div>
                        </form>
                    </div>

                    <div className="p-6 bg-primary-container rounded-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h4 className="text-white text-sm font-bold mb-2 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm text-secondary">verified</span>
                                Quality Control
                            </h4>
                            <p className="text-primary-fixed-dim text-xs leading-relaxed">
                                Our AI engine optimizes prompts based on current hiring trends for maximum engagement.
                            </p>
                        </div>
                        <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-secondary/10 rounded-full blur-2xl transition-transform group-hover:scale-150 duration-700"></div>
                    </div>
                </div>

                {/* Preview Panel */}
                <div className="col-span-12 lg:col-span-8">
                    <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 min-h-[600px] flex flex-col items-center justify-center p-8 relative overflow-hidden">
                        {!generatedImage && !isGenerating && (
                            <div className="text-center group">
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 mx-auto shadow-sm group-hover:scale-110 transition-transform duration-500">
                                    <span className="material-symbols-outlined text-4xl text-slate-300 group-hover:text-secondary transition-colors">image</span>
                                </div>
                                <h3 className="text-xl font-bold text-primary mb-2">Creative Canvas</h3>
                                <p className="text-on-surface-variant max-w-sm mx-auto">
                                    Fill in the campaign details to the left to generate your custom-branded hiring visual.
                                </p>
                            </div>
                        )}

                        {isGenerating && (
                            <div className="text-center flex flex-col items-center">
                                <div className="relative mb-8">
                                    <div className="w-24 h-24 border-4 border-slate-100 border-t-secondary rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-secondary animate-pulse">auto_awesome</span>
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold text-primary mb-2">Imagining Visuals...</h3>
                                <p className="text-on-surface-variant animate-pulse">Creating a unique composition for {jobData.title || 'your role'}</p>
                            </div>
                        )}

                        {generatedImage && !isGenerating && (
                            <div className="w-full h-full flex flex-col items-center animate-in zoom-in-95 duration-500">
                                <div className="relative group w-full max-w-4xl">
                                    <img
                                        src={generatedImage}
                                        alt="Generated Job Post"
                                        className="w-full h-auto rounded-2xl shadow-2xl shadow-primary/30 border-4 border-white"
                                    />
                                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-all rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <button 
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.href = generatedImage;
                                                link.download = `job-post-${jobData.title.toLowerCase().replace(/\s+/g, '-')}.png`;
                                                link.click();
                                            }}
                                            className="bg-white text-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                                        >
                                            <span className="material-symbols-outlined">download</span>
                                            Download Asset
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="mt-8 flex gap-4">
                                    <button
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.href = generatedImage;
                                            link.download = `job-post-${jobData.title.toLowerCase().replace(/\s+/g, '-')}.png`;
                                            link.click();
                                        }}
                                        className="px-8 py-3 bg-secondary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-secondary/90 transition-colors shadow-lg shadow-secondary/20"
                                    >
                                        <span className="material-symbols-outlined">download</span>
                                        Download
                                    </button>
                                    <button
                                        onClick={() => setGeneratedImage(null)}
                                        className="px-8 py-3 bg-white text-primary border border-slate-200 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                    >
                                        Create New
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Background Shapes */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-full -mr-32 -mt-32 blur-3xl opacity-50"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-slate-100 rounded-full -ml-32 -mb-32 blur-3xl opacity-50"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
