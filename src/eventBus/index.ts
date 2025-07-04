import { createNanoEvents } from 'nanoevents';
import { TradeTriggerInfo } from '../types';

export enum EVENT {
    TRADE_TRIGGERED = 'tradeTriggered',
}

type Events = {
    [EVENT.TRADE_TRIGGERED]: (info: TradeTriggerInfo) => void;
};

export const emitter = createNanoEvents<Events>();
