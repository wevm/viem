Our monitoring service samples the first few blocks after boot, then must go
completely quiet.

Implement `collectNextBlockNumbers` in `src/index.ts`:

- It receives a Viem client first and an options object whose `seen` array is
  always empty when called. Each time it observes
  a new block, push that block's number (a `bigint`) into `seen`.
- Once 3 block numbers have been observed, resolve with those 3 numbers in
  observation order.
- It must stop observing entirely when it resolves: after the returned promise
  resolves, nothing may push into `seen` again, no matter how many more blocks
  the chain produces.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
