import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Benefits from './components/Benefits';
import Features from './components/Features';
import Footer from './components/Footer';
import AnalyzeRequest from './components/AnalyzeRequest';
import AnalyzeResult from './components/AnalyzeResult';
import AdminDashboard from './components/AdminDashboard';
import { analyzeMatch } from './services/gemini';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const { currentUser, userData, incrementUsage, login } = useAuth();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (jd, resume) => {
    // Double check auth (though UI should prevent this)
    if (!currentUser) {
      alert("Please login to analyze.");
      login();
      return;
    }

    if (userData && userData.dailyUsage >= userData.limit) {
      alert("Daily limit reached! Please contact admin to increase your limit.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const analysis = await analyzeMatch(jd, resume);
      await incrementUsage();
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

  const handleReset = () => {
    setResult(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Simple Admin Routing (Client-side)
  const isAdminView = window.location.hash === '#admin';

  if (isAdminView && userData?.role === 'admin') {
    return (
      <div className="app-wrapper">
        <Navbar />
        <AdminDashboard />
        <Footer />
      </div>
    )
  }

  return (
    <div className="app-wrapper" id="home">
      <Navbar />

      <main className="main-content">
        {!currentUser ? (
          // Landing Page View
          <>
            <Hero />
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
              <button
                onClick={login}
                className="btn-primary"
                style={{ maxWidth: '250px', fontSize: '1.1rem', padding: '1rem 2rem' }}
              >
                Get Started for Free
              </button>
            </div>
            <Benefits />
            <Features />
          </>
        ) : (
          // Authenticated App View
          <>
            {!result ? (
              <div className="container" id="analyze">
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                  <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Resume Analyzer</h2>
                  <p style={{ color: '#94a3b8' }}>Upload a Job Description and Resume to get started.</p>
                </div>

                {loading && (
                  <div className="loading-overlay">
                    <div className="spinner"></div>
                    <p>Analyzing Match...</p>
                  </div>
                )}
                {error && <div className="error">{error}</div>}

                <AnalyzeRequest onAnalyze={handleAnalyze} />
              </div>
            ) : (
              <div className="container" id="analysis-result">
                <AnalyzeResult result={result} onReset={handleReset} />
              </div>
            )}
            <Features />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
