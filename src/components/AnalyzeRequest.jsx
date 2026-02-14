import { useState } from 'react';
import { parseFile } from '../utils/fileParser';

export default function AnalyzeRequest({ onAnalyze }) {
    const [jd, setJd] = useState('');
    const [resume, setResume] = useState('');
    const [isParsing, setIsParsing] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setIsParsing(true);
            try {
                const text = await parseFile(file);
                setResume(text);
            } catch (error) {
                alert(error.message);
            } finally {
                setIsParsing(false);
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (jd && resume) {
            onAnalyze(jd, resume);
        }
    };

    return (
        <div className="card">
            <h2>Upload Details</h2>
            <form onSubmit={handleSubmit} className="form-group">

                <div className="input-group">
                    <label htmlFor="jd">Job Description</label>
                    <textarea
                        id="jd"
                        value={jd}
                        onChange={(e) => setJd(e.target.value)}
                        placeholder="Paste Job Description here..."
                        rows="6"
                        required
                    />
                </div>

                <div className="input-group">
                    <label htmlFor="resume">Resume Content</label>
                    <div className="file-input-wrapper">
                        <input
                            type="file"
                            accept=".txt,.pdf"
                            onChange={handleFileChange}
                            className="file-input"
                        />
                        <span className="file-input-label">OR Paste Text Below</span>
                    </div>
                    <textarea
                        id="resume"
                        value={resume}
                        onChange={(e) => setResume(e.target.value)}
                        placeholder="Paste Resume text here or upload a file..."
                        rows="6"
                        required
                    />
                </div>

                <button type="submit" disabled={!jd || !resume || isParsing}>
                    {isParsing ? 'Parsing File...' : 'Analyze Match'}
                </button>
            </form>
        </div>
    );
}
