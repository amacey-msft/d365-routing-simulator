# Playwright Automation — D365 Unified Routing Lab

## Overview

This Playwright automation harness captures screenshots from a live Power Platform environment for every step of the Unified Routing & Agent Configuration lab guide.

## Prerequisites

- Node.js ≥ 20
- A Power Platform environment with Dynamics 365 Contact Center
- `.env` file in the repo root (copy from `.env.example`)

## Setup

```bash
cd automation
npm install
npx playwright install chromium
```

## Running

### Interactive mode (first run — sign in manually)

```bash
npm run test:headed
```

When the browser opens, sign in to your Power Platform account. Press **Resume** in the Playwright inspector to continue. Your session will be saved for future runs.

### Headless mode (reusing saved session)

Set `AUTH_MODE=storageState` in `.env`, then:

```bash
npm test
```

If the saved session expires, the harness falls back to interactive login and refreshes the saved state.

### Debug mode

```bash
npm run test:debug
```

## Output

- **Screenshots**: `/lab-guide/images/step-###-slug.png`
- **Map file**: `/lab-guide/images/map.json` — maps step IDs to filenames, URLs, descriptions, and timestamps
- **Traces**: `automation/test-results/` (retained on failure)

## Customizing Steps

Edit `tests/unified-routing-lab.spec.ts` to add, remove, or modify lab steps. Each step calls `captureStep(page, stepNumber, slug, options)`.

## Selectors

Centralized in `utils/selectors.ts`. Update when Power Platform UI changes.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `POWERAPPS_URL` | `https://make.powerapps.com` | Power Apps base URL |
| `PPAC_URL` | `https://admin.powerplatform.microsoft.com` | Admin center URL |
| `ENVIRONMENT_ID_OR_NAME` | (required) | Target environment |
| `D365_BASE_URL` | (optional) | Org URL for direct navigation |
| `AUTH_MODE` | `interactive` | `interactive` or `storageState` |
| `STORAGE_STATE_PATH` | `.auth/storageState.json` | Path to saved browser state |
| `OUTPUT_LOCALE` | `en-US` | Expected UI locale |
