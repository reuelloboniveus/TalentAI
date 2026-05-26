import React, { useState, useEffect } from 'react';
import SideNavBar from './components/SideNavBar';
import TopHeader from './components/TopHeader';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import Features from './components/Features';
import Footer from './components/Footer';
import AnalyzeRequest from './components/AnalyzeRequest';
import AnalyzeResult from './components/AnalyzeResult';
import AdminDashboard from './components/AdminDashboard';
import { analyzeMatch, analyzeBulkMatch } from './services/gemini';
import { useAuth } from './context/AuthContext';
import { saveAnalysisToHistory, getUserHistory, saveJD, getUserJDs } from './services/firebase';
import JobPostGenerator from './components/JobPostGenerator';
import JDLibrary from './components/JDLibrary';
import QuestionsGenerator from './components/QuestionsGenerator';
import SignIn from './components/SignIn';
import './App.css';

function App() {
  const { currentUser, userData, incrementUsage, login } = useAuth();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
   const [history, setHistory] = useState([]);
  const [savedJDs, setSavedJDs] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  // Load History
   const loadHistory = async () => {
    if (currentUser) {
      const data = await getUserHistory(currentUser.uid);
      setHistory(data);
    }
  };

  const loadJDs = async () => {
    if (currentUser && userData) {
      const data = await getUserJDs(currentUser.uid, userData.orgId);
      setSavedJDs(data);
    }
  };

   useEffect(() => {
    if (currentUser && userData) {
      loadHistory();
      loadJDs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, userData]);

  useEffect(() => {
    const onHashChange = () => setCurrentHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleAnalyze = async (jd, resumeOrResumes, mode = 'individual') => {
    // Double check auth (though UI should prevent this)
    if (!currentUser) {
      alert("Please login to analyze.");
      login();
      return;
    }

    const cost = mode === 'bulk' ? resumeOrResumes.length : 1;
    const isAdmin = userData?.role === 'admin' || userData?.role === 'super_admin';

    if (!isAdmin && userData && (userData.dailyUsage + cost) > userData.limit) {
      alert(`Daily limit reached! This action requires ${cost} credits, but you only have ${userData.limit - userData.dailyUsage} left.`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      let analysis;
      if (mode === 'bulk') {
        analysis = await analyzeBulkMatch(jd, resumeOrResumes);
      } else {
        analysis = await analyzeMatch(jd, resumeOrResumes);
      }

      await incrementUsage(cost);

      // Save to History
      await saveAnalysisToHistory(currentUser.uid, analysis, jd);
      // Reload history to show new item
      loadHistory();

      setResult(analysis);
      // Smooth scroll to result
      setTimeout(() => {
        const resultElement = document.getElementById('analysis-result');
        if (resultElement) resultElement.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJD = async (title, content) => {
    if (!currentUser) return;
    try {
      await saveJD(currentUser.uid, title, content, userData?.orgId);
      await loadJDs();
      alert("JD saved to library successfully.");
    } catch {
      alert("Failed to save JD.");
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigation = (href) => {
    setResult(null);
    setError(null);
    window.location.hash = href.startsWith('#') ? href : '';
    setCurrentHash(window.location.hash);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleHistorySelect = (item) => {
    setResult(item.result);
    setIsSidebarOpen(false);
    setTimeout(() => {
      const resultElement = document.getElementById('analysis-result');
      if (resultElement) resultElement.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Simple Admin Routing (Client-side)
  // We use window.location.hash directly in render to react to changes, 
  // but better to use a state or event listener if hash changes without reload.
  // For now, assuming direct navigation or reload.
  const isAdminView = currentHash === '#admin';
  const isGeneratorView = currentHash === '#generator';
  const isLibraryView = currentHash === '#jds';
  const isQuestionsView = currentHash === '#questions';

  const getPageTitle = () => {
    if (isAdminView) return "Governance Control";
    if (isGeneratorView) return "AI Studio";
    if (isLibraryView) return "JD Library";
    if (isQuestionsView) return "Q&A Studio";
    if (result) return "Analysis Report";
    return "Mission Control";
  };

  // Helper for Unauthorized users attempting admin
  if (isAdminView && (!currentUser || (userData?.role !== 'admin' && userData?.role !== 'super_admin'))) {
      if (!currentUser) {
          login();
          return null;
      }
  }

  if (!currentUser) {
    return <SignIn />;
  }

  return (
    <div className="flex min-h-screen bg-surface font-body overflow-x-hidden selection:bg-secondary selection:text-white" id="home">
       {currentUser && (
        <>
          <SideNavBar 
            currentHash={currentHash} 
            history={history} 
            onHistorySelect={handleHistorySelect} 
            isOpen={isSidebarOpen}
            onToggle={toggleSidebar}
            onNavigate={handleNavigation}
          />
          {isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[65] lg:hidden animate-in fade-in duration-300"
              onClick={toggleSidebar}
            />
          )}
        </>
      )}

      <div className={`flex-1 flex flex-col min-w-0 ${currentUser ? 'lg:pl-64' : ''} transition-all duration-500`}>
        {!currentUser ? (
          // Landing Page Header
          <header className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-xl bg-white/70 border-b border-slate-100 px-6 lg:px-10 py-5 transition-all">
            <div className="max-w-[1600px] mx-auto flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black italic">T</div>
                    <span className="text-xl font-black tracking-tight text-primary">TalentAI</span>
                </div>
                <nav className="hidden md:flex items-center gap-8">
                    <a href="#features" className="text-xs font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">Mechanism</a>
                    <a href="#benefits" className="text-xs font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors">Strategic Value</a>
                    <button onClick={login} className="bg-primary text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:scale-105 transition-all active:scale-95">Initiate Protocol</button>
                </nav>
            </div>
          </header>
        ) : (
          <TopHeader title={getPageTitle()} onToggle={toggleSidebar} />
        )}

        <main className={`flex-1 ${currentUser ? 'pt-28 px-6 lg:px-10 pb-12' : 'pt-20'}`}>
          {!currentUser ? (
            <>
              <Hero />
              <div id="benefits"><Benefits /></div>
              <Features />
              <Footer />
            </>
          ) : !userData?.orgId && userData?.role !== 'super_admin' ? (
            <div className="max-w-xl mx-auto mt-20">
               <div className="bg-white p-12 rounded-[48px] border border-slate-100 shadow-2xl text-center space-y-8 animate-in fade-in zoom-in-95 duration-700">
                  <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto">
                     <span className="material-symbols-outlined text-amber-500 text-4xl">lock_open</span>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl font-black text-primary tracking-tight">Access Restricted</h2>
                    <p className="text-on-surface-variant font-medium">Your identity has not been associated with a verified organization. Please contact your coordinator to proceed.</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 mb-1">Authenticated ID</div>
                    <code className="text-xs font-mono font-bold text-primary break-all">{currentUser.uid}</code>
                  </div>
               </div>
            </div>
          ) : isAdminView ? (
             <AdminDashboard />
          ) : isLibraryView ? (
             <JDLibrary jds={savedJDs} onUpdate={loadJDs} />
          ) : isGeneratorView ? (
             <JobPostGenerator
                onCreditDeduct={async (cost) => {
                  const isAdmin = userData?.role === 'admin' || userData?.role === 'super_admin';
                  if (!isAdmin && userData && (userData.dailyUsage + cost) > userData.limit) {
                    alert(`Action denied. Insufficient protocol credits (${userData.limit - userData.dailyUsage} remaining).`);
                    return false;
                  }
                  await incrementUsage(cost);
                  return true;
                }}
             />
          ) : isQuestionsView ? (
             <QuestionsGenerator
                onCreditDeduct={async (cost) => {
                  const isAdmin = userData?.role === 'admin' || userData?.role === 'super_admin';
                  if (!isAdmin && userData && (userData.dailyUsage + cost) > userData.limit) {
                    alert(`Action denied. Insufficient protocol credits (${userData.limit - userData.dailyUsage} remaining).`);
                    return false;
                  }
                  await incrementUsage(cost);
                  return true;
                }}
             />
          ) : !result ? (
             <div className="space-y-12 max-w-[1600px] mx-auto" id="analyze">
                <div className="space-y-2">
                   <h2 className="text-4xl lg:text-5xl font-black text-primary tracking-tight">Mission Control</h2>
                   <p className="text-on-surface-variant text-lg font-medium opacity-70">Execute talent analysis with advanced cognitive modeling.</p>
                </div>

                {loading && (
                    <div className="fixed inset-0 z-[100] bg-surface/40 backdrop-blur-md flex items-center justify-center">
                        <div className="bg-white p-12 rounded-[48px] shadow-2xl border border-slate-100 flex flex-col items-center gap-6 animate-pulse">
                            <div className="w-16 h-16 border-4 border-secondary border-t-transparent rounded-full animate-spin"></div>
                            <div className="text-center">
                                <div className="text-lg font-black text-primary tracking-tight">Synthesizing Data</div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">AI is Braining</div>
                            </div>
                        </div>
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex items-center gap-4 text-red-600 animate-in slide-in-from-top-4 duration-500">
                        <span className="material-symbols-outlined">report</span>
                        <div className="text-sm font-bold uppercase tracking-widest">{error}</div>
                    </div>
                )}

                <AnalyzeRequest 
                    onAnalyze={handleAnalyze} 
                    savedJDs={savedJDs}
                    onSaveJD={handleSaveJD}
                 />
             </div>
          ) : (
             <div className="max-w-[1600px] mx-auto" id="analysis-result">
                <AnalyzeResult result={result} onReset={handleReset} />
             </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
