import { JitoJsonRpcClient } from 'jito-js-rpc';
import { createTxs } from './txs';
import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
} from '@solana/web3.js';
import { ConfigGlobal, SendCustomBundleArgs, TipsConfig } from '../types';
import { emitter, EVENT } from '../eventBus';
import bs58 from 'bs58';
import { getTipsAmount } from './tips';
import { Raydium } from '@raydium-io/raydium-sdk-v2';
import { promisifyTimeout } from '../utils/promises';
import { getAssociatedTokenAddress, NATIVE_MINT } from '@solana/spl-token';

interface IJitoInit {
    config: ConfigGlobal;
}

export const init = async ({ config }: IJitoInit) => {
    const payer = Keypair.fromSecretKey(bs58.decode(config.privateKey));
    const connection = new Connection(config.rpcUrl, 'confirmed');

    const jClient = new JitoJsonRpcClient(config.jitoRpcUrl);

    const tipsPercentiles = await getTipsAmount();
    console.log('📊 Pool:', config.POOL);
    console.log('📊 Payer:', payer.publicKey.toBase58());
    console.log('📊 Tips:', tipsPercentiles);

    // To avoid sending transactions in wrong slot. But higher rate limits are needed
    // const searcherClient = searcher.searcherClient(config.jitoBlockEngineUrl);
    // const currentLeader = await waitForJitoLeader(searcherClient);
    console.log('📦 Jito is initialized');

    const raydium = await Raydium.load({
        connection,
        owner: payer,
    });

    // const poolInfo = await raydium.liquidity.getPoolInfoFromRpc({
    //     poolId: new PublicKey(config.POOL).toBase58(),
    // });

    const wsolAta = await getAssociatedTokenAddress(
        NATIVE_MINT,
        payer.publicKey,
    );
    const ataInfo = await connection.getAccountInfo(wsolAta);
    console.log('ATA:', ataInfo);

    const recentBHash = await connection.getLatestBlockhash('confirmed');

    return emitter.on(EVENT.TRADE_TRIGGERED, async (tradeInfo) => {
        console.log('✅ TRIGGERED:', tradeInfo);
        // TODO: check tips asynchronously by chron
        const tipsLamports = Math.ceil(
            tipsPercentiles.ema_landed_tips_50th_percentile *
                LAMPORTS_PER_SOL *
                30,
        );

        const tipsConfig: TipsConfig = {
            tipsKey: new PublicKey(config.jitoTipsAddress),
            tipsLamports: tipsLamports,
        };

        // TODO: make not blocking async by crone
        const swapAmount = tradeInfo.trigger.txAmount;

        await sendCustomBundle({
            payer,
            recentBHash,
            jClient,
            tradeInfo,
            tipsConfig,
            raydium,
            config,
            connection,
            swapAmount,
            adapterInfo: {},
        });
    });
};

const sendCustomBundle = async (args: SendCustomBundleArgs<any>) => {
    const { jClient } = args;

    const txs = await createTxs(args);

    if (!txs) {
        return;
    }

    console.log('🛫 TX to send:', txs);
    try {
        const callJClient = async () => {
            try {
                console.log('call JClient');
                return await jClient.sendBundle([txs, { encoding: 'base64' }]);
            } catch (error) {
                console.log(error);
                await promisifyTimeout(10000);
                return callJClient();
            }
        };
        const result = await callJClient();

        if (!result.result) {
            throw result.error ?? new Error('sendBundle error'); // TODO: error handling
        }
        console.log(
            '📦 Send bundle resp:',
            `https://explorer.jito.wtf/bundle-explorer?searchTerm=${result.result}&filter=Bundle`,
            result,
        );
        const bundleId = result.result;
        await promisifyTimeout(4000);
        const intervalId = setInterval(async () => {
            try {
                const inflightStatus = await jClient.getBundleStatuses([
                    [bundleId],
                ]);

                console.log(
                    'Bundle status:',
                    JSON.stringify(inflightStatus, null, 2),
                );
            } catch (error) {
                console.log('429');
            }
        }, 5000);
    } catch (error) {
        console.log(`Send custom bundle error: ${error}`);
    }
};
