Our payments service needs to tell users why a transfer failed.

Implement `sendPayment` in `src/index.ts`. It receives a client bound to the
sending account as its first argument and an options object containing
`amountEther` and the recipient address. It attempts the transfer, then
returns a status string:

- `'sent'` when the transaction is broadcast successfully.
- `'insufficient-funds'` when the node rejects the transaction because the
  sender's balance cannot cover the amount plus gas. Detect this case by
  inspecting the typed errors the library throws (including nested causes),
  not by matching on error message text.
- `'unknown'` for any other failure.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
