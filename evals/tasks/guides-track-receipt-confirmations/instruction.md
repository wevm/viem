Our payments service needs to submit transfers, prove they landed, and report
how deeply buried each one is.

Implement two functions in `src/index.ts`:

- `sendPaymentAndWait(client, { to, amountEther })`: using a client bound to
  the signing account, send `amountEther` ETH (a decimal string, e.g. `'1'`) to
  `to`, wait until the transaction is included in a block, and return its receipt
  (an object including `status`, `transactionHash`, and `blockNumber`).
- `getConfirmationCount(client, { hash })`: return the number of blocks that have
  confirmed the transaction with the given hash, as a bigint (`0n` if it is
  still pending).

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
