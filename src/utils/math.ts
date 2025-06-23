export const splitIntToInts = (n: number, count: number): number[] => {
    if (count === 1) return [n];
    const cuts = [...Array(count - 1)].map(
        () => Math.floor(Math.random() * (n - 1)) + 1,
    );
    cuts.sort((a, b) => a - b);
    return [
        cuts[0],
        ...cuts.slice(1).map((v, i) => v - cuts[i]),
        n - cuts.at(-1)!,
    ];
};
