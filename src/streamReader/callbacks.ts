import { DEX, LAMPORTS_IN_SOL, TRADER_ACTION } from '../constants';
import { SubscribeUpdate } from '@triton-one/yellowstone-grpc';
import bs58 from 'bs58';
import { ConfigGlobal } from '../types';
import { emitter, EVENT, TradeInfo } from '../eventBus';
import { getTradeInfo, getTxInfo } from './tx';

export const getHeliusCallbacks = (config: ConfigGlobal) => {
    const onData = async (data: SubscribeUpdate) => {
        console.log('------------------------');
        const triggerSizeLamports = config.triggerSize * LAMPORTS_IN_SOL;
        const txInfo = getTxInfo(data, config);
        switch (true) {
            case !txInfo?.txAmount:
                break;
            case txInfo?.action === TRADER_ACTION.BUY &&
                txInfo?.txAmount >= triggerSizeLamports:
                const txAmountSol = txInfo?.txAmount / LAMPORTS_IN_SOL;
                console.log(`⬇️ To sell (Sol): ${txAmountSol * config.X}`);

                const tradeInfo = getTradeInfo({ txInfo, config });

                // to support async actions and module logic
                emitter.emit(EVENT.TRADE_TRIGGERED, tradeInfo);
                break;
            default:
                break;
        }
    };

    const onError = async (error: Error) => {
        console.error('Error:', error);
    };
    return {
        onData,
        onError,
    };
};
