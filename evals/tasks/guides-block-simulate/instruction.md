Before batching payouts, our service wants to preview how a set of ETH
transfers would execute, without broadcasting anything.

Implement `simulateTransfers` in `src/index.ts`. It receives a Viem client
first and an options object containing a sender address (`from`) and a list of
transfers (`{ to, value }` with `value` in wei). Execute all transfers as calls
within a single simulated block on top of current chain state, and return one
result per transfer in order: `{ status, gasUsed }`,
where `status` is `'success'` or `'failure'` and `gasUsed` is the gas the call
consumed. It must not send any transaction or otherwise change on-chain state.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
