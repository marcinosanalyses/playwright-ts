import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 1,
  reporter: 'html',
  use: {
    baseURL: 'https://leancode.co',
    trace: 'on-first-retry'
  }
});