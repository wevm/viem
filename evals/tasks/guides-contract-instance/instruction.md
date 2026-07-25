Implement and export a zero-argument function named `example` in
`src/index.ts`.

At module scope, construct an Ethereum mainnet client and attach a contract
instance to USDC at `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`. Through that
instance, read its symbol, decimals, and the balance of
`0x28C6c06298d514Db089934071355E5743bf21d60`. Simulate transferring
1,234,567 base units from that holder to
`0x4242424242424242424242424242424242424242` without broadcasting. Return
the reads and simulated result.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add dependencies.
When you are done, `npm run build` must pass.
