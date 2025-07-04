import { CreateTxArgs, IAdapter } from '../../types';
import { PublicKey } from '@solana/web3.js';
import { DEX, DEX_TYPE } from '../../constants';
import { getTx } from './tx';
import {
  AmmRpcData,
  ComputeAmountOutParam,
} from '@raydium-io/raydium-sdk-v2/lib/raydium/liquidity/type';
import {
  x as AmmV4Keys,
  y as AmmV5Keys,
} from '@raydium-io/raydium-sdk-v2/lib/api-7daf490d';
import { state } from '../../state';
import { promisifyTimeout } from '../../utils/promises';

export type PumpFunPoolInfo = {
  poolRpcData: AmmRpcData;
  poolInfo: ComputeAmountOutParam['poolInfo'];
  poolKeys: AmmV4Keys | AmmV5Keys;
};

export interface ICreateTxsPumpFun extends CreateTxArgs<PumpFunPoolInfo> {}

const createTx = async (args: ICreateTxsPumpFun) => {
  const { sendTips, swapAmount } = args;

  const { payer } = state;

  console.log(
    `🔄 Create tx: ${DEX_TYPE[DEX.PUMP_FUN]} swapAmount: ${swapAmount}`,
  );

  const tx = await getTx({
    swapAmount,
    sendTips,
  });
  tx.sign([payer]);

  // const result = await state.connection.simulateTransaction(tx, {
  //   sigVerify: true, // проверка подписи (по умолчанию false)
  //   commitment: 'confirmed',
  // });
  // console.log(result);

  // await promisifyTimeout(100000);

  return tx;
};

const matchDexAddress = (fullAccountList: PublicKey[]) => {
  return fullAccountList.find((pubkey) => pubkey.toBase58() === DEX.PUMP_FUN);
};

export default {
  createTx,
  matchDexAddress,
  contractAddress: DEX.PUMP_FUN,
  type: DEX_TYPE[DEX.PUMP_FUN],
} as IAdapter<ICreateTxsPumpFun>;
