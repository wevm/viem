Our Tempo stablecoin issuer needs an emergency transfer brake.

Implement and export a zero-input `example` function in `src/index.ts`. Create
a module-scoped Tempo localnet client for the account derived from private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`.
Create a USD TIP-20 token, grant that account issuance, pause, and unpause
roles, then mint exactly 1,000 tokens to it. Pause the token and demonstrate
that a 5-token transfer fails. Unpause it, transfer `12.5` tokens to
`0x4545454545454545454545454545454545454545`, wait for confirmation, and
return the token address, failure result, and successful transfer. Only
classify the expected contract revert as failure; let unrelated errors
propagate.

The token has 6 decimals. Use the installed `viem`, `http://tempo:8545`, and
a 100 ms polling interval. Do not add dependencies.

When you are done, `npm run build` must pass.
