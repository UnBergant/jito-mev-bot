import { subscribe, LaserstreamConfig } from 'helius-laserstream';
import { getRequestConfig } from './requestConfig';
import { getHeliusCallbacks } from './callbacks';
import { state } from '../state';

async function setupSubscriptions() {
  const { heliusEndpoint, heliusApiKey, POOL } = state.config;
  const streamConfig: LaserstreamConfig = {
    apiKey: heliusApiKey,
    endpoint: heliusEndpoint,
  };

  const requestConfig = getRequestConfig(POOL);

  const { onData, onError } = getHeliusCallbacks();

  await subscribe(streamConfig, requestConfig, onData, onError);
  console.log('👀 StreamReader initialized');
}

export { setupSubscriptions };
