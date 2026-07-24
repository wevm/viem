Our analytics service issues many small contract reads and we want them to hit
the node as a single batched request instead of one round trip per read.

Implement `batchRead` in `src/index.ts`. It receives a Viem client first and
an options object whose `reads` list contains descriptors with `to`, `abi`,
`functionName`, and optional `args`, and
must execute all of them against the chain in one
batched request, resolving with the decoded return values in the same order as
the input list. If any read fails, the whole batch must reject.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
