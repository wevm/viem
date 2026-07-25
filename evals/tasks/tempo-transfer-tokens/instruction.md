Our payments service needs to send Tempo stablecoins between accounts.

Implement and export a zero-input `example` function in `src/index.ts`. Create
a module-scoped Tempo localnet client for the account derived from private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`.
Transfer `10.5` pathUSD to
`0x4242424242424242424242424242424242424242` and `0.25` pathUSD to
`0x4343434343434343434343434343434343434343`. Express both amounts as
human-readable decimals, wait for confirmation, and return both results.

pathUSD is at `0x20c0000000000000000000000000000000000000`
with 6 decimals. Use the `viem` library already installed in this project.
Configure the client with `http://tempo:8545` and a 100 ms polling interval.
Do not add any new dependencies.

When you are done, `npm run build` must pass.
