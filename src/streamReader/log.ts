import { SubscribeUpdate } from '@triton-one/yellowstone-grpc';
import { ConfigGlobal } from '../types';
import { LAMPORTS_IN_SOL, TRADE_DIRECTION } from '../constants';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import bs58 from 'bs58';
import { trigger } from './callbacks';

type ILogTx = {
    data: SubscribeUpdate;
    config: ConfigGlobal;
    delta: number;
    tradeAction: TRADE_DIRECTION;
};

export const logTx = ({ data, config, delta, tradeAction }: ILogTx) => {
    if (
        !data?.transaction?.transaction?.transaction?.message?.instructions ||
        !data?.transaction?.transaction?.meta ||
        !data?.transaction?.slot
    ) {
        console.log(data.createdAt, '🔮 no txs yet');
        return;
    } // copypaste for type guard
    const {
        transaction: {
            transaction: { message },
            meta,
            signature,
        },
        slot,
    } = data.transaction;

    const triggerSize = config.triggerSizeSol * LAMPORTS_PER_SOL;

    if (
        !trigger({
            action: tradeAction,
            amount: delta,
            triggerSize,
            config,
        })
    ) {
        return;
    }

    const { accountKeys } = message;

    const connection = new Connection(config.rpcUrl, 'confirmed');
    connection
        .getSlot() // only for debug. Is async to not freeze execution
        .then((currentSlot) => {
            // some info is duplicated to be sure of correct trx, because is async
            console.log(data.createdAt, `📨 txHash: ${bs58.encode(signature)}`);
            console.log(data.createdAt, `🔗 Current slot: ${currentSlot}`);
            console.log(data.createdAt, `🔗 Building slot: ${slot}`);
        });

    console.log(data.createdAt, `🔗 Building slot: ${slot}`);
    console.log(data.createdAt, `💳 Account: ${bs58.encode(accountKeys[0])}`);
    console.log(data.createdAt, `📨 txHash: ${bs58.encode(signature)}`);
    // console.log(data.createdAt, `📨 Tx message:`, message);
    // console.log(data.createdAt, `📨 Tx meta:`, meta);
    // console.log(data.createdAt, `📨 Tx message:`, message);

    const deltaSol = delta / LAMPORTS_IN_SOL;
    const tradeSign =
        tradeAction === TRADE_DIRECTION.BUY ? '🟢 Buy' : '🔴 Sell';
    console.log(
        data.createdAt,
        `🏦 Delta (Sol): ${Math.abs(+deltaSol.toFixed(4))} ${tradeSign}`,
    );
};
