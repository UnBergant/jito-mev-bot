import { PumpAmmSdk } from '@pump-fun/pump-swap-sdk';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { ConfigGlobal } from '../../types';
import { TRADE_DIRECTION } from '../../constants';
import { state } from '../../state';

enum Direction {
  BaseToQuote = 'baseToQuote',
  QuoteToBase = 'quoteToBase',
}

interface CreateIxArgs {
  solAmountLamports: BN;
}

export const createIx = async ({ solAmountLamports }: CreateIxArgs) => {
  const pumpAmmSdk = state.PumpAmmSdk;
  const slippage = Math.ceil(state.config.SLIPPAGE * 100);
  const {
    payer: { publicKey: payerKey },
    transaction$,
  } = state;

  const poolKey = transaction$.value!.poolKey;

  // maybe better to chance for raw instructions for optimization
  if (state.config.MODE === TRADE_DIRECTION.BUY) {
    return await pumpAmmSdk.swapQuoteInstructions(
      poolKey,
      solAmountLamports,
      slippage,
      Direction.QuoteToBase,
      payerKey,
    );
  } else {
    return await pumpAmmSdk.swapQuoteInstructions(
      poolKey,
      solAmountLamports,
      slippage,
      Direction.BaseToQuote,
      payerKey,
    );
  }
};
