import { Message } from '@triton-one/yellowstone-grpc/dist/types/grpc/solana-storage';
import { Connection, MessageV0, PublicKey } from '@solana/web3.js';

export const usesLookupTable = ({ instructions, accountKeys }: Message) =>
    instructions.some((ix) => {
        const allIndices = [ix.programIdIndex, ...(ix.accounts || [])];
        return allIndices.some((index) => index >= accountKeys.length);
    });

export const getFullAccountsList = async (
    message: Message,
    connection: Connection,
): Promise<PublicKey[]> => {
    const tables = await Promise.all(
        message.addressTableLookups.map(async (lookup) => {
            const { value } = await connection.getAddressLookupTable(
                new PublicKey(lookup.accountKey),
            );
            return {
                writable: Array.from(lookup.writableIndexes)
                    .map((i) => value?.state.addresses[i])
                    .filter((key): key is PublicKey => !!key),
                readonly: Array.from(lookup.readonlyIndexes)
                    .map((i) => value?.state.addresses[i])
                    .filter((key): key is PublicKey => !!key),
            };
        }),
    );

    const extra = tables.flatMap((t) => [...t.writable, ...t.readonly]);

    return [...message.accountKeys.map((k) => new PublicKey(k)), ...extra];
};
