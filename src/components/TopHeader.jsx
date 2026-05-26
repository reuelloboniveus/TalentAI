import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function TopHeader({ title = "Dashboard", onToggle }) {
    const { currentUser, userData } = useAuth();

    return (
        <header className="fixed top-0 right-0 left-0 lg:left-64 h-20 z-50 bg-white/80 backdrop-blur-md flex justify-between items-center px-4 md:px-10 border-b border-slate-100 font-headline">
            <div className="flex items-center gap-3">
                <button 
                    onClick={onToggle}
                    className="lg:hidden p-2 text-primary hover:bg-surface-container-low rounded-xl transition-colors"
                >
                    <span className="material-symbols-outlined">menu</span>
                </button>
                <h2 className="text-lg md:text-2xl font-extrabold tracking-tight text-primary uppercase truncate max-w-[150px] md:max-w-none">{title}</h2>
            </div>

            <div className="flex items-center gap-2 md:gap-6">
                {userData && (
                    <div className="hidden sm:flex items-center bg-surface-container px-4 py-2 rounded-xl gap-2 border border-outline-variant/20">
                        <span className="material-symbols-outlined text-sm text-secondary">database</span>
                        <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Credits</span>
                        <span className="font-black text-secondary">
                            {(userData.role === 'admin' || userData.role === 'super_admin') 
                                ? 'Unlimited' 
                                : Math.max(0, (userData.limit || 10) - (userData.dailyUsage || 0))}
                        </span>
                    </div>
                )}
                
                <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-6 border-l border-outline-variant/30">
                    <div className="text-right hidden xs:block">
                        <p className="text-xs md:text-sm font-bold text-primary leading-none">{currentUser?.displayName?.split(' ')[0] || 'User'}</p>
                        <p className="text-[8px] md:text-[10px] text-on-surface-variant font-bold uppercase mt-1">
                            {userData?.role === 'super_admin' ? 'Super Admin' : (userData?.role || 'Member')}
                        </p>
                    </div>
                    <div className="h-8 w-8 md:h-10 md:w-10 rounded-xl overflow-hidden border-2 border-primary/10 bg-primary-container flex items-center justify-center text-primary font-bold">
                        {currentUser?.photoURL ? (
                            <img src={currentUser.photoURL} alt="Profile" className="h-full w-full object-cover" />
                        ) : (
                            currentUser?.displayName?.charAt(0) || 'U'
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
