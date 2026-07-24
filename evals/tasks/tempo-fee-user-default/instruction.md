Our wallet lets each user pick which stablecoin pays their Tempo network
fees, so they never have to think about it again per transaction.

Implement the following functions in `src/index.ts`:

- `setDefaultFeeToken`: the first argument is a Tempo client carrying the
  account. Persist `options.token` as its default fee token. Wait until
  the change is confirmed on chain before returning, and return an object
  that includes the transaction receipt under a `receipt` key.
- `getDefaultFeeToken`: the only argument is a Tempo client carrying the
  account. Return its current on-network default fee token address, or `null`
  if none is set.
- `transferWithDefaultFee`: the first argument is a Tempo client carrying the
  account. Transfer `options.amount` pathUSD
  (a human-readable decimal string, for example `'5'` means 5 pathUSD) to
  `options.to` WITHOUT choosing a fee token for that transaction, so the network
  charges the fee in the account's saved default fee token. Wait until the
  transfer is confirmed on chain before returning, and return an object that
  includes the transaction receipt under a `receipt` key.

pathUSD is a TIP-20 stablecoin at `0x20c0000000000000000000000000000000000000`
with 6 decimals. Fee tokens are also TIP-20 stablecoin addresses (for example
AlphaUSD at `0x20c0000000000000000000000000000000000001`, also 6 decimals).

Use the `viem` library already installed in this project. A Tempo RPC endpoint
(Tempo localnet, chain id 1337) is available at `http://tempo:8545`. Do not
add any new dependencies.

When you are done, `npm run build` must pass.
