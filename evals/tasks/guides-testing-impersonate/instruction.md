Our integration tests run against a local Anvil fork of Ethereum mainnet and
need wallets seeded with real USDC.

Implement `seedUsdc` in `src/index.ts`. It receives a Viem client bound to the
whale as a JSON-RPC account first and an options object containing a recipient
address and bigint amount in USDC base units. It returns the transfer's
transaction hash. The whale's private key is NOT available. The node is a
local Anvil instance, so development-time account controls are available. The
function must:

1. Tell the node to accept transactions sent from the client's account.
2. Transfer `amount` base units of USDC
   (`0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`) from that account to `to`, and
   ensure the transfer is mined before returning.
3. Undo step 1 (even if the transfer fails) so the node goes back to
   rejecting transactions from the client's account.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint (the Anvil fork) is available at `http://anvil:8545`. Do not add
any new dependencies.

When you are done, `npm run build` must pass.
