const getRequiredEnvVar = (key: string): string => {
    const value = process.env[key];
    if (!value) throw new Error(`❌ Missing required env variable: ${key}`);
    return value;
};

export const getConfig = () => {
    return {
        privateKey: getRequiredEnvVar('PRIVATE_KEY_BASE58'),
        rpcUrl: getRequiredEnvVar('RPC_URL'),
        jitoBlockEngineUrl: getRequiredEnvVar('JITO_BLOCK_ENGINE_URL'),
        jitoRpcUrl: getRequiredEnvVar('JITO_RPC_URL'),
        heliusEndpoint: getRequiredEnvVar('HELIUS_ENDPOINT'),
        heliusApiKey: getRequiredEnvVar('HELIUS_API_KEY'),
        bundleTransactionLimit: parseInt(
            getRequiredEnvVar('BUNDLE_TRANSACTION_LIMIT'),
            5,
        ),
        triggerSize: 5, // SOL per transaction
        X: 0.01, // sell proportion amount
        POOL: '8kGaHesGdvv3GC4kYX9bYMFnoqcCGd4KrtnpLAm6dDVD',
    };
};
