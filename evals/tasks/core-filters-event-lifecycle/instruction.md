Our indexer sweeps ERC-20 activity in short, on-demand passes and must not
leak state on the node between passes.

Implement `collectTransfers` in `src/index.ts`. It receives a Viem client first
and an options object containing a token contract address and starting block
number. It should:

1. Register a filter on the node that matches the token's
   `Transfer(address indexed from, address indexed to, uint256 value)` events
   from the starting block onward.
2. Poll the filter once and decode the accumulated matches.
3. Remove the filter from the node.

Return `{ transfers, uninstalled }`, where `transfers` is an array of
`{ from, to, value }` objects (addresses as hex strings, `value` as a bigint)
in emission order, and `uninstalled` reports whether the node confirmed the
filter's removal.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
