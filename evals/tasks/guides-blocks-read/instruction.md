Our explorer backend needs a few block-level reads.

Implement the following functions in `src/index.ts`:

- `getLatestBlock(client)`: returns the most recent block on the chain, including
  at least its `hash` and `number`.
- `getFinalizedBlock(client)`: returns the block the network currently considers
  finalized, including at least its `hash` and `number`.
- `countBlockTransactions(client, { blockNumber })`: returns how many transactions the
  block at the given number contains.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
