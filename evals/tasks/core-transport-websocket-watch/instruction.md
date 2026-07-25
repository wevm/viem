Our indexer needs a live feed of new blocks as they are produced.

Implement and export a zero-input `example()` function in `src/index.ts`.
Construct an Ethereum mainnet WebSocket client at module scope. Subscribe to
new block numbers, collect the first three as bigints in arrival order, stop
watching, close the private transport, and return the collected values.

An Ethereum mainnet node is available at `http://anvil:8545`; the same node
exposes a WebSocket endpoint at `ws://anvil:8545`. Use the `viem` library
already installed in this project. Do not add any new dependencies.

When you are done, `npm run build` must pass.
