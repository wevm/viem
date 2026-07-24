Our payments service delegates USDC spending on Ethereum mainnet: an account
owner grants a spender permission to move USDC on their behalf, the service
checks how much of that permission remains, and the spender then moves part of
it to a recipient. USDC lives at `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
(6 decimals).

Implement the three functions in `src/index.ts`:

- `approveUsdcSpender(client, { spender, amount })`: using a client bound to
  the owner, grant `spender` permission to spend exactly
  `amount` base units of the owner's USDC. Resolve only once the transaction
  is confirmed.
- `getUsdcAllowance(client, { owner, spender })`: return how many base units of USDC
  `spender` is currently permitted to spend on behalf of `owner`.
- `spendUsdcAllowance(client, { owner, recipient, amount })`: using a client
  bound to the spender, move `amount` base units of
  USDC from `owner` to `recipient` against the permission granted above.
  Resolve only once the transaction is confirmed.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
