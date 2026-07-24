Our network status widget polls several chain stats at once, and we want those
polls to cost a single HTTP round trip instead of one per stat.

Implement two functions in `src/index.ts`:

- `createTransport(options)` receives an options object containing a JSON-RPC
  URL and returns an HTTP transport configured to coalesce concurrent requests
  into one batch.
- `getNetworkSnapshot(client)` receives a client using that transport and
  returns the latest block number, chain id, and current gas price. Issue the
  three reads concurrently so they are sent in one POST carrying all three
  calls.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
