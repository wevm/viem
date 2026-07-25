Our payments service transfers pathUSD while paying its network fee in
AlphaUSD.

Implement and export a zero-input `example` function in `src/index.ts`. Create
a module-scoped Tempo localnet client for the account derived from private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`.
First add enough fee-pool liquidity to make AlphaUSD an accepted fee token,
paying that setup transaction in pathUSD. Then send `12.5` pathUSD to
`0x4242424242424242424242424242424242424242`, paying the transfer fee in
AlphaUSD. Wait for confirmation and return the result.

pathUSD is `0x20c0000000000000000000000000000000000000` and
AlphaUSD is `0x20c0000000000000000000000000000000000001`; both have 6 decimals.
Use the `viem` library already installed in this project. Configure the client
with `http://tempo:8545` and a 100 ms polling interval. Do not add dependencies.

When you are done, `npm run build` must pass.
