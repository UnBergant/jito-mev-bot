import { IAdapter, ICreateTxs } from '../../types';
import {
    LAMPORTS_PER_SOL,
    PublicKey,
    VersionedTransaction,
} from '@solana/web3.js';
import { Raydium, TxVersion } from '@raydium-io/raydium-sdk-v2';
import { DEX, DEX_TYPE } from '../../constants';
import BN from 'bn.js';
import { NATIVE_MINT } from '@solana/spl-token';
import { Message } from '@triton-one/yellowstone-grpc/dist/types/grpc/solana-storage';
import { buildMemoTx } from '../../jito/txs';

const createTx = async ({
    tradeInfo,
    // poolInfo,
    connection,
    config,
    payer,
    tipsConfig,
    recentBHash,
}: ICreateTxs<any>) => {
    console.log('⚡ Raydium Legacy AMM V4');

    throw new Error('❗️ Dex is not supported');

    const swapAmountLamports = new BN(tradeInfo.trigger.txAmount * config.X);
    const inputMint = NATIVE_MINT.toBase58();
    const poolId = config.POOL;

    const raydium = await Raydium.load({
        connection,
        owner: payer, // key pair or publicKey, if you run a node process, provide keyPair
    });

    const { poolInfo, poolKeys, poolRpcData } =
        await raydium.liquidity.getPoolInfoFromRpc({ poolId });
    const [baseReserve, quoteReserve, status] = [
        poolRpcData.baseReserve,
        poolRpcData.quoteReserve,
        poolRpcData.status.toNumber(),
    ];
    if (
        poolInfo.mintA.address !== inputMint &&
        poolInfo.mintB.address !== inputMint
    )
        throw new Error('input mint does not match pool');

    console.log('🏊‍♂️ Pool info', poolInfo);

    const baseIn = inputMint === poolInfo.mintA.address;
    const [mintIn, mintOut] = baseIn
        ? [poolInfo.mintA, poolInfo.mintB]
        : [poolInfo.mintB, poolInfo.mintA];

    const out = raydium.liquidity.computeAmountOut({
        poolInfo: {
            ...poolInfo,
            baseReserve,
            quoteReserve,
            status,
            version: 4,
        },
        amountIn: new BN(swapAmountLamports),
        mintIn: mintIn.address,
        mintOut: mintOut.address,
        slippage: 0.01, // range: 1 ~ 0.0001, means 100% ~ 0.01%
    });

    const { execute, transaction } = await raydium.liquidity.swap({
        poolInfo,
        poolKeys,
        amountIn: new BN(swapAmountLamports),
        amountOut: out.minAmountOut, // out.amountOut means amount 'without' slippage
        fixedSide: 'in',
        inputMint: mintIn.address,
        txVersion: TxVersion.V0,
        txTipConfig: tipsConfig?.tipsLamports
            ? {
                  feePayer: payer.publicKey,
                  address: new PublicKey(
                      'ADuUkR4vqLUMWXxW9gh6D6L8pMSawimctcNZ5pGwDcEt',
                  ),
                  amount: new BN(tipsConfig?.tipsLamports!),
              }
            : undefined,
    });

    const tokenIn = 'So11111111111111111111111111111111111111112';

    // const ixParams: SwapInstructionParams = {
    //     version: 4;
    //     poolKeys: poolKeys;
    //     userKeys: {
    //         tokenAccountIn: PublicKey;
    //         tokenAccountOut: PublicKey;
    //         owner: PublicKey;
    //     };
    //     amountIn: BigNumberish;
    //     amountOut: BigNumberish;
    //     fixedSide: SwapSide;
    // }

    // const instruction = makeAMMSwapInstruction();

    // const tx = await buildSimpleSwapTransaction({
    //     connection,
    //     poolKeys,
    //     amountIn: swapAmountLamports,
    //     amountOutMin: new BN(0), // или задай минимальный slippage
    //     fixedSide: 'in', // мы указываем фиксированный input (продаем)
    //     userKeys: {
    //         tokenAccounts: {
    //             base: new PublicKey('ВАШ_ACCOUNT_BASE_TOKEN'),
    //             quote: new PublicKey('ВАШ_ACCOUNT_QUOTE_TOKEN'),
    //         },
    //         owner: payer.publicKey,
    //     },
    //     wallet: payer,
    //     makeTxVersion: 0, // v0 transaction
    // });

    // console.log('✅ Swap confirmed!', signature);

    return buildMemoTx({
        payer,
        recentBHash: recentBHash.blockhash,
        message: 'Hello',
    });
};

const matchDexAddress = (fullAccountList: PublicKey[]) => {
    return fullAccountList.find(
        (pubkey) => pubkey.toBase58() === DEX.RAYDIUM_LEGACY_V4,
    );
};

export default {
    createTx,
    matchDexAddress,
    contractAddress: DEX.RAYDIUM_LEGACY_V4,
    type: DEX_TYPE[DEX.RAYDIUM_LEGACY_V4],
} as IAdapter<any>;
