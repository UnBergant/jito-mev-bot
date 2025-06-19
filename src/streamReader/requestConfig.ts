import { CommitmentLevel, SubscribeRequest } from 'helius-laserstream';
import { ConfigGlobal } from '../types';

export const getRequestConfig = (config: ConfigGlobal): SubscribeRequest => {
    return {
        transactions: {
            client: {
                accountInclude: [config.POOL],
                accountExclude: [],
                accountRequired: [],
                vote: false,
                failed: false,
            },
        },
        commitment: CommitmentLevel.PROCESSED,
        accounts: {},
        slots: {},
        transactionsStatus: {},
        blocks: {},
        blocksMeta: {},
        entry: {},
        accountsDataSlice: [],
    };
};
