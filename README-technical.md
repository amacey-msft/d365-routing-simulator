# D365 Unified Routing & Agent Configuration Guide

An interactive lab guide, Playwright automation harness, and web-based routing simulator for Dynamics 365 Contact Center Unified Routing.

## What's in this repo

| Folder | Purpose |
|---|---|
| `/lab-guide/` | Step-by-step lab guide with annotated screenshots |
| `/automation/` | Playwright tests that capture screenshots from a live Power Platform environment |
| `/web-app/` | Static interactive web app explaining routing decisions |
| `/diagrams/` | Mermaid diagrams of the routing pipeline |
| `/infra/` | Bicep IaC for Azure App Service deployment |
| `/notes/` | Decisions, assumptions, doc gaps & diffs |
| `/references/` | Baseline lab guide source documents (not committed) |
| `/.squad/` | Squad AI team state |

## Quick Start

### Prerequisites
- Node.js ≥ 20
- Docker Desktop (for local container run)
- `gh` CLI authenticated (`gh auth login`)
- `pac` CLI authenticated to your Power Platform environment
- A Power Platform environment with Dynamics 365 Contact Center

### 1. Clone and install
```bash
git clone https://github.com/<owner>/D365RoutingGuide.git
cd D365RoutingGuide
cp .env.example .env   # fill in your environment details
```

### 2. Run Playwright automation (capture screenshots)
```bash
cd automation
npm install
npx playwright install chromium
npx playwright test
```

### 3. Run the web app locally
```bash
cd web-app
# Option A: direct
npx serve .
# Option B: Docker
docker compose up
```
Open http://localhost:3000

### 4. Deploy to Azure App Service
See [/notes/azure-deploy.md](notes/azure-deploy.md) and [/infra/README.md](infra/README.md).

## Lab Flow (Canonical Sequence)

```
Unified Routing enablement
  → Chat workstream
    → Pre-chat survey (IssueCategory)
      → Skills definition
        → Work classification ruleset (skill-based)
          → Route-to-queue ruleset (skill match)
            → Validate via chat widget + workspace
```

See the full routing pipeline diagram: [/diagrams/unified-routing-flow.mmd](diagrams/unified-routing-flow.mmd)

## Download / Install Solution

The Power Platform unmanaged solution is available on the [Releases](../../releases) page.

1. Download `D365RoutingSimulator_1_0_0_1.zip`
2. In your Power Platform environment: **Solutions → Import Solution**
3. Select **Unmanaged** and follow the wizard

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
