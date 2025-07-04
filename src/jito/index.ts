import { createTxs } from './txs';
import { initAndStartPollingTips } from './tips';
import { Raydium } from '@raydium-io/raydium-sdk-v2';
import { promisifyTimeout } from '../utils/promises';
import { state } from '../state';
import { filter, take } from 'rxjs';
import { startPoolingLatestBlockhash } from '../utils/tx';

export const init = async () => {
  const { payer, connection } = state;

  await initAndStartPollingTips(10_000);
  await startPoolingLatestBlockhash(5_000);

  console.log('📊 Pool:', state.config.POOL);
  console.log('📊 Payer:', payer.publicKey.toBase58());
  console.log('📊 Tips:', state.tips$.value.percentiles);

  // To avoid sending transactions in wrong slot. But higher rate limits are needed
  // const searcherClient = searcher.searcherClient(config.jitoBlockEngineUrl);
  // const currentLeader = await waitForJitoLeader(searcherClient);
  console.log('📦 Jito is initialized');

  const raydium = await Raydium.load({
    connection,
    owner: payer.publicKey,
  });

  // TODO: make not blocking async by crone

  return state.transaction$
    .pipe(
      filter((tradeTrigger) => tradeTrigger !== null), // отфильтровываем null
      take(1), // только первое значение
    )
    .subscribe((tradeTrigger) => {
      sendCustomBundle();
    });
};

const sendCustomBundle = async () => {
  const { jClient } = state;

  const txs = await createTxs();

  if (!txs) {
    return;
  }

  console.log('🛫 TX to send:', txs);
  try {
    const callJClient = async () => {
      try {
        console.log('📞 call JClient');
        return await jClient.sendBundle([txs, { encoding: 'base64' }]);
      } catch (error) {
        console.log(error);
        // await promisifyTimeout(10000);
        // return callJClient();
      }
    };
    const result = await callJClient();

    if (!result?.result) {
      throw result?.error ?? new Error('😬 sendBundle error'); // TODO: error handling
    }
    console.log(
      '📦 Send bundle resp:',
      `https://explorer.jito.wtf/bundle-explorer?searchTerm=${result.result}&filter=Bundle`,
      result,
    );
    const bundleId = result.result;
    await promisifyTimeout(4000);
    const intervalId = setInterval(async () => {
      try {
        const inflightStatus = await jClient.getBundleStatuses([[bundleId]]);

        console.log(
          'Bundle status:',
          JSON.stringify(inflightStatus.result, null, 2),
        );
      } catch (error) {
        console.log('Jito RPC error 429');
      }
    }, 5000);
  } catch (error) {
    console.log(`Send custom bundle error: ${error}`);
  }
};
