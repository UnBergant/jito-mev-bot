import { createNanoEvents } from 'nanoevents';
import { TradeInfo } from '../types';

export enum EVENT {
    TRADE_TRIGGERED = 'tradeTriggered',
}

type Events = {
    [EVENT.TRADE_TRIGGERED]: (info: TradeInfo) => void;
};

export const emitter = createNanoEvents<Events>();
