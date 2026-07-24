Our payments service needs time-limited transfers: a signed transfer that is
only eligible for inclusion on chain until a deadline, and that the network
refuses once the deadline has passed.

Implement `transferWithDeadline` in `src/index.ts` so it transfers pathUSD
with an expiry:

- The first argument is a Tempo client carrying the sending account.
- `options.to` is the recipient address.
- `options.amount` is a human-readable decimal string (for example `'10.5'` means
  10.5 pathUSD).
- `options.deadline` is a Unix timestamp in seconds. The transaction must only be
  valid for inclusion in a block before this time; embed the deadline in the
  transaction itself rather than checking the clock in JavaScript.

When the deadline is in the future, wait until the transfer is confirmed on
chain and return an object that includes the transaction receipt under a
`receipt` key. When the deadline has already passed, the transaction must
never land: let the resulting error propagate to the caller (do not catch or
swallow it), and no tokens may move.

pathUSD is a TIP-20 stablecoin at `0x20c0000000000000000000000000000000000000`
with 6 decimals.

Use the `viem` library already installed in this project. A Tempo RPC endpoint
(Tempo localnet, chain id 1337) is available at `http://tempo:8545`. Do not
add any new dependencies.

When you are done, `npm run build` must pass.
