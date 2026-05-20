import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateJobPostImage, generateJobPostImageRest } from './nanobanana';

const CLOUD_RUN_URL = "https://resume-analyzer-service-396523767033.asia-south1.run.app";

describe('nanobanana service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('generateJobPostImage', () => {
    it('returns the image base64 string on success', async () => {
      const mockImageBase64 = 'data:image/png;base64,mockedbase64data';
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ image_base64: mockImageBase64 })
      });

      const result = await generateJobPostImage('a futuristic workspace');

      expect(result).toBe(mockImageBase64);
      expect(global.fetch).toHaveBeenCalledWith(`${CLOUD_RUN_URL}/generate-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: 'a futuristic workspace',
          aspect_ratio: '1:1'
        })
      });
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it('throws clear error when response is not ok', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ detail: 'Internal Server Error' })
      });

      await expect(generateJobPostImage('prompt')).rejects.toThrow('Internal Server Error');
    });

    it('throws clear status error when response is not ok and json parsing fails', async () => {
      global.fetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => { throw new Error('invalid json'); }
      });

      await expect(generateJobPostImage('prompt')).rejects.toThrow('Image generation failed with status: 400');
    });

    it('throws error when no image_base64 is returned', async () => {
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({})
      });

      await expect(generateJobPostImage('prompt')).rejects.toThrow('No image data returned from API.');
    });

    it('rethrows fetch/network exceptions', async () => {
      global.fetch.mockRejectedValue(new Error('Network Connection Error'));

      await expect(generateJobPostImage('prompt')).rejects.toThrow('Network Connection Error');
    });
  });

  describe('generateJobPostImageRest (alias)', () => {
    it('behaves identically to generateJobPostImage', async () => {
      const mockImageBase64 = 'data:image/png;base64,mockedbase64data';
      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => ({ image_base64: mockImageBase64 })
      });

      const result = await generateJobPostImageRest('another prompt');

      expect(result).toBe(mockImageBase64);
      expect(global.fetch).toHaveBeenCalledWith(`${CLOUD_RUN_URL}/generate-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: 'another prompt',
          aspect_ratio: '1:1'
        })
      });
    });
  });
});
