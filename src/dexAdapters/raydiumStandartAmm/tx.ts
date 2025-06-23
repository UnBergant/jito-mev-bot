import BN from 'bn.js';
import { TxVersion } from '@raydium-io/raydium-sdk-v2';
import { IGetTx } from '../../types';

export const getTx = async (args: IGetTx) => {
    const {
        raydium,
        poolInfo,
        poolKeys,
        poolRpcData,
        swapAmount,
        mintIn,
        mintOut,
        tipsConfig,
        payer,
    } = args;

    if (!raydium) {
        return null;
    }

    const [baseReserve, quoteReserve, status] = [
        poolRpcData.baseReserve,
        poolRpcData.quoteReserve,
        poolRpcData.status.toNumber(),
    ];

    const out = raydium.liquidity.computeAmountOut({
        poolInfo: {
            ...poolInfo,
            baseReserve,
            quoteReserve,
            status,
            version: 4,
        },
        amountIn: new BN(swapAmount),
        mintIn,
        mintOut,
        slippage: 0.1, // range: 1 ~ 0.0001, means 100% ~ 0.01%
    });

    const { transaction, execute } = await raydium.liquidity.swap({
        feePayer: payer.publicKey,
        poolInfo,
        poolKeys,
        amountIn: new BN(swapAmount),
        amountOut: out.minAmountOut,
        fixedSide: 'in',
        inputMint: mintIn.toBase58(),
        txVersion: TxVersion.V0,
        txTipConfig: tipsConfig
            ? {
                  address: tipsConfig?.tipsKey,
                  amount: new BN(tipsConfig?.tipsLamports),
              }
            : undefined,
        computeBudgetConfig: {
            units: 600_000,
            microLamports: 40_000_000,
        },
    });

    const { txId } = await execute({ sendAndConfirm: false });
    console.log(`swap successfully in amm pool:`, {
        txId: `https://explorer.solana.com/tx/${txId}`,
    });

    return transaction;
};
