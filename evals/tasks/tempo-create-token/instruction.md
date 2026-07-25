Our platform lets businesses launch USD stablecoins on Tempo.

Implement and export a zero-input `example` function in `src/index.ts`. Create
a module-scoped Tempo localnet client for the account derived from private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`.
Create two USD-denominated TIP-20 tokens, `Orbital USD` (`OUSD`) and
`Harbor USD` (`HUSD`). Wait for both deployments, read each token's metadata
back from the chain, and return both addresses and metadata.

Use the `viem` library already installed in this project. Configure the client
with `http://tempo:8545` and a 100 ms polling interval. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
