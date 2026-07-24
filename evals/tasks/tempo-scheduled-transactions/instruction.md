Our payouts service signs stablecoin transfers ahead of time and lets the
network hold them until a release time passes.

Implement `scheduleTransfer` in `src/index.ts` so it submits a pathUSD
transfer that only becomes valid for inclusion after a given time:

- The first argument is a Tempo client carrying the sending account.
- `options.to` is the recipient address.
- `options.amount` is a human-readable decimal string (for example `'12.5'` means
  12.5 pathUSD).
- `options.validAfter` is a Unix timestamp in seconds. The transfer must not execute
  at any time before it; the network may only include it once that time has
  passed.

The signed transaction itself must encode this validity window so the chain
enforces it; do not simply have your code sleep before sending an ordinary
transfer. Submit right away, wait until the transfer is confirmed on chain,
and return an object that includes the transaction receipt under a `receipt`
key. Release times are only ever a few seconds in the future.

pathUSD is a TIP-20 stablecoin at `0x20c0000000000000000000000000000000000000`
with 6 decimals.

Use the `viem` library already installed in this project. A Tempo RPC endpoint
(Tempo localnet, chain id 1337) is available at `http://tempo:8545`. Do not
add any new dependencies.

When you are done, `npm run build` must pass.
