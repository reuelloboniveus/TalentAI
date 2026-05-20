import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetDocument, mockWorkerOptions } = vi.hoisted(() => ({
  mockGetDocument: vi.fn(),
  mockWorkerOptions: {}
}));

vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: mockWorkerOptions,
  getDocument: mockGetDocument
}));

vi.mock('pdfjs-dist/build/pdf.worker.min.mjs?url', () => ({
  default: '/mock-worker-url.js'
}));

import { parseFile } from './fileParser';

describe('file parser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('parses plain text files via FileReader', async () => {
    const file = new File(['hello from txt'], 'resume.txt', { type: 'text/plain' });

    const result = await parseFile(file);
    expect(result).toBe('hello from txt');
  });

  it('parses text from all pages in PDF files', async () => {
    const pdfMock = {
      numPages: 2,
      getPage: vi
        .fn()
        .mockResolvedValueOnce({
          getTextContent: vi.fn().mockResolvedValue({
            items: [{ str: 'Page' }, { str: 'One' }]
          })
        })
        .mockResolvedValueOnce({
          getTextContent: vi.fn().mockResolvedValue({
            items: [{ str: 'Page' }, { str: 'Two' }]
          })
        })
    };

    mockGetDocument.mockReturnValue({
      promise: Promise.resolve(pdfMock)
    });

    const file = {
      type: 'application/pdf',
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
    };

    const result = await parseFile(file);

    expect(mockGetDocument).toHaveBeenCalledTimes(1);
    expect(result).toBe('Page One\nPage Two\n');
  });

  it('rejects unsupported file types', async () => {
    const file = new File(['x'], 'resume.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    });

    await expect(parseFile(file)).rejects.toThrow(
      'Unsupported file type. Please upload a PDF or TXT file.'
    );
  });

  it('rejects when FileReader emits error event', async () => {
    const OriginalFileReader = global.FileReader;

    class ErroringFileReader {
      readAsText() {
        if (this.onerror) {
          this.onerror(new Error('read failed'));
        }
      }
    }

    global.FileReader = ErroringFileReader;

    const file = new File(['bad'], 'broken.txt', { type: 'text/plain' });

    await expect(parseFile(file)).rejects.toBeTruthy();

    global.FileReader = OriginalFileReader;
  });

  it('parses PDF files with missing/atypical MIME type based on file extension', async () => {
    const pdfMock = {
      numPages: 1,
      getPage: vi.fn().mockResolvedValue({
        getTextContent: vi.fn().mockResolvedValue({
          items: [{ str: 'Extension' }, { str: 'works' }]
        })
      })
    };

    mockGetDocument.mockReturnValue({
      promise: Promise.resolve(pdfMock)
    });

    const file = {
      name: 'resume.PDF',
      type: '',
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
    };

    const result = await parseFile(file);
    expect(result).toBe('Extension works\n');
  });

  it('throws a specific error for password-protected PDFs', async () => {
    const error = new Error('Password required');
    error.name = 'PasswordException';

    mockGetDocument.mockReturnValue({
      promise: Promise.reject(error)
    });

    const file = {
      name: 'locked.pdf',
      type: 'application/pdf',
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
    };

    await expect(parseFile(file)).rejects.toThrow('This PDF is password-protected. Please remove the password and try again.');
  });

  it('throws an error for empty/scanned PDFs with no selectable text', async () => {
    const pdfMock = {
      numPages: 1,
      getPage: vi.fn().mockResolvedValue({
        getTextContent: vi.fn().mockResolvedValue({
          items: []
        })
      })
    };

    mockGetDocument.mockReturnValue({
      promise: Promise.resolve(pdfMock)
    });

    const file = {
      name: 'scanned.pdf',
      type: 'application/pdf',
      arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8))
    };

    await expect(parseFile(file)).rejects.toThrow('This PDF appears to be empty or contains no selectable text (scanned image). Please upload a text-based PDF or paste the text directly.');
  });
});
