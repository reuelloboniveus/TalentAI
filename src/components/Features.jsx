import React from 'react';

export default function Features() {
    const steps = [
        {
            id: '01',
            title: "Data Ingestion",
            desc: "Aggregate candidate profiles from across your ecosystem. Supports bulk PDF processing, ZIP archives, and direct ATS synchronization.",
            icon: "cloud_upload"
        },
        {
            id: '02',
            title: "Core Processing",
            desc: "The AI Engine performs deep skill extraction, modeling technical proficiency and leadership vectors against your specific requirements.",
            icon: "clinical_notes"
        },
        {
            id: '03',
            title: "Ranked Intelligence",
            desc: "Receive a high-fidelity shortlist. Candidates are stack-ranked with objective Match Scores and multi-dimensional analysis reports.",
            icon: "leaderboard"
        }
    ];

    return (
        <section id="features" className="py-24 px-6 lg:px-10">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
                    <div className="max-w-xl">
                        <span className="text-secondary font-black uppercase tracking-widest text-[10px] bg-secondary-fixed px-2 py-1 rounded-lg">Workflow Architecture</span>
                        <h2 className="text-4xl lg:text-5xl font-black text-primary tracking-tight mt-4">Automated Excellence</h2>
                    </div>
                    <p className="text-on-surface-variant font-medium lg:max-w-md">
                        Our intelligence pipeline is designed for hyper-efficiency, converting raw data into actionable hiring decisions without manual friction.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {steps.map((step, i) => (
                        <div key={i} className="relative group">
                            <div className="text-[120px] font-black text-slate-100 absolute -top-16 -left-4 -z-10 select-none group-hover:text-secondary/10 transition-colors">
                                {step.id}
                            </div>
                            <div className="pt-8">
                                <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                    <span className="material-symbols-outlined text-2xl">{step.icon}</span>
                                </div>
                                <h3 className="text-xl font-black text-primary mb-3 tracking-tight">{step.title}</h3>
                                <p className="text-sm leading-relaxed text-on-surface-variant font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                                    {step.desc}
                                </p>
                            </div>
                            {i < 2 && (
                                <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-[1px] bg-slate-100"></div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-20 flex justify-center">
                    <div className="inline-flex items-center gap-6 px-10 py-6 bg-surface-container-low rounded-3xl border border-outline-variant/5 shadow-sm">
                        <div className="flex -space-x-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-slate-${i*100+200}`}></div>
                            ))}
                        </div>
                        <div className="text-sm font-bold text-primary">
                            Joined by <span className="text-secondary">500+</span> Enterprise Teams
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
