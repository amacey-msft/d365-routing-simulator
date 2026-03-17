import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false, // sequential — lab steps depend on prior state
  retries: 1,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    viewport: { width: 1440, height: 900 },
    screenshot: 'off', // we capture manually via captureStep
    trace: 'retain-on-failure',
    baseURL: process.env.POWERAPPS_URL || 'https://make.powerapps.com',
    actionTimeout: 30_000,
    navigationTimeout: 60_000,
    storageState: process.env.AUTH_MODE === 'storageState'
      ? process.env.STORAGE_STATE_PATH || '.auth/storageState.json'
      : undefined,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
