Implement and export a zero-argument function named `example` in
`src/index.ts`.

Construct an Ethereum mainnet client at module scope for
`0x28C6c06298d514Db089934071355E5743bf21d60`. Impersonate that account,
transfer 12,345,678 USDC base units to
`0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`, wait for confirmation, return
the transaction hash, and always stop impersonating the account. USDC is at
`0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add dependencies.
When you are done, `npm run build` must pass.
