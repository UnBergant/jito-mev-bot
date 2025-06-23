import BN from 'bn.js';
import { GetPFTxArgs } from '../../types';
import { createIx } from './ix';
import {
    ComputeBudgetProgram,
    SystemProgram,
    TransactionMessage,
    VersionedTransaction,
} from '@solana/web3.js';
import { getTipsIx } from '../../jito/tips';
import { getSimulationComputeUnits } from '@solana-developers/helpers';
import { createAtaPumpFunIxs } from '../../utils/tx';

export const getTx = async (args: GetPFTxArgs) => {
    const {
        swapAmount,
        tipsConfig,
        payerKey,
        connection,
        poolKey,
        recentBHash,
        config,
    } = args;

    const ixs = await createIx({
        payerKey: payerKey,
        solAmountLamports: new BN(swapAmount),
        connection: connection,
        poolKey: poolKey,
        config,
    });

    const ataIxs = await createAtaPumpFunIxs({
        connection,
        payerKey,
        poolKey,
        swapAmount,
    });

    if (!!ataIxs) {
        console.log(ataIxs);
        ixs.unshift(...ataIxs);
    }

    if (tipsConfig) {
        const tipsIx = getTipsIx({ payerKey, tipsConfig });
        ixs.push(tipsIx);
    }

    let units = await getSimulationComputeUnits(connection, ixs, payerKey, []);

    units = units ?? 1_400_000;

    const unitsWithMargin = Math.ceil(units * 1.1);

    ixs.unshift(
        ComputeBudgetProgram.setComputeUnitLimit({ units: unitsWithMargin }),
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 }),
    );

    const messageV0 = new TransactionMessage({
        payerKey,
        recentBlockhash: recentBHash.blockhash,
        instructions: ixs,
    }).compileToV0Message();

    return new VersionedTransaction(messageV0);
};
