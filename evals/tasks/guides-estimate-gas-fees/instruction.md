Our wallet UI shows a cost preview before the user confirms a transfer.

Implement two functions in `src/index.ts`:

- `estimateTransferGas(client, options)` takes `{ from, to, value }` (sender address,
  recipient address, amount in wei as a bigint) and returns the number of gas
  units (bigint) a plain ETH transfer with those parameters would consume.
- `estimateFees(client)` returns the current EIP-1559 fee estimate as
  `{ maxFeePerGas: bigint; maxPriorityFeePerGas: bigint }`.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
