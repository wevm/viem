Implement and export a zero-argument function named `example` in
`src/index.ts`.

At module scope, wrap the Ethereum mainnet HTTP transport so every forwarded
request increments one cumulative counter, then construct a client with that
transport and caching disabled. Read the block number twice and return both
block numbers together with the counter after each read.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add dependencies.
When you are done, `npm run build` must pass.
