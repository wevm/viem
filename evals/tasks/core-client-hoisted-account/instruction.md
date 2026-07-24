Our payout service signs everything with a single operator key, and we do not
want to thread the sender through every call.

Implement `sendEth` in `src/index.ts`. It receives a client already bound to
the operator's account as its first argument and an options object containing
a recipient address and amount denominated in ether (e.g. `'1.5'`). The
transfer call itself must not name a sender. Send the ETH, wait until the
transaction is mined, and return its receipt.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
