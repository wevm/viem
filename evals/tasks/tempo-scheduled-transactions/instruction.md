Our payouts service submits a Tempo stablecoin transfer before its release
time and lets the network hold it until the window opens.

Implement and export a zero-input `example` function in `src/index.ts`. Create
a module-scoped Tempo localnet client for the account derived from private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`.
Read the current chain time, submit a `12.5` pathUSD transfer to
`0x5151515151515151515151515151515151515151` that becomes valid six seconds
later, wait for it to confirm, and return the result and release timestamp.
The signed transaction must carry the validity window; do not sleep before
sending an ordinary transfer.

pathUSD is at `0x20c0000000000000000000000000000000000000`
with 6 decimals. Use the installed `viem`, `http://tempo:8545`, and a 100 ms
polling interval. Do not add dependencies.

When you are done, `npm run build` must pass.
