Our trading desk needs to manage resting orders on Tempo's enshrined DEX.

Implement and export a zero-input `example` function in `src/index.ts`. Create
a module-scoped Tempo localnet client for the maker derived from private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`.

Create a USD TIP-20 token named `Desk Dollar` with symbol `DESKUSD`, grant the
maker issuance permission, mint exactly 1,000,000 tokens, and list its pathUSD
pair. Place a 250-token buy order at tick 40, read the order and order book,
then cancel it. Place a 100-token sell order at tick -60, read it and the
order book, then cancel it too. Wait for every write to confirm and return the
market plus each placement, order read, book read, and cancellation.

Tokens have 6 decimals. Use the installed `viem`, `http://tempo:8545`, and a
100 ms polling interval. Do not add dependencies.

When you are done, `npm run build` must pass.
