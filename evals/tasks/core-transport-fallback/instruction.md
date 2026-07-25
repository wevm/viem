Our RPC provider has been having outages, so we keep backup endpoints on hand.

Implement and export a zero-input `example()` function in `src/index.ts`.
Construct an Ethereum mainnet client at module scope with the unreachable
`http://anvil:1` endpoint first and `http://anvil:8545` second. The transport
must fall through to the next endpoint after a failure. Return the current
block number as a bigint.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
