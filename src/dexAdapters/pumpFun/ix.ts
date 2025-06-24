import { PumpAmmSdk } from '@pump-fun/pump-swap-sdk';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import BN from 'bn.js';
import { ConfigGlobal } from '../../types';
import { TRADE_DIRECTION } from '../../constants';

enum Direction {
    BaseToQuote = 'baseToQuote',
    QuoteToBase = 'quoteToBase',
}

interface CreateIxArgs {
    connection: Connection;
    payerKey: PublicKey;
    poolKey: PublicKey;
    solAmountLamports: BN;
    config: ConfigGlobal;
}

export const createIx = async ({
    connection,
    poolKey,
    solAmountLamports,
    payerKey,
    config,
}: CreateIxArgs) => {
    const pumpAmmSdk = new PumpAmmSdk(connection);
    const slippage = Math.ceil(config.SLIPPAGE * 100);

    // maybe better to chance for raw instructions for optimization
    if (config.MODE === TRADE_DIRECTION.BUY) {
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
