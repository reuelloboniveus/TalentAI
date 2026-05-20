import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function SignIn() {
    const { login } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleLogin = async () => {
        setLoading(true);
        setError(null);
        try {
            await login();
        } catch (err) {
            console.error("Sign in failed:", err);
            setError(err.message || "Authentication failed. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fb] font-body flex items-center justify-center p-6">
            {/* Subtle ambient gradient */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[128px] opacity-60 -translate-y-1/3 translate-x-1/4"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-50 rounded-full blur-[128px] opacity-50 translate-y-1/3 -translate-x-1/4"></div>
            </div>

            <div className="relative w-full max-w-[400px]">
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.06)] border border-gray-100 px-8 py-10 sm:px-10 sm:py-12">

                    {/* Logo & Brand */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-sm">
                            <span className="text-white font-headline font-extrabold text-lg italic">T</span>
                        </div>
                        <h1 className="text-[22px] font-headline font-extrabold text-gray-900 tracking-tight">
                            TalentAI
                        </h1>
                        <p className="text-[13px] text-gray-400 font-medium mt-1">
                            AI-Powered Hiring Platform
                        </p>
                    </div>

                    {/* Heading */}
                    <div className="text-center mb-8">
                        <h2 className="text-base font-semibold text-gray-900 mb-1.5">
                            Welcome back
                        </h2>
                        <p className="text-[13px] text-gray-400 leading-relaxed">
                            Sign in with your Google account to continue
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 flex items-start gap-2.5 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                            <span className="material-symbols-outlined text-red-400 text-[18px] mt-0.5 shrink-0">error</span>
                            <p className="text-[13px] text-red-600 font-medium leading-snug">{error}</p>
                        </div>
                    )}

                    {/* Sign in button */}
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium text-[14px] py-3 px-4 rounded-xl transition-all duration-150 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none cursor-pointer shadow-sm hover:shadow"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                                <span>Signing in…</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                <span>Continue with Google</span>
                            </>
                        )}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-gray-100"></div>
                        <span className="text-[11px] text-gray-300 font-medium uppercase tracking-wider">Secured by Google OAuth</span>
                        <div className="flex-1 h-px bg-gray-100"></div>
                    </div>

                    {/* Footer note */}
                    <p className="text-center text-[12px] text-gray-300 leading-relaxed">
                        By continuing, you agree to our{' '}
                        <span className="text-gray-400 hover:text-gray-500 cursor-pointer">Terms</span>
                        {' '}and{' '}
                        <span className="text-gray-400 hover:text-gray-500 cursor-pointer">Privacy Policy</span>
                    </p>
                </div>

                {/* Bottom text */}
                <p className="text-center text-[11px] text-gray-300 mt-6 font-medium">
                    © 2026 TalentAI Inc.
                </p>
            </div>
        </div>
    );
}
