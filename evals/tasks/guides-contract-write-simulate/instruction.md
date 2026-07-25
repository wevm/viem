Implement and export a zero-argument function named `example` in
`src/index.ts`.

Construct an Ethereum mainnet client at module scope for the impersonated USDC
holder `0x28C6c06298d514Db089934071355E5743bf21d60`. Simulate a transfer of
12,345,678 USDC base units to
`0x4242424242424242424242424242424242424242`, submit the request produced by
the successful simulation, wait for confirmation, and return the simulated
result, receipt, amount, recipient, and token address. Always stop
impersonating the holder.

Use the `viem` library already installed in this project. USDC is deployed at
`0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`, and an Ethereum mainnet RPC
endpoint is available at `http://anvil:8545`. Do not add dependencies. When
you are done, `npm run build` must pass.
