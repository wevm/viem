Implement and export a zero-argument function named `example` in
`src/index.ts`.

Construct an Ethereum mainnet client at module scope. Encode
`balanceOf(address)` calldata from the ERC-20 ABI without a contract-read
helper, call USDC at `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`, and decode
the returned bigints with the ABI. Return balances for
`0x28C6c06298d514Db089934071355E5743bf21d60` and
`0x4242424242424242424242424242424242424242`.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add dependencies.
When you are done, `npm run build` must pass.
