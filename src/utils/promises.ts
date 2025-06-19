const promisifyTimeout = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

export { promisifyTimeout };
