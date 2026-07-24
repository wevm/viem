Our dashboard needs to show how fresh its on-chain data is.

Implement `getLatestBlockNumber` in `src/index.ts`. It receives a Viem client
and returns the current block number as a bigint. Use the `viem` library
already installed in this project. An Ethereum mainnet RPC endpoint is
available at `http://anvil:8545`. Do not add any new dependencies.

When you are done, `npm run build` must pass.
