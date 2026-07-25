Our portfolio dashboard shows three Ethereum mainnet USDC balances side by
side. USDC lives at `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`.

Implement and export a zero-input `example` function in `src/index.ts`. Create
an Ethereum mainnet client at module scope and read the USDC balances of these
accounts in one batched request:

- `0x28C6c06298d514Db089934071355E5743bf21d60`
- `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
- `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`

Return the three balances as bigints in the same order. Use the `viem` library
already installed in this project. The RPC endpoint is available at
`http://anvil:8545`. Do not add any new dependencies.

When you are done, `npm run build` must pass.
