import { TRADE_DIRECTION } from './constants';
import dotenv from 'dotenv';

dotenv.config();

const getRequiredEnvVar = (key: string): string => {
    const value = process.env[key];
    if (!value) throw new Error(`❌ Missing required env variable: ${key}`);
    return value;
};

export const getConfig = () => {
    return {
        privateKey: getRequiredEnvVar('PRIVATE_KEY_BASE58'),
        rpcUrl: getRequiredEnvVar('RPC_URL'),
        jitoBlockEngineUrl: process.env['JITO_BLOCK_ENGINE_URL'] || '',
        jitoRpcUrl: getRequiredEnvVar('JITO_RPC_URL'),
        jitoTipsAddress: getRequiredEnvVar('JITO_TIPS_ADDRESS'),
        heliusEndpoint: getRequiredEnvVar('HELIUS_ENDPOINT'),
        heliusApiKey: getRequiredEnvVar('HELIUS_API_KEY'),
        bundleTransactionLimit: parseInt(
            getRequiredEnvVar('BUNDLE_TRANSACTION_LIMIT'),
            10,
        ),
        numberOfButches: parseInt(getRequiredEnvVar('NUMBER_OF_BUTCHES'), 10),
        triggerSizeSol: parseFloat(getRequiredEnvVar('TRIGGERED_SIZE_SOL')), // SOL per transaction
        X: parseFloat(getRequiredEnvVar('X')), // sell proportion amount
        POOL: getRequiredEnvVar('POOL'),
        SLIPPAGE: parseFloat(getRequiredEnvVar('SLIPPAGE')),
        TRIGGER_ACTION: TRADE_DIRECTION.BUY,
        MODE: TRADE_DIRECTION.BUY,
        CU_PRICE: 100_000,
    };
};
