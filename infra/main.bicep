@description('Name of the Web App')
param appName string

@description('Location for all resources')
param location string = resourceGroup().location

@description('App Service Plan SKU')
param skuName string = 'B1'

@description('Container image to deploy (e.g., yourregistry.azurecr.io/d365-routing-guide:latest)')
param containerImage string

@description('Container registry URL (e.g., https://yourregistry.azurecr.io)')
param registryUrl string

@description('Container registry username')
@secure()
param registryUsername string

@description('Container registry password')
@secure()
param registryPassword string

resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: '${appName}-plan'
  location: location
  kind: 'linux'
  sku: {
    name: skuName
  }
  properties: {
    reserved: true // required for Linux
  }
}

resource webApp 'Microsoft.Web/sites@2023-12-01' = {
  name: appName
  location: location
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'DOCKER|${containerImage}'
      appSettings: [
        {
          name: 'DOCKER_REGISTRY_SERVER_URL'
          value: registryUrl
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_USERNAME'
          value: registryUsername
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_PASSWORD'
          value: registryPassword
        }
        {
          name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
          value: 'false'
        }
      ]
      alwaysOn: true
    }
    httpsOnly: true
  }
}

output webAppUrl string = 'https://${webApp.properties.defaultHostName}'
output webAppName string = webApp.name
