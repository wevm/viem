Our indexer needs to consume freshly produced blocks as a stream.

Implement `collectBlockNumbers` in `src/index.ts`. It receives a Viem client
first and an options object containing `count`, then observes newly produced
blocks and resolves with the block numbers (as bigints) of the next `count`
new blocks, in the order they were observed. Consume the incoming blocks with
a `for await...of` loop, and once `count` numbers have been collected, break
out and release the underlying observation so the function resolves promptly
instead of listening forever.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. While your function is
graded, new blocks are produced every few hundred milliseconds.

Do not add any new dependencies. When you are done, `npm run build` must pass.
