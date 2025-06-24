import { DEX, DEX_TYPE } from '../constants';
import raydiumStandartAmm from './raydiumStandartAmm';
import raydiumLegacyAmmV4 from './raydiumLegacyAmmV4';
import pumpFun from './pumpFun';

import { TradeInfo } from '../types';
import { usesLookupTable } from '../jito/lookupTables';
import { PublicKey } from '@solana/web3.js';

export const dexAdapters = {
    [DEX.PUMP_FUN]: pumpFun,
    [DEX.RAYDIUM_ST_AMM]: raydiumStandartAmm,
    [DEX.RAYDIUM_LEGACY_V4]: raydiumLegacyAmmV4,
};

export const getDexAdapter = (fullAccountList: PublicKey[]) => {
    // It is not the best solution. Better to choose adapter with if to have direct access
    const dexAdapter = Object.values(dexAdapters).find(({ matchDexAddress }) =>
        matchDexAddress(fullAccountList),
    );
    if (!dexAdapter) {
        return null;
    }

    console.log(
        '🛒 Dex adapter selected:',
        DEX_TYPE[dexAdapter.contractAddress],
    );
    return dexAdapter;
};
