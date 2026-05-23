import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setup.js',
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'coverage'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,jsx}'],
      exclude: [
        'node_modules/',
        'src/**/*.test.{js,jsx}',
        'src/setup.js',
        'src/main.jsx',
      ],
      thresholds: {
        statements: 35,
        branches: 35,
        functions: 30,
        lines: 35,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
