Our payments service fans out several stablecoin payouts from a single
account at once. Tempo supports this natively: every account has
two-dimensional nonces, where each nonce key (any value greater than 0)
tracks its own independent transaction sequence, so transactions on
different keys do not have to wait for one another.

Implement two functions in `src/index.ts`:

Each function receives a Tempo client as its first argument and one options
object as its second argument.

`sendParallelTransfers`

- The client carries the sending account.
- `options.transfers` is an array of `{ to, amount, nonceKey }` entries: the
  recipient address, a human-readable pathUSD amount (for example `'1.5'`
  means 1.5 pathUSD), and the distinct nonce key (a bigint) that transfer
  must be sent under.
- Submit all transfers concurrently (do not wait for one transfer to
  confirm before submitting the next), each under its own nonce key, and
  wait until every transfer is confirmed on chain.
- Return an object with a `receipts` array containing the transaction
  receipts in the same order as `transfers`.

`readNonce`

- Return the current on-chain nonce (as a bigint) for
  `options.account` and `options.nonceKey`.

pathUSD is a TIP-20 stablecoin at `0x20c0000000000000000000000000000000000000`
with 6 decimals.

Use the `viem` library already installed in this project. A Tempo RPC endpoint
(Tempo localnet, chain id 1337) is available at `http://tempo:8545`. Do not
add any new dependencies.

When you are done, `npm run build` must pass.
