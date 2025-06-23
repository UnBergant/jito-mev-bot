import { IBuildMemoTx, ICreateTxs, TipsConfig } from '../types';
import {
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    TransactionInstruction,
    TransactionMessage,
    VersionedTransaction,
} from '@solana/web3.js';
import { dexAdapters, getDexAdapter } from '../dexAdapters';
import { getFullAccountsList, usesLookupTable } from './lookupTables';
import { Message } from '@triton-one/yellowstone-grpc/dist/types/grpc/solana-storage';
import { splitIntToInts } from '../utils/math';

const buildMemoTx = ({ payer, recentBHash, message, tipsIx }: IBuildMemoTx) => {
    const MEMO_PROGRAM_ID = new PublicKey(
        'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr',
    );

    const memoInstruction = new TransactionInstruction({
        keys: [
            {
                pubkey: payer.publicKey,
                isSigner: true,
                isWritable: true,
            },
        ],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(message, 'utf8'),
    });

    const instructions = [memoInstruction];

    if (tipsIx) {
        instructions.push(tipsIx);
    }

    const messageV0 = new TransactionMessage({
        payerKey: payer.publicKey,
        recentBlockhash: recentBHash,
        instructions,
    }).compileToV0Message();

    const tx = new VersionedTransaction(messageV0);

    tx.sign([payer]);

    return tx;
};

function txToBase64(tx: VersionedTransaction): string {
    return Buffer.from(tx.serialize()).toString('base64');
}

const createTxs = async (args: ICreateTxs<any>) => {
    const { tradeInfo, tipsConfig, connection, config, adapterInfo } = args;
    const message = tradeInfo.trigger.tx.transaction?.transaction
        ?.message as Message;

    // maybe there is a way to avoid this request. Made to check ProgramAddress
    const fullAccountList = await getFullAccountsList(message, connection);
    const adapter = getDexAdapter(fullAccountList);

    if (!adapter) {
        throw new Error('❗ No adapter found');
    }

    const totatSwap =
        0.01 * LAMPORTS_PER_SOL ||
        Math.floor(tradeInfo.trigger.txAmount * config.X);

    const txs = await Promise.allSettled(
        splitIntToInts(totatSwap, 3).map((swapAmount) =>
            adapter.createTx({
                ...args,
                swapAmount,
                tipsConfig,
                adapterInfo,
            }),
        ),
    );

    return txs.map((tx) => {
        if (tx.status === 'rejected') {
            throw new Error(`Tx is rejected: ${tx.reason}`);
        }
        return txToBase64(tx.value);
    });
};

export { buildMemoTx, createTxs };
