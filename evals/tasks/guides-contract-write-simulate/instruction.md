Our treasury service moves ERC-20 tokens, and every transfer must be
validated against current chain state before any transaction is broadcast.

Implement `transferToken` in `src/index.ts`. It receives a Viem client bound to
the sender account first and an options object containing an ERC-20 token
contract address, recipient address, and amount in the token's base units. It
must:

1. Dry-run the token contract's `transfer(to, amount)` call against current
   chain state from the sender's address, without broadcasting anything, and
   capture the boolean the function returns.
2. Only if that dry run succeeds, broadcast the same validated call as a
   transaction and wait for it to be confirmed on chain.
3. Return `{ simulated, receipt }`, where `simulated` is the boolean from
   step 1 and `receipt` is the confirmed transaction receipt (including its
   `status` and `transactionHash`).

If the dry run reverts, the error must propagate to the caller and no
transaction may be sent.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
