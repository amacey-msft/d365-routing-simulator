import { Page, BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const STORAGE_STATE_PATH = process.env.STORAGE_STATE_PATH
  || path.resolve(__dirname, '../.auth/storageState.json');

/**
 * Authenticate to Power Platform.
 *
 * Supports two modes:
 * - "storageState": reuse saved browser state (cookies/localStorage)
 * - "interactive": pause for manual login, then save state for reuse
 *
 * If storageState is expired/invalid, falls back to interactive and refreshes it.
 */
export async function authenticate(
  page: Page,
  context: BrowserContext
): Promise<void> {
  const authMode = process.env.AUTH_MODE || 'interactive';
  const baseUrl = process.env.D365_BASE_URL || process.env.POWERAPPS_URL || 'https://make.powerapps.com';

  if (authMode === 'storageState' && fs.existsSync(STORAGE_STATE_PATH)) {
    // Try loading saved state — navigate and check if we land authenticated
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
    // Give the page a moment to redirect if session is expired
    await page.waitForTimeout(3000);

    // Check if we're on a login page (session expired)
    const url = page.url();
    if (url.includes('login.microsoftonline.com') || url.includes('login.microsoft.com')) {
      console.log('Storage state expired, falling back to interactive login...');
      await interactiveLogin(page, context, baseUrl);
    }
    // else: we're authenticated
  } else {
    await interactiveLogin(page, context, baseUrl);
  }
}

async function interactiveLogin(
  page: Page,
  context: BrowserContext,
  baseUrl: string
): Promise<void> {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });

  // Pause for manual sign-in
  console.log('\n========================================');
  console.log('MANUAL SIGN-IN REQUIRED');
  console.log('Sign in to Power Platform in the browser.');
  console.log('Press "Resume" in the Playwright inspector when done.');
  console.log('========================================\n');

  await page.pause();

  // Save storage state for future reuse
  const dir = path.dirname(STORAGE_STATE_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  await context.storageState({ path: STORAGE_STATE_PATH });
  console.log(`Storage state saved to ${STORAGE_STATE_PATH}`);
}
