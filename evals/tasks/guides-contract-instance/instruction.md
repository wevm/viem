Our treasury app works with ERC-20 tokens at arbitrary addresses and needs a
pre-flight report before it moves funds.

Implement `auditToken` in `src/index.ts`. It receives a Viem client first and
an options object containing a standard ERC-20 token address, holder,
recipient, and amount. It returns:

- `symbol` (string) and `decimals` (number) read from the token contract.
- `holderBalance` (bigint): the holder's current token balance.
- `transferOk` (boolean): the outcome of previewing a transfer of `amount`
  tokens from the holder to the recipient, without submitting any transaction
  or changing on-chain state. If the transfer would fail, let the error
  propagate.

The app talks to the same token contract many times, so configure the token's
ABI and address once as a single reusable handle and run every read and the
preview through that handle instead of repeating the configuration per call.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
