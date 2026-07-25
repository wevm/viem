Our machine-payments service opens and tops up Tempo payment channels.

Implement and export a zero-input `example` function in `src/index.ts`. Create
a module-scoped Tempo localnet client for the payer derived from private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`.

Open a 100 pathUSD channel to
`0x4242424242424242424242424242424242424242`, top it up by 25.5 pathUSD,
and read its state. Then open two distinct channels to
`0x4343434343434343434343434343434343434343`, depositing 3.25 and 1 pathUSD.
Top up the 3.25 pathUSD channel by 0.75 pathUSD and read both states. Wait for
every write to confirm and return the opened channels, top-ups, and states.

pathUSD is `0x20c0000000000000000000000000000000000000` and has 6 decimals.
Use the installed `viem`, `http://tempo:8545`, and a 100 ms polling interval.
Do not add dependencies.

When you are done, `npm run build` must pass.
