Our relayer pins the tip it pays validators: every transaction must offer a
priority fee of exactly 3 gwei instead of whatever the network suggests.

Export a custom `chain` from `src/index.ts` with chain id 1, RPC URL
`http://anvil:8545`, and a fee configuration that fixes the priority fee at
3 gwei. Implement `estimateFees` so it receives a client configured with that
chain and returns the estimated `maxFeePerGas` and `maxPriorityFeePerGas`
(both bigint, in wei) for an EIP-1559 transaction. The returned
`maxPriorityFeePerGas` must be exactly 3 gwei, and `maxFeePerGas` must account
for the current base fee on top of it.

Use the `viem` library already installed in this project. An Ethereum
mainnet RPC endpoint is available at `http://anvil:8545`. Do not add any
new dependencies.

When you are done, `npm run build` must pass.
