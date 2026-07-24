Our indexer needs a live feed of new blocks as they are produced.

Implement `collectBlockNumbers` in `src/index.ts`. It receives a
WebSocket-backed Viem client first and an options object containing `count`.
Subscribe to new block numbers as they arrive, collect the first `count` of
them (as bigints, in arrival order), stop watching so nothing more is
recorded, and resolve with the collected values. Do not close the supplied
client or its transport.

An Ethereum mainnet node is available at `http://anvil:8545`; the same node
exposes a WebSocket endpoint at `ws://anvil:8545`. Connect over the WebSocket
endpoint. Use the `viem` library already installed in this project. Do not add
any new dependencies.

When you are done, `npm run build` must pass.
