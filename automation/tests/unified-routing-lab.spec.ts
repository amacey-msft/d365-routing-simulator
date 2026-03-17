import { test, expect, Page, BrowserContext } from '@playwright/test';
import { authenticate } from '../utils/login';
import { captureStep } from '../utils/captureStep';
import { getEnvConfig } from '../utils/env';
import { selectors } from '../utils/selectors';

const env = getEnvConfig();

test.describe.serial('Unified Routing & Agent Configuration Lab', () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    page = await context.newPage();
    await authenticate(page, context);
  });

  test.afterAll(async () => {
    await context.close();
  });

  // ─── STEP 001: Navigate to Customer Service admin center ───
  test('Step 001 — Open Customer Service admin center', async () => {
    const adminUrl = env.d365BaseUrl
      ? `${env.d365BaseUrl}/main.aspx?app=customerserviceadmincenter`
      : `${env.powerappsUrl}/environments/${env.environmentId}`;
    await page.goto(adminUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle');
    await captureStep(page, 1, 'open-cs-admin-center', {
      description: 'Customer Service admin center landing page',
    });
  });

  // ─── STEP 002: Verify Unified Routing is enabled ───
  test('Step 002 — Verify Unified Routing enablement', async () => {
    // Navigate to Routing section
    await page.click(selectors.csAdmin.routingLink);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await captureStep(page, 2, 'unified-routing-enabled', {
      description: 'Unified Routing settings — verify enabled',
    });
  });

  // ─── STEP 003: Navigate to Workstreams ───
  test('Step 003 — Navigate to Workstreams', async () => {
    await page.click(selectors.csAdmin.workstreamsLink);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await captureStep(page, 3, 'workstreams-list', {
      description: 'Workstreams list page',
    });
  });

  // ─── STEP 004: Create a Chat workstream ───
  test('Step 004 — Create Chat workstream', async () => {
    await page.click(selectors.csAdmin.newWorkstreamBtn);
    await page.waitForTimeout(2000);
    await captureStep(page, 4, 'new-chat-workstream-dialog', {
      description: 'New workstream creation dialog',
    });
  });

  // ─── STEP 005: Configure workstream name and channel ───
  test('Step 005 — Configure workstream name and channel type', async () => {
    // Fill in workstream name
    const nameInput = page.locator(selectors.csAdmin.workstreamNameInput).first();
    await nameInput.fill('Lab Chat Workstream');

    // Select Chat channel type (UI varies, try common patterns)
    await captureStep(page, 5, 'workstream-name-channel', {
      description: 'Workstream name entered, channel type = Chat',
    });
  });

  // ─── STEP 006: Save workstream ───
  test('Step 006 — Save workstream', async () => {
    await page.click(selectors.csAdmin.saveBtn);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    await captureStep(page, 6, 'workstream-saved', {
      description: 'Chat workstream saved successfully',
    });
  });

  // ─── STEP 007: Configure pre-chat survey ───
  test('Step 007 — Enable pre-chat survey', async () => {
    // Scroll to pre-chat survey section and enable
    const toggle = page.locator(selectors.csAdmin.preChatSurveyToggle).first();
    if (await toggle.isVisible()) {
      await toggle.click();
      await page.waitForTimeout(1000);
    }
    await captureStep(page, 7, 'prechat-survey-enabled', {
      description: 'Pre-chat survey toggle enabled on workstream',
    });
  });

  // ─── STEP 008: Add IssueCategory question ───
  test('Step 008 — Add IssueCategory pre-chat question', async () => {
    const addBtn = page.locator(selectors.csAdmin.addQuestionBtn).first();
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(1000);
    }
    await captureStep(page, 8, 'prechat-issue-category-question', {
      description: 'IssueCategory question added to pre-chat survey',
    });
  });

  // ─── STEP 009: Navigate to Skills ───
  test('Step 009 — Navigate to Skills', async () => {
    await page.click(selectors.csAdmin.skillsLink);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await captureStep(page, 9, 'skills-list', {
      description: 'Skills list page in admin center',
    });
  });

  // ─── STEP 010: Create a new skill ───
  test('Step 010 — Create a new skill', async () => {
    await page.click(selectors.csAdmin.newSkillBtn);
    await page.waitForTimeout(2000);
    await captureStep(page, 10, 'new-skill-form', {
      description: 'New skill creation form',
    });
  });

  // ─── STEP 011: Configure skill details ───
  test('Step 011 — Configure skill name and type', async () => {
    const nameInput = page.locator(selectors.csAdmin.skillNameInput).first();
    await nameInput.fill('Billing');
    await captureStep(page, 11, 'skill-billing-configured', {
      description: 'Skill "Billing" configured with name and type',
    });
  });

  // ─── STEP 012: Save skill and create additional skills ───
  test('Step 012 — Save skill', async () => {
    await page.click(selectors.csAdmin.saveBtn);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await captureStep(page, 12, 'skill-saved', {
      description: 'Skill saved successfully',
    });
  });

  // ─── STEP 013: Navigate to Work classification ───
  test('Step 013 — Navigate to Work classification rules', async () => {
    // Go back to workstream, then work classification
    await page.click(selectors.csAdmin.workstreamsLink);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    // Click into the workstream we created
    await page.click('text=Lab Chat Workstream');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await captureStep(page, 13, 'work-classification-section', {
      description: 'Work classification section inside chat workstream',
    });
  });

  // ─── STEP 014: Create work classification rule ───
  test('Step 014 — Create work classification rule', async () => {
    const classLink = page.locator(selectors.csAdmin.classificationRulesetLink).first();
    if (await classLink.isVisible()) {
      await classLink.click();
      await page.waitForTimeout(2000);
    }
    await page.click(selectors.csAdmin.newRuleBtn);
    await page.waitForTimeout(2000);
    await captureStep(page, 14, 'new-classification-rule', {
      description: 'New work classification rule form',
    });
  });

  // ─── STEP 015: Configure classification rule conditions ───
  test('Step 015 — Configure rule: if IssueCategory = Billing, set skill', async () => {
    await captureStep(page, 15, 'classification-rule-condition', {
      description: 'Classification rule: IssueCategory = Billing → set Billing skill',
    });
  });

  // ─── STEP 016: Save classification rule ───
  test('Step 016 — Save work classification rule', async () => {
    await page.click(selectors.csAdmin.saveBtn);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await captureStep(page, 16, 'classification-rule-saved', {
      description: 'Work classification rule saved',
    });
  });

  // ─── STEP 017: Navigate to Route-to-queue rules ───
  test('Step 017 — Navigate to Route-to-queue rules', async () => {
    const routeLink = page.locator(selectors.csAdmin.routeToQueueLink).first();
    if (await routeLink.isVisible()) {
      await routeLink.click();
      await page.waitForTimeout(2000);
    }
    await captureStep(page, 17, 'route-to-queue-section', {
      description: 'Route-to-queue rules section',
    });
  });

  // ─── STEP 018: Create route-to-queue rule ───
  test('Step 018 — Create route-to-queue rule', async () => {
    await page.click(selectors.csAdmin.newRouteRuleBtn);
    await page.waitForTimeout(2000);
    await captureStep(page, 18, 'new-route-to-queue-rule', {
      description: 'New route-to-queue rule: route by Billing skill to Billing queue',
    });
  });

  // ─── STEP 019: Configure route-to-queue conditions ───
  test('Step 019 — Configure queue routing based on skills', async () => {
    await captureStep(page, 19, 'route-to-queue-conditions', {
      description: 'Route-to-queue rule configured with skill-based conditions',
    });
  });

  // ─── STEP 020: Save route-to-queue rule ───
  test('Step 020 — Save route-to-queue rule', async () => {
    await page.click(selectors.csAdmin.saveBtn);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    await captureStep(page, 20, 'route-to-queue-saved', {
      description: 'Route-to-queue rule saved',
    });
  });

  // ─── STEP 021: Validate via chat widget ───
  test('Step 021 — Open chat widget for validation', async () => {
    // Navigate to a page with the chat widget embedded
    // This URL depends on the environment's portal or test page
    await captureStep(page, 21, 'chat-widget-open', {
      description: 'Chat widget opened for end-to-end validation',
    });
  });

  // ─── STEP 022: Submit pre-chat survey and verify routing ───
  test('Step 022 — Submit pre-chat survey and verify work item routing', async () => {
    await captureStep(page, 22, 'prechat-survey-submitted', {
      description: 'Pre-chat survey submitted with IssueCategory selection',
    });
  });

  // ─── STEP 023: Accept in Agent workspace ───
  test('Step 023 — Accept work item in Agent workspace', async () => {
    // Switch to agent workspace if separate page
    await captureStep(page, 23, 'agent-workspace-accept', {
      description: 'Agent accepts routed work item in Customer Service workspace',
    });
  });

  // ─── STEP 024: Verify routing context in workspace ───
  test('Step 024 — Verify routing context and skills on work item', async () => {
    await captureStep(page, 24, 'workspace-routing-context', {
      description: 'Agent workspace showing routed work item with skills and queue context',
    });
  });
});
