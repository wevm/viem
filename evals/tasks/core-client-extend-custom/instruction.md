Our services share a single on-chain client, and operations wants a quick
node health probe hanging off that same client.

Implement and export a zero-input `example()` function in `src/index.ts`.
Construct an Ethereum mainnet client at module scope and extend it so it:

- exposes viem's standard read methods directly on the client (other modules
  call them on the client to fetch chain data such as the latest block number),
  and
- exposes a custom `health` namespace, where `client.health.check()` resolves
  to `{ blockNumber, chainId }`: the node's current block number as a bigint
  and the node's chain id as a number.

Use the extended client to return its chain, the health result, and the latest
block number read through its standard methods.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
