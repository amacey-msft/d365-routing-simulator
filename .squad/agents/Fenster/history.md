# Fenster — History

## Learnings
- nginx:alpine is the smallest viable container for serving static HTML
- /health endpoint configured via nginx location block returning 200 plain text
- Docker Compose maps port 3000:80 for local development
- Bicep uses B1 Linux App Service Plan with container config for Azure deployment
- GitHub Actions workflow uses azure/webapps-deploy@v3 for container deployment
- Docker image builds successfully and serves content at localhost:3000
