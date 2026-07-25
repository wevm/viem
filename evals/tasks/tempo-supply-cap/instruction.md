Our Tempo issuance service launches stablecoins with hard supply ceilings.

Implement and export a zero-input `example` function in `src/index.ts`. Create
a module-scoped Tempo localnet client for the account derived from private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`,
with pathUSD as its fee token.

Launch `Capped Coin` (`CAPA`) with a 1,000-token cap and mint the full cap to
`0x4242424242424242424242424242424242424242`. Launch `Capped Coin B`
(`CAPB`) with a `0.25`-token cap and mint it to
`0x4343434343434343434343434343434343434343`. For each token, grant issuance
permission, set the cap before minting, and demonstrate that one extra base
unit is rejected. Return both token addresses, successful mint receipts, and
rejection results. Only classify the expected contract reverts as rejection;
let unrelated errors propagate.

Both tokens have 6 decimals. pathUSD is
`0x20c0000000000000000000000000000000000000`. Use the installed `viem`,
`http://tempo:8545`, and a 100 ms polling interval. Do not add dependencies.

When you are done, `npm run build` must pass.
