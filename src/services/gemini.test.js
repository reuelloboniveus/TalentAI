import { beforeEach, describe, expect, it, vi } from 'vitest';

import { analyzeBulkMatch, analyzeMatch } from './gemini';

const CLOUD_RUN_URL = "https://resume-analyzer-service-396523767033.asia-south1.run.app";

describe('gemini service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('parses JSON from analyzeMatch', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ score: 9, candidate_name: 'Alex' })
    });

    const result = await analyzeMatch('JD text', 'Resume text');

    expect(result).toEqual({ score: 9, candidate_name: 'Alex' });
    expect(global.fetch).toHaveBeenCalledWith(`${CLOUD_RUN_URL}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jd_text: 'JD text',
        resume_text: 'Resume text'
      })
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('throws clear error when api fails in analyzeMatch', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ detail: "Internal Server Error" })
    });

    await expect(analyzeMatch('JD', 'Resume')).rejects.toThrow('Internal Server Error');
  });

  it('handles bulk analysis successfully', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ([
        { resumeName: 'resume-a.pdf', score: 8, matching_skills: ["React"], missing_skills: [], profile_fit_analysis: "Good", strong_areas: ["Frontend"], insights: "Promising" }
      ])
    });

    const results = await analyzeBulkMatch(
      'JD text',
      [
        { name: 'resume-a.pdf', text: 'resume-a-text' }
      ]
    );

    expect(results).toHaveLength(1);
    expect(results[0].resumeName).toBe('resume-a.pdf');
    expect(global.fetch).toHaveBeenCalledWith(`${CLOUD_RUN_URL}/analyze-bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jd_text: 'JD text',
        resumes: [{ name: 'resume-a.pdf', text: 'resume-a-text' }]
      })
    });
  });

  it('rethrows unexpected bulk-analysis failures', async () => {
    global.fetch.mockRejectedValue(new Error("Network Error"));
    await expect(analyzeBulkMatch('JD', null)).rejects.toThrow("Network Error");
  });
});
