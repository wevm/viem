Our indexer needs to consume freshly produced blocks as a stream.

Implement and export a zero-input `example()` function in `src/index.ts`.
Construct an Ethereum mainnet client at module scope with a 200 ms polling
interval. Observe newly produced blocks as a stream, consume them with a
`for await...of` loop, and return the next three block numbers as bigints in
observation order. Release the observation after the third block.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. While your function is
graded, new blocks are produced every few hundred milliseconds.

Do not add any new dependencies. When you are done, `npm run build` must pass.
