# Infrastructure as Code — Bicep

## Overview

The `main.bicep` template provisions:
- **App Service Plan** (Linux, B1 SKU by default)
- **Web App** (configured for container deployment from ACR)

## Parameters

| Parameter | Required | Description |
|---|---|---|
| `appName` | Yes | Name of the Web App (must be globally unique) |
| `location` | No | Azure region (defaults to resource group location) |
| `skuName` | No | App Service Plan SKU (default: `B1`) |
| `containerImage` | Yes | Full container image reference (e.g., `yourregistry.azurecr.io/d365-routing-guide:latest`) |
| `registryUrl` | Yes | Container registry URL (e.g., `https://yourregistry.azurecr.io`) |
| `registryUsername` | Yes | Registry username (secure) |
| `registryPassword` | Yes | Registry password (secure) |

## Deployment

### Prerequisites
- Azure CLI installed and authenticated (`az login`)
- A resource group created: `az group create --name your-rg --location eastus`
- A container image pushed to ACR

### Deploy
```bash
az deployment group create \
  --resource-group your-rg \
  --template-file infra/main.bicep \
  --parameters \
    appName=d365-routing-guide \
    containerImage=yourregistry.azurecr.io/d365-routing-guide:latest \
    registryUrl=https://yourregistry.azurecr.io \
    registryUsername=youruser \
    registryPassword=yourpassword
```

### Outputs
- `webAppUrl` — the deployed app URL (e.g., `https://d365-routing-guide.azurewebsites.net`)
- `webAppName` — the app resource name

## Cleanup
```bash
az group delete --name your-rg --yes --no-wait
```
