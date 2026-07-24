Our payout service sends ETH and must not report success until the transfer
is confirmed on chain.

Implement `sendPayment` in `src/index.ts`. It receives a Viem client bound to
the sender account first and an options object containing a recipient address
and amount in ether (a decimal string like `'0.5'`). It must send that amount
of ETH from the client's account to the recipient and
return the confirmed transaction receipt, including its `status`. Obtain the
receipt in a single client operation: do not broadcast the transaction and
then separately poll or wait for its receipt.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
