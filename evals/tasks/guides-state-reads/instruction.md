Implement and export a zero-argument function named `example` in
`src/index.ts`.

Construct an Ethereum mainnet client at module scope. Concurrently read the
ETH balance, transaction count, bytecode, and storage slot zero of
`0x53e205a3d2286c93630f4e1de81b95dbbf2ec241`, then return all four values.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add dependencies.
When you are done, `npm run build` must pass.
