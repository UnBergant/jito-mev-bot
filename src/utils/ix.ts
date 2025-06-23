import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import {
    getAssociatedTokenAddress,
    createAssociatedTokenAccountInstruction,
    createAssociatedTokenAccountIdempotentInstruction,
    NATIVE_MINT,
} from '@solana/spl-token';

type CreateATAAccArgs = {
    connection: Connection;
    payerKey: PublicKey;
    swapAmount: number;
};

export const createAtaIxs = async ({
    payerKey,
    swapAmount,
}: CreateATAAccArgs) => {
    const quoteTokenMint = new PublicKey(NATIVE_MINT);
    const userATA = await getAssociatedTokenAddress(quoteTokenMint, payerKey);
    const ixs = [
        createAssociatedTokenAccountIdempotentInstruction(
            payerKey,
            userATA,
            payerKey,
            quoteTokenMint,
        ),
    ];

    ixs.push(
        SystemProgram.transfer({
            fromPubkey: payerKey,
            toPubkey: userATA,
            lamports: swapAmount,
        }),
    );
    return ixs;
};
