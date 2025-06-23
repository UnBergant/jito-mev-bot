import { IAdapter, ICreateTxs } from '../../types';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { DEX, DEX_TYPE } from '../../constants';
import { NATIVE_MINT } from '@solana/spl-token';
import { getTx } from './tx';
import {
    AmmRpcData,
    ComputeAmountOutParam,
} from '@raydium-io/raydium-sdk-v2/lib/raydium/liquidity/type';
import {
    x as AmmV4Keys,
    y as AmmV5Keys,
} from '@raydium-io/raydium-sdk-v2/lib/api-7daf490d';

type RaydiumPoolInfo = {
    poolRpcData: AmmRpcData;
    poolInfo: ComputeAmountOutParam['poolInfo'];
    poolKeys: AmmV4Keys | AmmV5Keys;
};

interface ICreateTxRaydiumSAmm extends ICreateTxs<RaydiumPoolInfo> {}

const createTx = async ({
    tradeInfo,
    config,
    tipsConfig,
    raydium,
    adapterInfo: { poolInfo, poolKeys, poolRpcData },
    payer,
}: ICreateTxRaydiumSAmm) => {
    console.log('⚡ Raydium Standart AMM create TX');
    const swapAmount =
        0.0001 * LAMPORTS_PER_SOL ||
        Math.floor(tradeInfo.trigger.txAmount * config.X);
    const inputMint = NATIVE_MINT.toBase58();

    if (
        poolInfo.mintA.address !== inputMint &&
        poolInfo.mintB.address !== inputMint
    )
        throw new Error('input mint does not match pool');

    const baseIn = inputMint === poolInfo.mintA.address;
    const [mintIn, mintOut] = baseIn
        ? [poolInfo.mintA, poolInfo.mintB]
        : [poolInfo.mintB, poolInfo.mintA];

    return await getTx({
        poolInfo,
        poolKeys,
        poolRpcData,
        swapAmount,
        mintIn: new PublicKey(mintIn.address),
        mintOut: new PublicKey(mintOut.address),
        payer,
        tipsConfig,
    });
};

const matchDexAddress = (fullAccountList: PublicKey[]) => {
    return fullAccountList.find(
        (pubkey) => pubkey.toBase58() === DEX.RAYDIUM_ST_AMM,
    );
};

export default {
    createTx,
    matchDexAddress,
    contractAddress: DEX.RAYDIUM_ST_AMM,
    type: DEX_TYPE[DEX.RAYDIUM_ST_AMM],
} as IAdapter<ICreateTxRaydiumSAmm>;
