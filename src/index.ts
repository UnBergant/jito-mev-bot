import dotenv from 'dotenv';
import { getConfig } from './config';
import * as jito from './jito';
import * as helius from './streamReader/index';
import { Unsubscribe } from 'nanoevents';

dotenv.config();

const main = async () => {
    const config = getConfig();

    let unsubEvents: Unsubscribe = () => {};
    try {
        unsubEvents = (await jito.init({ config })) as Unsubscribe;
        await helius.setupSubscriptions({ config });
    } catch (e) {
        unsubEvents();
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
