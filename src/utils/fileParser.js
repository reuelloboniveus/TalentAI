import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Suppress distracting console warnings from pdfjs-dist in the main thread
if (typeof window !== 'undefined' || typeof globalThis !== 'undefined') {
    const target = typeof window !== 'undefined' ? window : globalThis;
    if (target.console && target.console.warn) {
        const originalWarn = target.console.warn;
        target.console.warn = function (...args) {
            if (args[0] && typeof args[0] === 'string' && (args[0].includes('Warning: TT:') || args[0].includes('TT: undefined function'))) {
                return;
            }
            originalWarn.apply(target.console, args);
        };
    }

    // Intercept Worker creations to suppress warnings inside the PDF.js Web Worker context
    if (typeof target.Worker !== 'undefined' && typeof Blob !== 'undefined' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
        const OriginalWorker = target.Worker;
        target.Worker = class PatchedWorker extends OriginalWorker {
            constructor(scriptURL, options) {
                const urlStr = String(scriptURL);
                if (urlStr.includes('pdf.worker')) {
                    const resolvedURL = new URL(scriptURL, target.location.href).href;
                    const blobCode = `
                        const originalWarn = self.console.warn;
                        self.console.warn = function(...args) {
                            if (args[0] && typeof args[0] === 'string' && (args[0].includes('Warning: TT:') || args[0].includes('TT: undefined function'))) {
                                return;
                            }
                            originalWarn.apply(self.console, args);
                        };
                        try {
                            importScripts(${JSON.stringify(resolvedURL)});
                        } catch (e) {
                            import(${JSON.stringify(resolvedURL)});
                        }
                    `;
                    const blob = new Blob([blobCode], { type: 'application/javascript' });
                    const newURL = URL.createObjectURL(blob);
                    super(newURL, options);
                } else {
                    super(scriptURL, options);
                }
            }
        };
    }
}

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export async function parseFile(file) {
    const fileName = file.name ? file.name.toLowerCase() : '';
    const isPDF = file.type === 'application/pdf' || 
                  file.type === 'application/x-pdf' || 
                  file.type === 'application/vnd.pdf' || 
                  fileName.endsWith('.pdf');
    const isTXT = file.type === 'text/plain' || 
                  fileName.endsWith('.txt');

    if (isTXT) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    } else if (isPDF) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer, verbosity: 0 }).promise;
            let text = '';

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                const strings = content.items.map((item) => item.str);
                text += strings.join(' ') + '\n';
            }

            if (!text || text.trim().length === 0) {
                throw new Error('This PDF appears to be empty or contains no selectable text (scanned image). Please upload a text-based PDF or paste the text directly.');
            }

            return text;
        } catch (error) {
            if (error.name === 'PasswordException') {
                throw new Error('This PDF is password-protected. Please remove the password and try again.');
            }
            if (error.message && error.message.includes('empty or contains no selectable text')) {
                throw error;
            }
            throw new Error(`Failed to parse PDF file: ${error.message || error}`);
        }
    } else {
        throw new Error('Unsupported file type. Please upload a PDF or TXT file.');
    }
}
