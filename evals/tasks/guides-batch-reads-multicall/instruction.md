Our portfolio dashboard renders a token card for USDC on Ethereum mainnet:
the token's name, symbol, and decimals, plus a holder's balance. Fetching
each value with its own RPC round trip is too slow.

Implement two functions in `src/index.ts`:

- `getUsdcSummary(client, { owner })` returns a summary for USDC
  (`0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`) containing its `name`,
  `symbol`, and `decimals`, plus the `balance` of `owner`. Batch all four
  reads into a single RPC request instead of four separate ones.
- `getTokenSummaryStrict(client, { token, owner })` returns the same summary for an
  arbitrary ERC-20 address, batched the same way, and must reject if any of
  the four reads fails (for example when the contract at `token` reverts on
  those calls).

Use the `viem` library already installed in this project. An Ethereum
mainnet RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
