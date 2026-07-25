Implement and export a zero-argument function named `example` in
`src/index.ts`.

Construct an Ethereum mainnet client at module scope. Resolve `vitalik.eth` to
an address and reverse-resolve
`0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045` to its primary name. Normalize
the name before resolving it and return both results.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add dependencies.
When you are done, `npm run build` must pass.
