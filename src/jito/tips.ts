import {
  GetTipsIxArgs,
  TIPS_PERCENTILES,
  TIPS_STATE,
  TipsConfig,
} from '../types';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram } from '@solana/web3.js';
import { URLS } from '../constants';
import {
  catchError,
  firstValueFrom,
  from,
  interval,
  of,
  shareReplay,
  switchMap,
  timer,
} from 'rxjs';
import { state } from '../state';

const defaultPercentiles = {
  landed_tips_25th_percentile: 1000,
  landed_tips_50th_percentile: 1000,
  landed_tips_75th_percentile: 1000,
  landed_tips_95th_percentile: 1000,
  landed_tips_99th_percentile: 1000,
  ema_landed_tips_50th_percentile: 1000,
};

const fetchTips = async (): Promise<TIPS_PERCENTILES> => {
  const response = await fetch(URLS.jitoTips);

  if (!response.ok) {
    throw new Error(`❌ Ошибка: ${response.status} ${response.statusText}`);
  }
  const tipsPercentile = await response.json();
  return tipsPercentile[0];
};

const getTipsIx = ({ payerKey }: GetTipsIxArgs) => {
  const { tips$, config } = state;

  const tipsKey = new PublicKey(config.jitoTipsAddress);
  const tipsLamports = Math.ceil(
    tips$.value.percentiles.landed_tips_95th_percentile * LAMPORTS_PER_SOL,
  );
  console.log('🫰 Tips to pay (lamports):', tipsLamports);

  return SystemProgram.transfer({
    fromPubkey: payerKey,
    toPubkey: tipsKey,
    lamports: tipsLamports,
  });
};

const startPollingTips = (intervalMs = 10_000) =>
  timer(0, intervalMs).pipe(
    switchMap(() =>
      from(fetchTips()).pipe(
        catchError((err) => {
          console.error('Ошибка при получении tips:', err);
          return of(defaultPercentiles);
        }),
      ),
    ),
    shareReplay(1),
  );

const initAndStartPollingTips = async (timeout?: number) => {
  const tipsPolling$ = startPollingTips(timeout);

  tipsPolling$.subscribe((percentiles) => {
    console.log(`📊 Tips updated: `, percentiles);
    state.tips$.next({ percentiles, updatedAt: Date.now() });
  });

  // дождаться первого значения
  await firstValueFrom(tipsPolling$);
};

export { getTipsIx, fetchTips, initAndStartPollingTips, defaultPercentiles };
