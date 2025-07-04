import { ConfigGlobal, TradeTriggerInfo } from '../types';
import { SubscribeUpdate } from '@triton-one/yellowstone-grpc';
import { logTx } from './log';
import { TRADE_DIRECTION } from '../constants';
import { PublicKey } from '@solana/web3.js';

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
  const tradeAction = delta < 0 ? TRADE_DIRECTION.BUY : TRADE_DIRECTION.SELL;
  const deltaAbs = Math.abs(delta);
  logTx({ data, config, delta: deltaAbs, tradeAction });

  return {
    txAmount: deltaAbs,
    action: tradeAction,
    tx: data.transaction,
    createdAt: data?.createdAt ?? new Date(),
  };
};

export const getTradeInfo = ({
  txInfo,
  config,
}: IGetTradeInfo): TradeTriggerInfo => {
  return {
    poolKey: new PublicKey(config.POOL),
    trigger: txInfo,
  };
};
