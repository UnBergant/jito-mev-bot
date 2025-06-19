import dotenv from 'dotenv';
import { getConfig } from './config';
import * as jito from './jito';
import * as helius from './streamReader/index';
import { Unsubscribe } from 'nanoevents';

dotenv.config();

const config = getConfig();

const main = async () => {
    let unsubEvents: Unsubscribe = () => {};
    try {
        unsubEvents = await jito.init({ config });
        await helius.setupSubscriptions({ config });
    } catch (e) {
        console.error('Error sending bundle:', e);
    } finally {
        unsubEvents && unsubEvents();
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
