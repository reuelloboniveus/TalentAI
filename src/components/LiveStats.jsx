import React, { useEffect, useState } from 'react';

export default function LiveStats() {
    const [count, setCount] = useState(12480);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prev => prev + Math.floor(Math.random() * 3));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-8 space-y-8 h-full flex flex-col justify-center">
            <div className="flex items-center justify-between">
                <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">dataset</span>
                </div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary bg-secondary-fixed px-3 py-1 rounded-full">Live Monitor</div>
            </div>

            <div className="space-y-6">
                <div>
                     <div className="text-sm font-black text-on-surface-variant uppercase tracking-widest mb-1">Global Throughput</div>
                     <div className="text-5xl font-black text-primary tracking-tighter tabular-nums">
                        {count.toLocaleString()}
                     </div>
                     <div className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1 mt-1">
                        <span className="material-symbols-outlined text-xs">trending_up</span>
                        +12% vs last cycle
                     </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/5">
                        <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 mb-1">Accuracy</div>
                        <div className="text-xl font-black text-primary">99.8%</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/5">
                        <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 mb-1">Latency</div>
                        <div className="text-xl font-black text-primary">0.4s</div>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-outline-variant/5">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">Node Integrity</span>
                    <span className="text-[10px] font-black text-emerald-600 uppercase">Optimal</span>
                </div>
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-[94%] bg-emerald-500 rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    );
}
