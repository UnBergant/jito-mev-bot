import { IAdapter, ICreateTxs } from '../../types';
import { PublicKey } from '@solana/web3.js';
import { DEX, DEX_TYPE } from '../../constants';
import { getTx } from './tx';
import {
    AmmRpcData,
    ComputeAmountOutParam,
} from '@raydium-io/raydium-sdk-v2/lib/raydium/liquidity/type';
import {
    x as AmmV4Keys,
    y as AmmV5Keys,
} from '@raydium-io/raydium-sdk-v2/lib/api-7daf490d';

export type PumpFunPoolInfo = {
    poolRpcData: AmmRpcData;
    poolInfo: ComputeAmountOutParam['poolInfo'];
    poolKeys: AmmV4Keys | AmmV5Keys;
};

export interface ICreateTxsPumpFun extends ICreateTxs<PumpFunPoolInfo> {}

const createTx = async (args: ICreateTxsPumpFun) => {
    const {
        tradeInfo: { POOL },
        config,
        tipsConfig,
        payer,
        connection,
        recentBHash,
        swapAmount,
        ataIx,
    } = args;
    console.log(
        `🔄 Create tx: ${DEX_TYPE[DEX.PUMP_FUN]} swapAmount: ${swapAmount}`,
    );

    // TODO: delete hardcode

    const tx = await getTx({
        recentBHash,
        swapAmount,
        payerKey: payer.publicKey,
        tipsConfig,
        connection,
        poolKey: new PublicKey(POOL),
        ataIx,
        config,
    });
    tx.sign([payer]);

    return tx;
};

const matchDexAddress = (fullAccountList: PublicKey[]) => {
    return fullAccountList.find((pubkey) => pubkey.toBase58() === DEX.PUMP_FUN);
};

export default {
    createTx,
    matchDexAddress,
    contractAddress: DEX.PUMP_FUN,
    type: DEX_TYPE[DEX.PUMP_FUN],
} as IAdapter<ICreateTxsPumpFun>;
