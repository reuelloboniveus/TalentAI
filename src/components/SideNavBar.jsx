import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function SideNavBar({ currentHash, history = [], onHistorySelect, isOpen, onToggle, onNavigate }) {
    const { logout, userData } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            window.location.href = '/';
        } catch (error) {
            console.error("Failed to logout", error);
        }
    };

    const navItems = [
        { label: 'Dashboard', icon: 'dashboard', href: '#', active: currentHash === '' || currentHash === '#' },
        { label: 'Analyzer', icon: 'analytics', href: '#analyze', active: currentHash === '#analyze' },
        { label: 'JD Library', icon: 'inventory_2', href: '#jds', active: currentHash === '#jds' },
        { label: 'Job Generator', icon: 'magic_button', href: '#generator', active: currentHash === '#generator' },
    ];

    if (userData?.role === 'admin' || userData?.role === 'super_admin') {
        navItems.push({ label: 'Admin', icon: 'admin_panel_settings', href: '#admin', active: currentHash === '#admin' });
    }

    return (
        <aside className={`h-screen w-64 fixed left-0 top-0 bg-white dark:bg-[#041627] flex flex-col py-6 px-4 font-headline tracking-tight border-r border-outline-variant/10 z-[70] transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="mb-10 px-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-xl">
                        <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-primary dark:text-white leading-none">TalentAI</h1>
                        <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold mt-1">Precision Curator</p>
                    </div>
                </div>
                <button 
                    onClick={onToggle}
                    className="lg:hidden p-2 text-on-surface-variant hover:bg-surface-container-low rounded-xl transition-colors"
                >
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>
            
            <nav className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-1">
                    {navItems.map((item) => (
                        <a
                            key={item.label}
                            href={item.href}
                            onClick={(e) => {
                                e.preventDefault();
                                if (onNavigate) onNavigate(item.href);
                                if (window.innerWidth < 1024) onToggle();
                            }}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 ${
                                item.active 
                                    ? 'bg-primary/5 text-secondary font-bold border-r-4 border-secondary' 
                                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                            }`}
                        >
                            <span className="material-symbols-outlined">{item.icon}</span>
                            <span>{item.label}</span>
                        </a>
                    ))}
                </div>

                {history.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant opacity-50">Recent Analyses</h3>
                        <div className="space-y-1">
                            {history.slice(0, 5).map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        onHistorySelect(item);
                                        if (window.innerWidth < 1024) onToggle();
                                    }}
                                    className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all group"
                                >
                                    <span className="material-symbols-outlined text-sm text-secondary opacity-50 group-hover:opacity-100">history</span>
                                    <span className="truncate">{item.jdSummary}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </nav>

            <div className="mt-auto pt-6 px-2 space-y-4">
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 text-on-surface-variant hover:text-error hover:bg-error/5 rounded-xl transition-all"
                >
                    <span className="material-symbols-outlined">logout</span>
                    <span className="font-bold">Logout</span>
                </button>
            </div>
        </aside>
    );
}

