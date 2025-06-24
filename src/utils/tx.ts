import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { createAtaIxs } from './ix';
import { TokenBalance } from 'jito-ts/dist/gen/geyser/confirmed_block';

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

type BalanceMap = Record<string, string>;

export const getTokenChangesForOwner = (
    sender: string,
    pre: TokenBalance[],
    post: TokenBalance[],
): { [mint: string]: number } => {
    const getBalances = (arr: TokenBalance[]): BalanceMap =>
        Object.fromEntries(
            arr
                .filter((b) => b.owner === sender)
                .map((b) => [b.mint, b.uiTokenAmount!.amount]),
        );

    const preMap = getBalances(pre);
    const postMap = getBalances(post);

    const allMints = new Set([...Object.keys(preMap), ...Object.keys(postMap)]);

    const result: { [mint: string]: number } = {};
    for (const mint of allMints) {
        const preVal = BigInt(preMap[mint] || '0');
        const postVal = BigInt(postMap[mint] || '0');
        const delta = postVal - preVal;
        result[mint] = Number(delta);
    }

    return result;
};
