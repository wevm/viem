Our Tempo wallet saves AlphaUSD as a user's default fee token.

Implement and export a zero-input `example` function in `src/index.ts`. Derive
module-scoped accounts for the user from private key
`0x1111111111111111111111111111111111111111111111111111111111111111`
and a liquidity provider derived from private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`.
Create one Tempo localnet client for the user. First add enough fee-pool
liquidity to make AlphaUSD usable. Persist AlphaUSD as the user's default fee
token, read it back, then transfer `5` pathUSD to
`0x4545454545454545454545454545454545454545` without choosing a fee token for
that transfer. Wait for confirmation and return the saved token and both write
results.

pathUSD is `0x20c0000000000000000000000000000000000000`;
AlphaUSD is `0x20c0000000000000000000000000000000000001`.
Both have 6 decimals. Use the installed `viem`, `http://tempo:8545`, and a
100 ms polling interval. Do not add dependencies.

When you are done, `npm run build` must pass.
