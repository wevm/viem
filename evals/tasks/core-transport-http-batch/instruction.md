Our network status widget polls several chain stats at once, and we want those
polls to cost a single HTTP round trip instead of one per stat.

Implement and export a zero-input `example()` function in `src/index.ts`.
Construct an Ethereum mainnet client at module scope with an HTTP transport
that coalesces concurrent requests into one JSON-RPC batch. Concurrently read
the latest block number, chain id, and current gas price, then return all three
values. Connect through `http://127.0.0.1:18545`; during grading this local
proxy forwards requests to the available node and records the HTTP batches.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
