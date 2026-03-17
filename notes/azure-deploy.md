# Azure Deployment Guide — D365 Routing Guide Web App

## Overview

The interactive web app can be deployed to **Azure App Service for Containers**. This guide covers three deployment paths:

1. **Manual** — build and push the container, create the App Service
2. **CI/CD** — GitHub Actions workflow (`.github/workflows/deploy-webapp.yml`)
3. **IaC** — Bicep template (`/infra/main.bicep`)

---

## Prerequisites

- Azure subscription
- Azure Container Registry (ACR) or Docker Hub
- Azure CLI (`az`) installed and authenticated
- GitHub repository with secrets configured

## GitHub Secrets Required

| Secret Name | Description |
|---|---|
| `AZURE_CREDENTIALS` | Service principal JSON for `azure/login` action |
| `REGISTRY_LOGIN_SERVER` | ACR login server (e.g., `yourregistry.azurecr.io`) |
| `REGISTRY_USERNAME` | ACR admin username |
| `REGISTRY_PASSWORD` | ACR admin password |
| `AZURE_WEBAPP_NAME` | App Service Web App name |

---

## Path 1: Manual Deployment

```bash
# Build container
cd web-app
docker build -t d365-routing-guide:latest .

# Tag for ACR
docker tag d365-routing-guide:latest yourregistry.azurecr.io/d365-routing-guide:latest

# Push to ACR
az acr login --name yourregistry
docker push yourregistry.azurecr.io/d365-routing-guide:latest

# Create App Service (if not using Bicep)
az webapp create \
  --resource-group your-rg \
  --plan your-plan \
  --name d365-routing-guide \
  --deployment-container-image-name yourregistry.azurecr.io/d365-routing-guide:latest
```

## Path 2: CI/CD with GitHub Actions

The workflow at `/.github/workflows/deploy-webapp.yml` automates:
1. Build the container image
2. Push to ACR
3. Deploy to App Service

Trigger: push to `main` branch (paths: `web-app/**`).

## Path 3: Infrastructure as Code (Bicep)

See `/infra/README.md` for parameter details.

```bash
az deployment group create \
  --resource-group your-rg \
  --template-file infra/main.bicep \
  --parameters appName=d365-routing-guide \
               containerImage=yourregistry.azurecr.io/d365-routing-guide:latest \
               registryUrl=https://yourregistry.azurecr.io \
               registryUsername=youruser \
               registryPassword=yourpassword
```
