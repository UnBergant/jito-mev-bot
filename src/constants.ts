export const URLS = {
    jitoTips: 'https://bundles.jito.wtf/api/v1/bundles/tip_floor',
};

export const LAMPORTS_IN_SOL = 1_000_000_000;

//https://docs.raydium.io/raydium/protocol/developers/addresses
export enum DEX {
    RAYDIUM_ST_AMM = '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
    RAYDIUM_LEGACY_V4 = 'CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C', // OpenBook
    PUMP_FUN = 'pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA',
}

export const DEX_TYPE = {
    [DEX.RAYDIUM_LEGACY_V4]: '⚡ Raydium Legacy AMM V4',
    [DEX.RAYDIUM_ST_AMM]: '⚡ Raydium Standart AMM',
    [DEX.PUMP_FUN]: '💊 Pump Fun',
} as const;

export enum TRADE_DIRECTION {
    SELL = 'sell',
    BUY = 'buy',
}
