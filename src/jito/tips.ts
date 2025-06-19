import { IGetTipsIx } from '../types';
import { PublicKey, SystemProgram } from '@solana/web3.js';

const getTipsIx = async ({
    payer,
    tipLamports,
    jClient,
    searcherClient,
}: IGetTipsIx) => {
    // const sAccount = await searcherClient.getTipAccounts();
    // console.log({ sAccount });
    // const jAccounts = await jClient.getTipAccounts(); // Do n
    // console.log({ jAccounts });
    //
    // const tipAccount = await jClient.getRandomTipAccount(); // Do not use because ratelimits
    // console.log({ tipAccount });

    return SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: new PublicKey('ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt'),
        lamports: tipLamports,
    });
};

const getTipLamports = () => {
    return 3000;
};

export { getTipLamports, getTipsIx };
