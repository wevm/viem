Implement and export a zero-argument function named `example` in
`src/index.ts`.

Construct an account-bound Ethereum mainnet client at module scope using the
Anvil default private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`.
Wrap 1 ETH by sending it to WETH at
`0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`.

Transfer 1,500,000 base units to
`0x70997970C51812dc3A010C7d01b50e0d17dc79C8` and 77,000 to
`0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`, then query exactly those
`Transfer` events by block range. Also watch for the next WETH transfer,
submit a transfer of 424,242 base units, stop watching after it arrives, and
return the queried history and watched event.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add dependencies.
When you are done, `npm run build` must pass.
