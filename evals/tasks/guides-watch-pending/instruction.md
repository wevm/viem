Our monitoring service needs to react the moment a transaction enters the
node's transaction pool.

Implement `getFirstPendingHash(client)` in `src/index.ts` so it observes the
client's pending transaction pool, resolves with the hash of the first pending
transaction it sees (a `0x`-prefixed string), and stops observing before it
resolves. Use the `viem` library already installed in this project. An
Ethereum mainnet RPC endpoint is available at `http://anvil:8545`. Do not add
any new dependencies.

When you are done, `npm run build` must pass.
