import { CommitmentLevel, SubscribeRequest } from 'helius-laserstream';
import { ConfigGlobal } from '../types';

export const getRequestConfig = (POOL: string): SubscribeRequest => {
  return {
    transactions: {
      client: {
        accountInclude: [POOL],
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
