Our machine-payments service uses Tempo payment channels. A payer locks a
TIP-20 deposit in a channel for a payee, then pays off-chain by signing
vouchers. A voucher is a signed promise for the cumulative total paid over the
channel's life, and the payee captures the funds by submitting the latest
voucher on-chain.

Implement two functions in `src/index.ts`:

- `openChannel` receives a Tempo client carrying the payer account and opens
  a payment channel to `options.payee`, funded with
  `options.deposit` AlphaUSD.
  Return an object with a `channel` key describing the opened channel; the
  value is passed back to `settleVoucher` unchanged, so use whatever shape you
  need.
- `settleVoucher` receives a Tempo client carrying the payee account.
  `options.payer` is the payer's local Account. Have it sign an off-chain
  voucher authorizing a cumulative total of `options.amount` AlphaUSD for
  `options.channel`, then submit that voucher on-chain with the payee client.
  Wait until settlement is confirmed and return an object
  that includes the settlement transaction receipt under a `receipt` key.

AlphaUSD is a TIP-20 stablecoin at `0x20c0000000000000000000000000000000000001`
with 6 decimals. Deposit and amount values are human-readable decimal strings
(for example `'10.5'` means 10.5 AlphaUSD). Our accounts pay transaction fees
in pathUSD (`0x20c0000000000000000000000000000000000000`), never in AlphaUSD,
so settled AlphaUSD amounts land exactly.

Use the `viem` library already installed in this project. A Tempo RPC endpoint
(Tempo localnet, chain id 1337) is available at `http://tempo:8545`. Do not
add any new dependencies.

When you are done, `npm run build` must pass.
