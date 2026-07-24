Our treasury dashboard tracks a custom stablecoin, Vault USD (symbol `VUSD`,
6 decimals), that is deployed to a different address in each environment, so
the contract address is only known at runtime.

Implement two functions in `src/index.ts`:

- `defineVusd({ tokenAddress })` creates a reusable token definition for Vault
  USD whose mainnet (chain id 1) contract address is `tokenAddress`.
- `getTokenBalance(client, { holder })` reads the holder's balance from a
  client configured with that definition, referring to the token by its symbol rather
  than its contract address, and
  returns `{ amount, decimals, formatted }`, where `amount` is the balance in
  base units as a bigint, `decimals` is the token's decimals, and `formatted`
  is the human-readable balance string.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
