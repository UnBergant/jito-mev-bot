import { ConfigGlobal } from '../types';
import { SubscribeUpdate } from '@triton-one/yellowstone-grpc';
import bs58 from 'bs58';
import { DEX, LAMPORTS_IN_SOL, TRADER_ACTION } from '../constants';
import { TradeInfo } from '../eventBus';
import { Connection } from '@solana/web3.js';
import { logTx } from './log';

type ITxInfo = NonNullable<ReturnType<typeof getTxInfo>>;
type IGetTradeInfo = {
    txInfo: ITxInfo;
    config: ConfigGlobal;
};

export const getTxInfo = (data: SubscribeUpdate, config: ConfigGlobal) => {
    if (
        !data?.transaction?.transaction?.transaction?.message?.instructions ||
        !data?.transaction?.transaction?.meta ||
        !data?.transaction?.slot
    ) {
        console.log(data.createdAt, '🔮 no txs yet');
        return;
    }

    const {
        transaction: { meta },
    } = data.transaction;

    if (meta?.err) {
        console.log(data.createdAt, '🚨 Error:', meta?.err);
        return;
    }

    const delta = +meta.postBalances[0] - +meta.preBalances[0];
    const tradeAction = delta < 0 ? TRADER_ACTION.BUY : TRADER_ACTION.SELL;
    logTx({ data, config, delta, tradeAction });

    return {
        txAmount: Math.abs(delta),
        action: tradeAction,
        tx: data.transaction,
    };
};

export const getTradeInfo = ({ txInfo, config }: IGetTradeInfo): TradeInfo => {
    return {
        POOL: config.POOL,
        trigger: {
            action: TRADER_ACTION.BUY,
            amountL: txInfo.txAmount,
            tx: txInfo.tx,
        },
        DEX: DEX.RAYDIUM,
    };
};
