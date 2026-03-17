# Contributing

## Getting started

1. Fork and clone the repository
2. Copy `.env.example` to `.env` and fill in your Power Platform environment details
3. Install dependencies: `cd automation && npm install`
4. Run tests: `npx playwright test`

## Branch conventions

- `main` — stable, reviewed content
- `feature/<name>` — work-in-progress features
- `fix/<name>` — bug fixes

## Pull Request process

1. Open an issue describing the change
2. Create a feature branch
3. Make changes, ensure Playwright tests pass
4. Open a PR referencing the issue
5. Request review

## Squad

This project uses [Squad](https://github.com/bradygaster/squad) for AI-assisted team coordination. Team state lives in `/.squad/`.

## Style

- Lab guide steps use sequential IDs: `step-001`, `step-002`, etc.
- Screenshots go in `/lab-guide/images/` and must be referenced in `map.json`
- Every step includes WHY, HOW, Expected Result, Common Pitfall, and Pro Tip sections
