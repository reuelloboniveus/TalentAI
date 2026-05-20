import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-white border-t border-slate-100 pt-20 pb-10 px-6 lg:px-10">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <div className="flex items-center gap-2">
                             <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black italic">T</div>
                             <span className="text-xl font-black tracking-tight text-primary">TalentAI</span>
                        </div>
                        <p className="text-on-surface-variant font-medium max-w-sm leading-relaxed">
                            Pioneering AI Intelligence for the modern recruitment landscape. Turning data into human potential.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary/40">Platform</h4>
                        <ul className="space-y-3">
                            <li><a href="#home" className="text-sm font-bold text-primary hover:text-secondary transition-colors">Enterprise Solution</a></li>
                            <li><a href="#features" className="text-sm font-bold text-primary hover:text-secondary transition-colors">Workflow Automation</a></li>
                            <li><a href="#analyze" className="text-sm font-bold text-primary hover:text-secondary transition-colors">Core Intelligence</a></li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-primary/40">Legal & Governance</h4>
                        <ul className="space-y-3">
                            <li><a href="#" className="text-sm font-bold text-primary/40 cursor-not-allowed">Privacy Protocol</a></li>
                            <li><a href="#" className="text-sm font-bold text-primary/40 cursor-not-allowed">Terms of Service</a></li>
                            <li><a href="#" className="text-sm font-bold text-primary/40 cursor-not-allowed">Security Status</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">
                        &copy; {new Date().getFullYear()} TalentAI. All Rights Reserved. Engineered by Google Gemini.
                    </p>
                    <div className="flex gap-6">
                        <span className="material-symbols-outlined text-primary/20 hover:text-primary transition-colors cursor-pointer">share</span>
                        <span className="material-symbols-outlined text-primary/20 hover:text-primary transition-colors cursor-pointer">public</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
