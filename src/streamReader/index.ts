import { subscribe, LaserstreamConfig } from 'helius-laserstream';
import { ISetupSubscriptions } from '../types';
import { getRequestConfig } from './requestConfig';
import { getHeliusCallbacks } from './callbacks';

async function setupSubscriptions({ config }: ISetupSubscriptions) {
    const { heliusEndpoint, heliusApiKey } = config;
    const streamConfig: LaserstreamConfig = {
        apiKey: heliusApiKey,
        endpoint: heliusEndpoint,
    };

    const requestConfig = getRequestConfig(config);

    const { onData, onError } = getHeliusCallbacks(config);

    await subscribe(streamConfig, requestConfig, onData, onError);
}

export { setupSubscriptions };
