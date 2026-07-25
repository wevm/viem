Our payments service needs a Tempo transfer that expires on chain.

Implement and export a zero-input `example` function in `src/index.ts`. Create
a module-scoped Tempo localnet client for the account derived from private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`.
Read the current chain time, then send `10.5` pathUSD to
`0x4545454545454545454545454545454545454545` with an on-chain deadline 60
seconds later. Also try to send `3.25` pathUSD to
`0x4646464646464646464646464646464646464646` with an already expired
deadline. Return the successful result, its deadline, and whether the expired
submission was rejected. Only classify the expected contract revert as
rejection; let unrelated errors propagate.

pathUSD is at `0x20c0000000000000000000000000000000000000`
with 6 decimals. Use the installed `viem`, `http://tempo:8545`, and a 100 ms
polling interval. Do not add dependencies.

When you are done, `npm run build` must pass.
