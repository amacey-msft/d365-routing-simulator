# Web App — D365 Unified Routing Simulator

A static interactive web application that visualizes how Dynamics 365 Contact Center Unified Routing makes decisions.

## Features

- Visual pipeline: Channel → Workstream → Classification → Route-to-Queue → Assignment → Agent Workspace
- Toggle controls for Issue Category, Skills, Capacity, and Queues
- "Why This Routed Here" decision trace panel
- Animated pipeline stage progression

## Run Locally

### Option A: Static file server
```bash
npx serve .
```
Open http://localhost:3000

### Option B: Docker
```bash
docker build -t d365-routing-guide .
docker run -p 3000:80 d365-routing-guide
```
Open http://localhost:3000

### Option C: Docker Compose (from repo root)
```bash
docker compose up
```
Open http://localhost:3000

## Health Check

The container serves a static HTML file. A simple readiness check:
```bash
curl -f http://localhost:3000/ || exit 1
```
The Dockerfile includes a HEALTHCHECK instruction.

## Deploy to Azure

See [/notes/azure-deploy.md](../notes/azure-deploy.md).
