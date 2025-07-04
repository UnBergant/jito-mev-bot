import dotenv from 'dotenv';
import { getConfig } from './config';
import * as jito from './jito';
import * as helius from './streamReader/index';
import { Unsubscribe } from 'nanoevents';
import { Subscription } from 'rxjs';

dotenv.config();

const main = async () => {
  try {
    await jito.init();
    await helius.setupSubscriptions();
  } catch (e) {
    console.error('Error sending bundle:', e);
  }
};

(async () => {
  try {
    await main();
  } catch (error) {
    console.log(error);
  } finally {
  }
})();
