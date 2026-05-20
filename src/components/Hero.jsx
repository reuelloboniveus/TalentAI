import React, { useState, useEffect } from 'react';
import LiveStats from './LiveStats';

export default function Hero() {
    const [part1, setPart1] = useState('');
    const [part2, setPart2] = useState('');
    const [isTypingPart1, setIsTypingPart1] = useState(true);

    const text1 = "Precision Hiring.";
    const text2 = "At Scale.";

    useEffect(() => {
        let timeout;

        if (isTypingPart1) {
            if (part1.length < text1.length) {
                timeout = setTimeout(() => {
                    setPart1(text1.slice(0, part1.length + 1));
                }, 80);
            } else {
                timeout = setTimeout(() => {
                    setIsTypingPart1(false);
                }, 400);
            }
        } else {
            if (part2.length < text2.length) {
                timeout = setTimeout(() => {
                    setPart2(text2.slice(0, part2.length + 1));
                }, 80);
            }
        }

        return () => clearTimeout(timeout);
    }, [part1, part2, isTypingPart1]);

    return (
        <section className="relative overflow-hidden pt-20 pb-24 px-6 lg:px-10">
            {/* Background Orbs */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse delay-700"></div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-fixed border border-secondary/20 shadow-sm animate-in fade-in slide-in-from-left-4 duration-1000">
                        <span className="w-2 h-2 rounded-full bg-secondary animate-ping"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary">V2.0 Core Deployed</span>
                    </div>

                    <h1 className="text-6xl lg:text-8xl font-black tracking-tighter leading-[0.9] text-primary">
                        <span className="block">{part1}</span>
                        <span className="block text-secondary mt-2">
                            {part2}
                            <span className="inline-block w-2 lg:w-4 h-12 lg:h-16 bg-secondary ml-2 animate-pulse align-middle"></span>
                        </span>
                    </h1>

                    <p className="text-xl lg:text-2xl text-on-surface-variant font-medium max-w-xl leading-relaxed">
                        Identify elite talent in seconds. Our AI-driven
                        <span className="text-primary font-bold"> Talent Intelligence</span> ranks candidates based on deep skill
                        architecture, not just keywords.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            className="bg-primary text-white px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl shadow-primary/30 hover:-translate-y-1 active:translate-y-0 transition-all"
                            onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
                        >
                            Start Analysis Protocol
                        </button>
                        <button className="bg-surface-container-low border border-outline-variant/10 text-primary px-8 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-surface-container-high transition-all">
                            View Simulation
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-10">
                        {[
                            { label: 'Screening Tech', value: '10x Faster', icon: 'speed' },
                            { label: 'Skill Match', value: '99.9% Acc', icon: 'psychology' },
                            { label: 'Bias Removal', value: 'Active', icon: 'balance' }
                        ].map((stat, i) => (
                            <div key={i} className="space-y-1 border-l-2 border-slate-100 pl-4">
                                <span className="material-symbols-outlined text-secondary text-xl">{stat.icon}</span>
                                <div className="text-sm font-black text-primary uppercase tracking-tight">{stat.value}</div>
                                <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative group perspective-1000 hidden lg:block">
                    {/* Floating Cards UI Mockup */}
                    <div className="relative z-10 bg-white/40 backdrop-blur-3xl rounded-[32px] border border-white/40 shadow-2xl overflow-hidden p-2 transform rotate-2 group-hover:rotate-0 transition-transform duration-1000">
                        <div className="bg-surface rounded-[24px] overflow-hidden">
                            <LiveStats />
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary rounded-full blur-3xl opacity-20 -z-10 group-hover:scale-150 transition-transform duration-1000"></div>
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary rounded-full blur-3xl opacity-10 -z-10 group-hover:scale-150 transition-transform duration-1000"></div>
                </div>
            </div>
        </section>
    );
}
