Implement and export a zero-argument function named `example` in
`src/index.ts`.

Construct an Ethereum mainnet client at module scope for the impersonated USDC
holder `0x28C6c06298d514Db089934071355E5743bf21d60`. USDC is deployed at
`0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`.

Transfer 1,500,000 base units to
`0x70997970C51812dc3A010C7d01b50e0d17dc79C8` and 77,000 to
`0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`, then query exactly those
`Transfer` events by block range. Also watch for the next USDC transfer,
submit a transfer of 424,242 base units, stop watching after it arrives, and
return the queried history and watched event. Always stop impersonating the
holder.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add dependencies.
When you are done, `npm run build` must pass.
