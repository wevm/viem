Our payments service needs to tell users why a transfer failed.

Implement and export a zero-input `example()` function in `src/index.ts`.
Construct one Ethereum mainnet client at module scope. Derive accounts from
these private keys:

- `0x5eba0000000000000000000000000000000000000000000000000000000e0a15`
- `0x5eba0000000000000000000000000000000000000000000000000000000f00d5`

Attempt three transfers to `0x4242424242424242424242424242424242424242`:
one ETH from the first account, one ETH from the second account, and one
transfer from the second account with the invalid amount `not-an-amount`.
Pass the selected account with each transfer.
Classify each attempt as:

- `'sent'` when the transaction is broadcast successfully.
- `'insufficient-funds'` when the node rejects the transaction because the
  sender's balance cannot cover the amount plus gas. Detect this case by
  inspecting the typed errors the library throws (including nested causes),
  not by matching on error message text.
- `'unknown'` for any other failure.

Return the three classifications as `insufficientFunds`, `sent`, and
`unknown`.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
