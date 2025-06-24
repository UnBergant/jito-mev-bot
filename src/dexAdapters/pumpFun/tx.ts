import BN from 'bn.js';
import { GetPFTxArgs } from '../../types';
import { createIx } from './ix';
import {
    ComputeBudgetProgram,
    TransactionMessage,
    VersionedTransaction,
} from '@solana/web3.js';
import { getTipsIx } from '../../jito/tips';
import { getSimulationComputeUnits } from '@solana-developers/helpers';

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

    // For some pools sWSOL is needed in advance
    // const ataIxs = await createAtaPumpFunIxs({
    //     connection,
    //     payerKey,
    //     poolKey,
    //     swapAmount,
    // });
    //
    // if (!!ataIxs) {
    //     console.log(ataIxs);
    //     ixs.unshift(...ataIxs);
    // }

    if (tipsConfig) {
        const tipsIx = getTipsIx({ payerKey, tipsConfig });
        ixs.push(tipsIx);
    }

    // For example create global context with value for this type of requests. Because it is +- the same result
    // let units = await getSimulationComputeUnits(connection, ixs, payerKey, []);
    // units = units ?? 1_400_000;
    let units = 1_400_000;

    const unitsWithMargin = Math.ceil(units * 1.1);

    ixs.unshift(
        ComputeBudgetProgram.setComputeUnitLimit({ units: unitsWithMargin }),
        ComputeBudgetProgram.setComputeUnitPrice({
            microLamports: config.CU_PRICE,
        }),
    );

    const messageV0 = new TransactionMessage({
        payerKey,
        recentBlockhash: recentBHash.blockhash,
        instructions: ixs,
    }).compileToV0Message();

    return new VersionedTransaction(messageV0);
};
