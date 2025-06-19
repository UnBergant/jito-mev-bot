import { JitoJsonRpcClient } from 'jito-js-rpc';
import { createTxs } from './txs';
import { promisifyTimeout } from '../utils/promises';
import { Connection, Keypair } from '@solana/web3.js';
import { waitForJitoLeader } from './leader';
import { searcherClient } from 'jito-ts/dist/sdk/block-engine/searcher';
import { ConfigGlobal, ISendCustomBundle } from '../types';
import { emitter, EVENT, TradeInfo } from '../eventBus';
import bs58 from 'bs58';

interface IJitoInit {
    config: ConfigGlobal;
}

export const init = async ({ config }: IJitoInit) => {
    const payer = Keypair.fromSecretKey(bs58.decode(config.privateKey));
    const connection = new Connection(config.rpcUrl, 'confirmed');
    const blockHash = await connection.getLatestBlockhash();
    const recBHash = blockHash.blockhash;
    const jClient = new JitoJsonRpcClient(config.jitoRpcUrl);
    // To avoid sending transactions in wrong slot. But higher rate limits are needed
    // const searcherClient = searcher.searcherClient(config.jitoBlockEngineUrl);
    // const currentLeader = await waitForJitoLeader(searcherClient);

    // to support async actions and module logic
    return emitter.on(
        EVENT.TRADE_TRIGGERED,
        (tradeInfo) => console.log(tradeInfo),
        // sendCustomBundle({ payer, recBHash, jClient }),
    );
};

const sendCustomBundle = async ({
    payer,
    recBHash,
    jClient,
}: ISendCustomBundle) => {
    const txs = await createTxs({ payer, recBHash, jClient });
    try {
        const result = await jClient.sendBundle([txs, { encoding: 'base64' }]);
        console.log('📦 Send bundle resp:', result);
        if (!result.result) {
            throw result.error ?? new Error('sendBundle error'); // TODO: error handling
        }
        const bundleId = result.result;
        const inflightStatus = await jClient.confirmInflightBundle(
            bundleId,
            40000,
        );

        console.log(
            'Inflight bundle status:',
            JSON.stringify(inflightStatus, null, 2),
        );
    } catch (error) {
        console.log(`Send custom bundle error: ${error}`);
    }
};
