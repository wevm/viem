Our token dashboard shows an activity feed for a single ERC-20 token: past
transfers on load, then a live update the moment the next transfer lands.

Implement two functions in `src/index.ts`:

1. `getTransferHistory(client, { token, fromBlock, toBlock })` returns the token
   contract's `Transfer(address indexed from, address indexed to, uint256 value)`
   events between the two block numbers (inclusive), decoded and in emission
   order, as `{ from, to, value }` objects (addresses as hex strings, `value`
   as a bigint). Only events emitted by the given token contract count.

2. `waitForNextTransfer(client, { token })` observes the chain, resolves with the token
   contract's next `Transfer` event decoded the same way, and stops observing
   before it resolves.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
