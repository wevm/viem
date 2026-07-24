Our analytics service reports how much gas each block consumed.

Implement `getBlockGasUsed` in `src/index.ts`. It receives a Viem client first
and an options object containing a block number as a bigint. It fetches every
transaction receipt in that block and returns the gas used summed across
those receipts, as a bigint.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
