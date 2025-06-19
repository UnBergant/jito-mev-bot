import { IBuildMemoTx, ICreateTxs } from '../types';
import {
    PublicKey,
    TransactionInstruction,
    TransactionMessage,
    VersionedTransaction,
} from '@solana/web3.js';
import bs58 from 'bs58';
import { getTipLamports, getTipsIx } from './tips';

const buildMemoTx = ({ payer, recBHash, message, tipIx }: IBuildMemoTx) => {
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

    if (tipIx) {
        instructions.push(tipIx);
    }

    const messageV0 = new TransactionMessage({
        payerKey: payer.publicKey,
        recentBlockhash: recBHash,
        instructions,
    }).compileToV0Message();

    const tx = new VersionedTransaction(messageV0);

    tx.sign([payer]);

    return tx;
};

function txToBase64(tx: VersionedTransaction): string {
    return Buffer.from(tx.serialize()).toString('base64');
}

const createTxs = async ({
    payer,
    jClient,
    searcherClient,
    recBHash,
}: ICreateTxs) => {
    const tipIx = await getTipsIx({
        payer,
        tipLamports: getTipLamports(),
        jClient,
        searcherClient,
    });

    const tx1 = buildMemoTx({
        payer,
        recBHash,
        message: 'Hello',
    });

    const tx2 = buildMemoTx({
        payer,
        recBHash,
        message: 'Que tal?',
        tipIx,
    });

    return [tx1, tx2].map(txToBase64);
};

export { buildMemoTx, createTxs };
