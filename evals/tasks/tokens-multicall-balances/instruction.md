Our portfolio dashboard shows the USDC balances of three watched wallets side
by side. Fetching each balance with its own RPC round trip is too slow.

Implement `getUsdcBalances` in `src/index.ts` so that
`getUsdcBalances(client, { accounts: [a, b, c] })` returns the USDC balances of the three accounts,
in the same order, as bigints in base units (USDC lives at
`0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` and has 6 decimals). Batch the
three reads into a single RPC request instead of three separate ones.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
