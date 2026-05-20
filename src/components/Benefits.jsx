import React from 'react';

export default function Benefits() {
    const benefits = [
        {
            title: "Semantic Analysis",
            description: "Beyond simple keyword mapping. We model the intent and depth of expertise, distinguishing between passive exposure and domain mastery.",
            icon: "psychology",
            color: "text-secondary",
            bg: "bg-secondary-fixed"
        },
        {
            title: "Equitable Evaluation",
            description: "Engineered for meritocracy. Our intelligence focuses strictly on skill architecture, neutralizing unconscious bias at the source.",
            icon: "balance",
            color: "text-primary",
            bg: "bg-surface-container-high"
        },
        {
            title: "Cognitive Synthesis",
            description: "Convert 20-page document sets into core actionable insights. Instant executive summaries that map perfectly to your hiring metrics.",
            icon: "neurology",
            color: "text-tertiary",
            bg: "bg-tertiary-fixed-dim"
        },
        {
            title: "Archival Intelligence",
            description: "Deep historical context. Detect growth trajectories and career velocity that traditional screening tools consistently overlook.",
            icon: "monitoring",
            color: "text-emerald-600",
            bg: "bg-emerald-50"
        }
    ];

    return (
        <section className="py-24 px-6 lg:px-10 bg-slate-50/50">
            <div className="max-w-7xl mx-auto">
                <div className="mb-20 text-center max-w-3xl mx-auto">
                    <h2 className="text-4xl lg:text-5xl font-black text-primary tracking-tight mb-6">Strategic Talent Intelligence</h2>
                    <p className="text-lg text-on-surface-variant font-medium">
                        TalentAI isn't just a tool—it's a <span className="text-secondary font-bold">Cognitive Layer</span> for your recruiting stack. 
                        We decode human capacity with industrial-grade precision.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {benefits.map((benefit, i) => (
                        <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                            <div className={`w-14 h-14 ${benefit.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <span className={`material-symbols-outlined ${benefit.color} text-3xl`}>
                                    {benefit.icon}
                                </span>
                            </div>
                            <h3 className="text-xl font-black text-primary mb-4 tracking-tight">{benefit.title}</h3>
                            <p className="text-sm leading-relaxed text-on-surface-variant font-medium">
                                {benefit.description}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-20 p-10 lg:p-16 rounded-[48px] bg-primary relative overflow-hidden text-white shadow-2xl shadow-primary/20">
                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h3 className="text-3xl lg:text-4xl font-black mb-6 tracking-tight leading-tight">Advanced Performance Metrics Built In</h3>
                            <div className="space-y-6">
                                {[
                                    { title: 'Dynamic Skill Mapping', desc: 'Visual strength analysis vs Market standard.' },
                                    { title: 'Predictive Velocity', desc: 'Forecast candidate performance trajectories.' },
                                    { title: 'Global Benchmarking', desc: 'Compare talent against 50,000+ top industry profiles.' }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-4">
                                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black italic">
                                            0{i+1}
                                        </div>
                                        <div>
                                            <div className="font-bold text-lg">{item.title}</div>
                                            <p className="text-sm opacity-70 font-medium">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square bg-gradient-to-tr from-secondary/20 to-tertiary/20 rounded-[48px] border border-white/10 backdrop-blur-3xl flex items-center justify-center p-8">
                                <span className="material-symbols-outlined text-9xl opacity-20 absolute -z-10 animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
                                <div className="text-center space-y-4">
                                    <div className="text-6xl font-black text-secondary tracking-tighter">84.2%</div>
                                    <div className="text-xs font-black uppercase tracking-[0.3em] opacity-80">Efficiency Gain Protocol</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
