import { createNanoEvents } from 'nanoevents';
import { DEX, TRADER_ACTION } from '../constants';
import { SubscribeUpdateTransaction } from '@triton-one/yellowstone-grpc/dist/types/grpc/geyser';

export enum EVENT {
    TRADE_TRIGGERED = 'tradeTriggered',
}

export type TradeInfo = {
    CA?: string; // to save time no CA
    POOL: string; // to detect specific trading source
    trigger: {
        amountL: number; // lamports
        action: TRADER_ACTION;
        tx: SubscribeUpdateTransaction;
    };
    symbol?: string;
    DEX: DEX; // For now only Raydium, to be clear with adapter
};

type Events = {
    [EVENT.TRADE_TRIGGERED]: (info: TradeInfo) => void;
};

export const emitter = createNanoEvents<Events>();
