Our checkout service needs to grant a spending allowance and pay a merchant
in one atomic on-chain step.

Implement `approveAndTransfer` in `src/index.ts` so it performs two pathUSD
operations:

1. Approve `spender` to spend `approveAmount` pathUSD on behalf of the
   sending account.
2. Transfer `transferAmount` pathUSD to `to`.

Both operations must be batched into ONE transaction (a single signature and
a single transaction hash) so they succeed or fail together. Do not send two
separate transactions.

- The first argument is a Tempo client carrying the sending account.
- `options.spender` is the address granted the allowance.
- `options.to` is the transfer recipient.
- `options.approveAmount` and `options.transferAmount` are human-readable decimal strings
  (for example `'10.5'` means 10.5 pathUSD).

pathUSD is a TIP-20 stablecoin at `0x20c0000000000000000000000000000000000000`
with 6 decimals. Wait until the transaction is confirmed on chain before
returning, and return an object that includes the transaction receipt under a
`receipt` key.

Use the `viem` library already installed in this project. A Tempo RPC endpoint
(Tempo localnet, chain id 1337) is available at `http://tempo:8545`. Do not
add any new dependencies.

When you are done, `npm run build` must pass.
