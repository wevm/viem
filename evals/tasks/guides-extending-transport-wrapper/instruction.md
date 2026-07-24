Our platform team wants visibility into how many JSON-RPC requests our app
actually sends to its RPC provider, without touching any of the calling code.

Implement `counted` and `readBlockNumber` in `src/index.ts`:

- `counted({ transport })` returns a wrapping transport layer that delegates
  every JSON-RPC request to the supplied transport and counts each request it
  forwards.
- `readBlockNumber(client)` reads the current block number twice through a single
  client backed by that wrapper, then returns `{ blockNumber, requestCount }`:
  `blockNumber` is the latest read (a bigint) and `requestCount` is the total
  number of requests the wrapper has forwarded so far (a number).
- Every read must go over the wire. The caller creates the client with
  `cacheTime: 0` and the transport returned by `counted`.
- The count is cumulative for the lifetime of the process: calling
  `readBlockNumber` again keeps counting up from the previous total instead of
  resetting.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
