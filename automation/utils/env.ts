/**
 * Environment-based configuration for the automation harness.
 */
export function getEnvConfig() {
  return {
    powerappsUrl: process.env.POWERAPPS_URL || 'https://make.powerapps.com',
    ppacUrl: process.env.PPAC_URL || 'https://admin.powerplatform.microsoft.com',
    environmentId: process.env.ENVIRONMENT_ID_OR_NAME || '',
    d365BaseUrl: process.env.D365_BASE_URL || '',
    d365AdminAppUrl: process.env.D365_ADMIN_APP_URL || '',
    authMode: (process.env.AUTH_MODE || 'interactive') as 'interactive' | 'storageState',
    storageStatePath: process.env.STORAGE_STATE_PATH || '.auth/storageState.json',
    outputLocale: process.env.OUTPUT_LOCALE || 'en-US',
  };
}
