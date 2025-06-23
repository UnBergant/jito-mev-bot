import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { ConfigGlobal } from '../types';
import { getAssociatedTokenAddress, NATIVE_MINT } from '@solana/spl-token';
import { createAtaIxs } from './ix';

type CreateAtaAccountAndDepositArgs = {
    payerKey: PublicKey;
    connection: Connection;
    poolKey: PublicKey;
    swapAmount: number;
};

export const createAtaPumpFunIxs = async ({
    payerKey,
    connection,
    poolKey,
    swapAmount,
}: CreateAtaAccountAndDepositArgs) => {
    // ??? Im sorry
    if (1) {
        return;
    }
    const ataIx = await createAtaIxs({ connection, payerKey, swapAmount });

    if (!ataIx) {
        return;
    }

    return ataIx;
};
