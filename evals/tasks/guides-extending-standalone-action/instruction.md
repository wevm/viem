Several modules in our wallet dashboard fetch the same account snapshot. We
want that logic written once as a reusable function that takes a client, plus
a method form for callers who extend their existing client.

Implement the following in `src/index.ts`:

- `getAccountSummary(client, { address })`: a standalone async function that
  takes a client as its first argument and resolves to `{ balance, nonce }`
  for the given address: its current balance in wei as a bigint, and the
  number of transactions it has sent as a number.
- `extendAppClient(client)`: extends the supplied client so
  `client.accounts.getSummary({ address })` is available as a method and
  returns the same summary by delegating to `getAccountSummary`. Preserve the
  supplied client's type information in the returned extended client.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
