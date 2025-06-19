import { Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js';
import { searcher } from 'jito-ts';
import { JitoJsonRpcClient } from 'jito-js-rpc';
import { Result } from 'jito-ts/dist/sdk/block-engine/utils';
import { SearcherClientError } from 'jito-ts/src/sdk/block-engine/searcher';
import { SearcherClient } from 'jito-ts/dist/sdk/block-engine/searcher';
import { getConfig } from './config';

export type TIPS_PERCENTILES = {
    landed_tips_25th_percentile: number;
    landed_tips_50th_percentile: number;
    landed_tips_75th_percentile: number;
    landed_tips_95th_percentile: number;
    landed_tips_99th_percentile: number;
    ema_landed_tips_50th_percentile: number;
};

export interface ISendCustomBundle {
    payer: Keypair;
    recBHash: string;
    jClient: JitoJsonRpcClient;
}

export interface ICreateTxs extends ISendCustomBundle {
    searcherClient?: SearcherClient;
}

export interface IGetTipsIx {
    payer: Keypair;
    tipLamports: number;
    jClient: JitoJsonRpcClient;
    searcherClient?: SearcherClient;
}

export interface IBuildMemoTx {
    payer: Keypair;
    recBHash: string;
    tipIx?: TransactionInstruction;
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

export interface ISetupSubscriptions {
    config: ConfigGlobal;
}
