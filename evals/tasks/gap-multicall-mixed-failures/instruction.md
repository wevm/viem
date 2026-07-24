Our portfolio dashboard shows a wallet's balance across a user-provided token
list. Token lists are messy: an entry sometimes points at an address that is
not a token contract at all, and one bad entry must not break the whole view.

Implement `getBalances` in `src/index.ts`. It receives a Viem client first and
an options object containing a holder address and list of token addresses. It
must:

- Fetch the holder's balance of every token in a single batched request (do
  not send one RPC request per token).
- Return one entry per token, in the same order as `tokens`:
  `{ status: 'success', balance: bigint }` when the read works, or
  `{ status: 'failure', error: Error }` when it does not.
- Never reject because of a bad token entry; the other entries still resolve
  with their values.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
