Our payments service needs to send stablecoins between accounts.

Implement `transferToken` in `src/index.ts` so it transfers pathUSD from one
account to another:

- The first argument is a Tempo client carrying the sending account.
- `options.to` is the recipient address.
- `options.amount` is a human-readable decimal string (for example `'10.5'` means
  10.5 pathUSD).

pathUSD is a TIP-20 stablecoin at `0x20c0000000000000000000000000000000000000`
with 6 decimals. Wait until the transfer is confirmed on chain before
returning, and return an object that includes the transaction receipt under a
`receipt` key.

Use the `viem` library already installed in this project. A Tempo RPC endpoint
(Tempo localnet, chain id 1337) is available at `http://tempo:8545`. Do not
add any new dependencies.

When you are done, `npm run build` must pass.
