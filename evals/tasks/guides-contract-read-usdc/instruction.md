Our token dashboard shows metadata for USDC on Ethereum mainnet.

Implement `getTokenMetadata` in `src/index.ts`. It receives a Viem client and
fetches the token's on-chain metadata, returning its `decimals`, `name`, `symbol`, and
`totalSupply`. USDC lives at
`0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`. Use the `viem` library already
installed in this project. An Ethereum mainnet RPC endpoint is available at
`http://anvil:8545`. Do not add any new dependencies.

When you are done, `npm run build` must pass.
