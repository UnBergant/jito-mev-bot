import { searcher } from 'jito-ts';
import { ICurrentLeader } from '../types';

export const isCurrentLeader = (leader: ICurrentLeader) => {
    return (
        leader &&
        leader.ok &&
        leader.value.currentSlot === leader.value.nextLeaderSlot
    );
};

export const waitForJitoLeader = (searcherClient: searcher.SearcherClient) =>
    new Promise((res) => {
        const timeoutId = setInterval(async () => {
            const leader = await searcherClient.getNextScheduledLeader();
            console.log({ leader });
            if (isCurrentLeader(leader)) {
                clearInterval(timeoutId);
                res(leader.ok && leader.value);
            }
        }, 1000);
    });
