Our machine-payments service streams micropayments through TIP-20 payment
channels on Tempo. A payer locks a deposit of a stablecoin into a channel up
front, can add more later, and anyone can read the channel's on-chain state.

Implement the three functions in `src/index.ts`:

- `openChannel` receives a Tempo client carrying the payer account and opens
  a new payment channel funded
  with pathUSD:
  - `options.payee` is the address that will be paid through the channel.
  - `options.deposit` is a human-readable decimal string of pathUSD to lock in (for
    example `'100'` means 100 pathUSD).
  - Each call must open a fresh, distinct channel; a payer and payee may have
    several channels open at once.
  - Wait until the channel is confirmed on chain, then return an object with
    the channel's identifying fields under `channel`, its 32-byte id under
    `channelId`, and the transaction receipt under `receipt`.

- `topUpChannel` receives a Tempo client carrying the payer account and locks
  additional pathUSD into `options.channel`, the object returned by
  `openChannel`. `options.additionalDeposit` is a human-readable decimal string of
  pathUSD. Wait for confirmation and return the transaction receipt under a
  `receipt` key.

- `getChannelState` receives a Tempo client and reads the channel identified
  by `options.channelId`. It
  returns its total locked deposit, the amount already settled to the payee,
  and when a close was requested. `deposit` and `settled` are in base units.

pathUSD is a TIP-20 stablecoin at `0x20c0000000000000000000000000000000000000`
with 6 decimals.

Use the `viem` library already installed in this project. A Tempo RPC endpoint
(Tempo localnet, chain id 1337) is available at `http://tempo:8545`. Do not
add any new dependencies.

When you are done, `npm run build` must pass.
