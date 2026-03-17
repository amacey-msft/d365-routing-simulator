# Decisions

All significant architectural, design, and implementation decisions for this project.

| # | Date | Decision | Rationale |
|---|------|----------|-----------|
| 1 | 2026-03-17 | Use existing Power Platform environment (no new provisioning) | Matches real-world lab delivery; avoids license/provisioning complexity |
| 2 | 2026-03-17 | Canonical flow: Unified Routing → Chat workstream → Pre-chat survey → Skills → Classification → Route-to-queue → Validation | Aligned to baseline lab references |
| 3 | 2026-03-17 | Playwright for screenshot automation | Cross-browser, built-in screenshot/trace support, TypeScript native |
| 4 | 2026-03-17 | Static web app (HTML/CSS/JS) for routing simulator | No build step required, simple Docker serve, easy Azure App Service deploy |
| 5 | 2026-03-17 | Docker + Azure App Service (container) for deployment | Consistent local/cloud experience, CI/CD via GitHub Actions |
| 6 | 2026-03-17 | Squad for team coordination | Persists agent knowledge, parallelizes work, integrates with GitHub Issues/PRs |
