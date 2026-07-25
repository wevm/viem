Implement and export a zero-argument function named `example` in
`src/index.ts`.

Construct an Ethereum mainnet client at module scope. In one batched contract
request, read USDC's name, symbol, decimals, and the balance of
`0x28C6c06298d514Db089934071355E5743bf21d60`. USDC is deployed at
`0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`. Return those four decoded
values as one object.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add dependencies.
When you are done, `npm run build` must pass.
