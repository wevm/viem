Our relayer pins the tip it pays validators: every transaction must offer a
priority fee of exactly 3 gwei instead of whatever the network suggests.

Implement and export a zero-input `example()` function in `src/index.ts`.
Define a custom chain with chain id 1, RPC URL `http://anvil:8545`, and a fee
configuration that fixes the priority fee at 3 gwei. Construct its client at
module scope. Return the chain and the estimated maximum fee and priority fee
for an EIP-1559 transaction. The priority fee must be exactly 3 gwei, and the
maximum fee must account for the current base fee on top of it.

Use the `viem` library already installed in this project. An Ethereum
mainnet RPC endpoint is available at `http://anvil:8545`. Do not add any
new dependencies.

When you are done, `npm run build` must pass.
