import { CreateTxArgs, IAdapter, TipsConfig } from '../../types';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { DEX, DEX_TYPE } from '../../constants';
import { NATIVE_MINT } from '@solana/spl-token';
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
import { ApiV3PoolInfoStandardItem } from '@raydium-io/raydium-sdk-v2';

type RaydiumPoolInfo = {
  poolRpcData: AmmRpcData;
  poolInfo: ComputeAmountOutParam['poolInfo'];
  poolKeys: AmmV4Keys | AmmV5Keys;
};

interface ICreateTxRaydiumSAmm extends CreateTxArgs<RaydiumPoolInfo> {}

const createTx = async ({ sendTips }: ICreateTxRaydiumSAmm) => {
  console.log('⚡ Raydium Standart AMM create TX');

  const poolInfo = {
    mintA: {
      address: '<KEY>',
    },
    mintB: {
      address: '<KEY>',
    },
  } as ApiV3PoolInfoStandardItem;

  const poolKeys = {} as AmmV4Keys | AmmV5Keys;

  const poolRpcData = {} as AmmRpcData;

  const tipsConfig = {} as TipsConfig;

  const { transaction$, config, payer } = state;
  const swapAmount =
    0.0001 * LAMPORTS_PER_SOL ||
    Math.floor(transaction$.value!.trigger.txAmount * config.X);
  const inputMint = NATIVE_MINT.toBase58();

  if (
    poolInfo.mintA.address !== inputMint &&
    poolInfo.mintB.address !== inputMint
  )
    throw new Error('input mint does not match pool');

  const baseIn = inputMint === poolInfo.mintA.address;
  const [mintIn, mintOut] = baseIn
    ? [poolInfo.mintA, poolInfo.mintB]
    : [poolInfo.mintB, poolInfo.mintA];

  return await getTx({
    poolInfo,
    poolKeys,
    poolRpcData,
    swapAmount,
    mintIn: new PublicKey(mintIn.address),
    mintOut: new PublicKey(mintOut.address),
    payer,
    tipsConfig,
  });
};

const matchDexAddress = (fullAccountList: PublicKey[]) => {
  return fullAccountList.find(
    (pubkey) => pubkey.toBase58() === DEX.RAYDIUM_ST_AMM,
  );
};

export default {
  createTx,
  matchDexAddress,
  contractAddress: DEX.RAYDIUM_ST_AMM,
  type: DEX_TYPE[DEX.RAYDIUM_ST_AMM],
} as IAdapter<ICreateTxRaydiumSAmm>;
