Our treasury service on Tempo keeps funds behind a native multisig account
(TIP-1061): an account defined by a set of owners with voting weights and an
approval threshold. A transaction from the multisig is authorized only when
the collected owner approvals meet the threshold. The first transaction from
a multisig account registers it onchain automatically.

Implement `transferFromMultisig` in `src/index.ts` so it sends pathUSD from a
2-of-3 multisig:

- The first argument is a Tempo client carrying an account that holds pathUSD.
  Use it to fund the
  multisig with enough pathUSD to cover the transfer amount plus fees
  (pathUSD is the fee token).
- `options.owners` are the three local owner Accounts. Each owner has weight
  1 and the approval threshold is 2.
- `options.approvers` are the owner Accounts approving this transfer (a
  subset of `options.owners`).
- `options.to` is the recipient address.
- `options.amount` is a human-readable decimal string (for example `'10.5'` means
  10.5 pathUSD).

The function must build a single transaction from the multisig account that
transfers `amount` pathUSD to `to`, collect one approval signature from each
Account in `options.approvers`, broadcast the transaction with those
approvals, and wait until it is confirmed on chain. Return an object with the
multisig account's address under `multisig` and the transaction receipt under
`receipt`.

If the collected approvals do not meet the threshold, the node rejects the
broadcast; let that error propagate (do not catch it).

pathUSD is a TIP-20 stablecoin at `0x20c0000000000000000000000000000000000000`
with 6 decimals.

Use the `viem` library already installed in this project. A Tempo RPC endpoint
(Tempo localnet, chain id 1337) is available at `http://tempo:8545`. Do not
add any new dependencies.

When you are done, `npm run build` must pass.
