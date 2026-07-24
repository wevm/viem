Our RPC provider has been having outages, so we keep backup endpoints on hand.

Implement two functions in `src/index.ts`:

- `createTransport(options)` receives an options object containing RPC
  endpoint URLs in priority order and returns one fallback transport. Some
  URLs may be unreachable, so it must try the next URL when one fails.
- `getBlockNumber(client)` receives a client using that transport and returns
  the current block number as a bigint.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
