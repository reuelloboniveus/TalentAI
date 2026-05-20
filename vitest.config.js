import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: [
        'src/services/gemini.js',
        'src/services/nanobanana.js',
        'src/utils/fileParser.js'
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        statements: 90,
        branches: 90
      }
    }
  }
});
