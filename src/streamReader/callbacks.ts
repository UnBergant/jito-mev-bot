import { TRADE_DIRECTION } from '../constants';
import { SubscribeUpdate } from '@triton-one/yellowstone-grpc';
import { ConfigGlobal } from '../types';
import { emitter, EVENT } from '../eventBus';
import { getTradeInfo, getTxInfo } from './tx';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { state } from '../state';

let running = false;

type TriggerArgs = {
    action: TRADE_DIRECTION | undefined;
    amount: number | undefined;
    triggerSize: number;
    config: ConfigGlobal;
};

export const trigger = ({
    action,
    amount,
    triggerSize,
    config,
}: TriggerArgs) => {
    return action === config.TRIGGER_ACTION && amount && amount >= triggerSize;
};

export const getHeliusCallbacks = () => {
    const config = state.config;
    const onData = async (data: SubscribeUpdate) => {
        if (running) return;
        console.log('------------------------');
        const triggerSizeLamports = config.triggerSizeSol * LAMPORTS_PER_SOL;
        const txInfo = getTxInfo(data, config);

        switch (true) {
            case !txInfo?.txAmount:
                break;

            case trigger({
                action: txInfo?.action,
                amount: txInfo?.txAmount,
                triggerSize: triggerSizeLamports,
                config,
            }):
                running = true;
                const txAmountSol = txInfo.txAmount / LAMPORTS_PER_SOL;
                console.log(
                    txInfo.createdAt,
                    `❗️ TRIGGERED To ${config.MODE} (Sol): ${txAmountSol * config.X}`,
                );

                const tradeInfo = getTradeInfo({ txInfo, config });

                state.transaction$.next(tradeInfo);

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
