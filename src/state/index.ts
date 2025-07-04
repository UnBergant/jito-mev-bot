import { BehaviorSubject } from 'rxjs';
import { BlockHashWithHeight, TIPS_STATE, TradeTriggerInfo } from '../types';
import { getConfig } from '../config';
import { defaultPercentiles } from '../jito/tips';
import { PumpAmmSdk } from '@pump-fun/pump-swap-sdk';
import { Blockhash, Connection, Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { JitoJsonRpcClient } from 'jito-js-rpc';

const config = getConfig();
const connection = new Connection(config.rpcUrl, 'confirmed');
const payer = Keypair.fromSecretKey(bs58.decode(config.privateKey));

export const state = {
  payer,
  config,
  connection,
  PumpAmmSdk: new PumpAmmSdk(connection),
  jClient: new JitoJsonRpcClient(config.jitoRpcUrl),
  tips$: new BehaviorSubject<TIPS_STATE>({
    percentiles: defaultPercentiles,
    updatedAt: Date.now(),
  }),
  recentBHash$: new BehaviorSubject<BlockHashWithHeight | null>(null),
  transaction$: new BehaviorSubject<TradeTriggerInfo | null>(null),
};
