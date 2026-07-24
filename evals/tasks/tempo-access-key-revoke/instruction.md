Our treasury service delegates limited spending authority on Tempo: the root
account authorizes a session "access key" that may spend pathUSD up to a cap,
and operations staff need tooling to inspect what a key has left, spend
through it, and revoke it the moment it is no longer trusted.

Implement the following functions in `src/index.ts`:

- `grantSpendingKey`: the first argument is a Tempo client carrying the root
  account. Authorize `options.accessKey` on that account. The key must be
  allowed to spend at most `options.limit` base
  units of pathUSD, and must expire roughly one hour in the future. Wait for
  confirmation and return an object that includes the transaction receipt
  under a `receipt` key.
- `remainingAllowance`: the first argument is a Tempo client. Return the
  remaining pathUSD spending allowance (base units, as a `bigint`) of
  `options.accessKey` on `options.account`.
- `spendWithKey`: the first argument is a Tempo client carrying the authorized
  access-key Account. Transfer `options.amount` base units of pathUSD to
  `options.to`. Pay fees in pathUSD. Wait for confirmation and return an
  object that includes the receipt under a `receipt` key.
- `revokeSpendingKey`: the first argument is a Tempo client carrying the root
  account. Revoke the access key at `options.accessKey`, so the key can no
  longer act for the account. Wait for confirmation and return an object
  that includes the receipt under a `receipt` key.

pathUSD is a TIP-20 stablecoin at `0x20c0000000000000000000000000000000000000`
with 6 decimals.

Use the `viem` library already installed in this project. A Tempo RPC endpoint
(Tempo localnet, chain id 1337) is available at `http://tempo:8545`. Do not
add any new dependencies.

When you are done, `npm run build` must pass.
