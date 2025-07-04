import BN from 'bn.js';
import { GetPFTxArgs } from '../../types';
import { createIx } from './ix';
import {
  ComputeBudgetProgram,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import { getTipsIx } from '../../jito/tips';
import { state } from '../../state';

export const getTx = async (args: GetPFTxArgs) => {
  const { swapAmount, sendTips = false } = args;
  const { recentBHash$ } = state;

  const {
    config,
    payer: { publicKey: payerKey },
  } = state;

  const ixs = await createIx({
    solAmountLamports: new BN(swapAmount),
  });

  if (sendTips) {
    const tipsIx = getTipsIx({ payerKey });
    ixs.push(tipsIx);
  }

  // For example create global context with value for this type of requests. Because it is +- the same result
  // let units = await getSimulationComputeUnits(connection, ixs, payerKey, []);
  // units = units ?? 1_400_000;
  let units = 1_400_000;

  const unitsWithMargin = Math.ceil(units * 1.1);
  // createSyncNativeInstruction();

  ixs.unshift(
    ComputeBudgetProgram.setComputeUnitLimit({ units: unitsWithMargin }),
    ComputeBudgetProgram.setComputeUnitPrice({
      microLamports: config.CU_PRICE,
    }),
  );

  const messageV0 = new TransactionMessage({
    payerKey,
    recentBlockhash: recentBHash$.value!.blockhash,
    instructions: ixs,
  }).compileToV0Message();

  return new VersionedTransaction(messageV0);
};
