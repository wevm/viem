Our test suite needs a helper that makes a temporary on-chain balance change
and guarantees the node is left exactly as it was found.

Implement `withTemporaryBalance` in `src/index.ts`. It receives a Viem client
first and an options object containing an address and bigint balance in wei.
It returns the balance before, during, and after the temporary change. It must:

1. Read the current ETH balance of `address` in wei (`before`).
2. Save the node's current state so it can be restored later.
3. Force the ETH balance of `address` to `value` (the node is a local Anvil
   instance and supports development-time state manipulation).
4. Read the balance again (`during`).
5. Restore the saved state, even if an earlier step throws.
6. Read the balance one final time (`after`).

Return `{ before, during, after }`.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint (an Anvil fork) is available at `http://anvil:8545`. Do not add
any new dependencies.

When you are done, `npm run build` must pass.
