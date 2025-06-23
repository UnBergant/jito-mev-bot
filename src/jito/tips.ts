import { GetTipsIxArgs, TIPS_PERCENTILES } from '../types';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { URLS } from '../constants';

const getTipsAmount = async (): Promise<TIPS_PERCENTILES> => {
    const response = await fetch(URLS.jitoTips);

    if (!response.ok) {
        throw new Error(`❌ Ошибка: ${response.status} ${response.statusText}`);
    }
    const tipsPercentile = await response.json();
    return tipsPercentile[0];
};

const getTipsIx = ({
    payerKey,
    tipsConfig: { tipsLamports, tipsKey },
}: GetTipsIxArgs) => {
    console.log('🫰 Tips to pay (lamports):', tipsLamports);

    return SystemProgram.transfer({
        fromPubkey: payerKey,
        toPubkey: tipsKey,
        lamports: tipsLamports,
    });
};

export { getTipsIx, getTipsAmount };
