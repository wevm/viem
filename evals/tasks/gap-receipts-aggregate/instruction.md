Our analytics service reports how much gas each block consumed.

Export a zero-input `example()` function from `src/index.ts`. It should fetch
the latest block's transaction receipts and return their total gas used as a
bigint.

Create the Ethereum mainnet client at module scope with the available RPC
endpoint.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
