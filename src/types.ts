import {
  BlockhashWithExpiryBlockHeight,
  Connection,
  Keypair,
  PublicKey,
  TransactionInstruction,
  VersionedTransaction,
} from '@solana/web3.js';
import { JitoJsonRpcClient } from 'jito-js-rpc';
import { Result } from 'jito-ts/dist/sdk/block-engine/utils';
import { SearcherClientError } from 'jito-ts/src/sdk/block-engine/searcher';
import { getConfig } from './config';
import { DEX, DEX_TYPE, TRADE_DIRECTION } from './constants';
import { SubscribeUpdateTransaction } from '@triton-one/yellowstone-grpc/dist/types/grpc/geyser';
import { ApiV3PoolInfoStandardItem, Raydium } from '@raydium-io/raydium-sdk-v2';
import { AmmRpcData } from '@raydium-io/raydium-sdk-v2/lib/raydium/liquidity/type';
import {
  x as AmmV4Keys,
  y as AmmV5Keys,
} from '@raydium-io/raydium-sdk-v2/lib/api-7daf490d';

export type TIPS_PERCENTILES = {
  landed_tips_25th_percentile: number;
  landed_tips_50th_percentile: number;
  landed_tips_75th_percentile: number;
  landed_tips_95th_percentile: number;
  landed_tips_99th_percentile: number;
  ema_landed_tips_50th_percentile: number;
};

export type TIPS_STATE = {
  percentiles: TIPS_PERCENTILES;
  updatedAt: number;
};

export interface CreateTxArgs<T> {
  swapAmount: number;
  sendTips?: boolean;
}

export interface TipsConfig {
  tipsKey: PublicKey;
  tipsLamports: number;
}

export interface GetTipsIxArgs {
  payerKey: PublicKey;
}

export interface IBuildMemoTx {
  payer: Keypair;
  recentBHash: string;
  tipsIx?: TransactionInstruction;
  message: string;
}

export type ICurrentLeader = Result<
  {
    currentSlot: number;
    nextLeaderSlot: number;
    nextLeaderIdentity: string;
  },
  SearcherClientError
>;

export type ConfigGlobal = ReturnType<typeof getConfig>;

export type DEX_TYPE_VALUE = (typeof DEX_TYPE)[keyof typeof DEX_TYPE];

export interface IAdapter<T extends CreateTxArgs<any>> {
  createTx: (args: T) => Promise<VersionedTransaction>;
  matchDexAddress: (fullAccountList: PublicKey[]) => PublicKey | undefined;
  contractAddress: DEX;
  type: DEX_TYPE_VALUE;
}

export interface IGetTx {
  poolInfo: ApiV3PoolInfoStandardItem;
  poolKeys: AmmV4Keys | AmmV5Keys;
  poolRpcData: AmmRpcData;
  swapAmount: number;
  mintIn: PublicKey;
  mintOut: PublicKey;
  payer: Keypair;
  tipsConfig?: TipsConfig;
  raydium?: Raydium;
}

export interface GetPFTxArgs {
  swapAmount: number;
  sendTips?: boolean;
}

export type TxTriggerData = {
  txAmount: number; // lamports
  action: TRADE_DIRECTION;
  tx: SubscribeUpdateTransaction;
  createdAt: Date;
};

export type TradeTriggerInfo = {
  CA?: string; // to save time no CA
  poolKey: PublicKey; // to detect specific trading source
  trigger: TxTriggerData;
  symbol?: string;
};

export type BlockHashWithHeight = {
  blockhash: string;
  lastValidBlockHeight: number;
};
