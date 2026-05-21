# D365 Contact Center Routing Simulator

Test and demonstrate your Dynamics 365 Contact Center routing rules — without needing a live customer interaction.

This solution adds a simulator app to your D365 environment. You can set routing field values manually, fire them through your routing rules, and see exactly which queue an interaction would land in. Great for validating routing logic before go-live, or showing customers how their routing setup works.

## What You Get

- **Routing simulator app** — set contact attributes and test which queue they route to
- **Pre-built routing scenarios** — common patterns ready to run out of the box
- **Custom scenario builder** — define your own scenarios for demos or testing
- Runs natively inside your D365 environment — no external tools required

## Requirements

- Dynamics 365 Contact Center with Unified Routing enabled
- System Customizer role (or higher) in your environment

## Install

### Step 1 — Download the solution
Go to the [Releases](../../releases) page and download `D365RoutingSimulator_1_0_0_1.zip`.

### Step 2 — Import into your environment
1. Go to [make.powerapps.com](https://make.powerapps.com) and select your environment
2. Click **Solutions** → **Import solution**
3. Upload the zip file and follow the wizard
4. Choose **Unmanaged** when asked

### Step 3 — Open the simulator
Once imported, find the **D365 Routing Simulator** app in your list of apps at [make.powerapps.com](https://make.powerapps.com) → **Apps**, or directly in your D365 environment app switcher.

---

## For Developers

This repo also contains a Playwright automation harness, a web-based routing guide, and Bicep infrastructure templates for contributors and advanced scenarios. See [README-technical.md](README-technical.md) for full developer documentation.

---
*Built by Al Macey · May 2026*
