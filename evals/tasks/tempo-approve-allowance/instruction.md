Our payments service lets a partner account pull pathUSD from a customer
account.

Implement three functions in `src/index.ts`:

- `approveSpender`: the first argument is a Tempo client carrying the owner
  account. It authorizes `options.spender` to spend up to `options.amount`
  pathUSD on its
  behalf. Wait until the approval is confirmed on chain, and return an object
  that includes the transaction receipt under a `receipt` key.
- `getAllowance`: the first argument is a Tempo client. Return the remaining
  pathUSD amount that `options.spender` may spend from `options.owner`, as a
  bigint in base units.
- `spendAllowance`: the first argument is a Tempo client carrying the spender
  account. It uses its authorization to move `options.amount` pathUSD out of
  `options.owner` and into `options.to`. Wait until the transfer is confirmed on
  chain, and return an object that includes the transaction receipt under a
  `receipt` key.

Amount values are human-readable decimal strings (for example `'10.5'`
means 10.5 pathUSD). pathUSD is a TIP-20 stablecoin at
`0x20c0000000000000000000000000000000000000` with 6 decimals.

Use the `viem` library already installed in this project. A Tempo RPC endpoint
(Tempo localnet, chain id 1337) is available at `http://tempo:8545`. Do not
add any new dependencies.

When you are done, `npm run build` must pass.
