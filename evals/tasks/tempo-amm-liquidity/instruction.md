Our stablecoin exchange provides liquidity to Tempo's directional fee AMM.

Implement and export a zero-input `example` function in `src/index.ts`. Create
a module-scoped Tempo localnet client for the provider derived from private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`.
For the ordered AlphaUSD/pathUSD pool, deposit 25 pathUSD and then another 10
pathUSD, issuing LP shares to the provider.

Read the pool and provider LP balance, burn the provider's entire position,
then read both values again. Wait for every write to confirm and return the two
mint results, burn result, and the pool and LP-balance snapshots from before
and after the burn.

AlphaUSD is `0x20c0000000000000000000000000000000000001` and pathUSD is
`0x20c0000000000000000000000000000000000000`. Both have 6 decimals. Use the
installed `viem`, `http://tempo:8545`, and a 100 ms polling interval. Do not
add dependencies.

When you are done, `npm run build` must pass.
