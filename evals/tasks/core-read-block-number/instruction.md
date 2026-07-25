Our dashboard needs to show how fresh its on-chain data is.

Implement and export a zero-input `example()` function in `src/index.ts`. It
must construct an Ethereum mainnet client at module scope, connect to
`http://anvil:8545`, and return the current block number as a bigint.

Use the `viem` library already installed in this project. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
