import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Footer from './components/Footer';
import AnalyzeRequest from './components/AnalyzeRequest';
import AnalyzeResult from './components/AnalyzeResult';
import { analyzeMatch } from './services/gemini';
import './App.css';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (jd, resume) => {
    setLoading(true);
    setError(null);
    try {
      const analysis = await analyzeMatch(jd, resume);
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

  return (
    <div className="app-wrapper">
      <Navbar />

      <main className="main-content">
        {!result ? (
          <>
            <Hero />
            <div className="container" id="analyze">
              {loading && (
                <div className="loading-overlay">
                  <div className="spinner"></div>
                  <p>Analyzing Match...</p>
                </div>
              )}
              {error && <div className="error">{error}</div>}

              <AnalyzeRequest onAnalyze={handleAnalyze} />
            </div>
            <Features />
          </>
        ) : (
          <div className="container" id="analysis-result">
            <AnalyzeResult result={result} onReset={handleReset} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
