Our exchange front end shows a user's balance the moment a deposit lands in
the mempool, before it is mined.

Export a client configured so reads default to the pending block instead of
the latest mined block. Implement `getPendingBalance` in `src/index.ts`. It
receives that client first and an options object containing an address, then
returns the address's balance in wei as a bigint, including the effects of
transactions still waiting to be mined. Use the `viem` library already
installed in this project. An Ethereum mainnet RPC endpoint is available at
`http://anvil:8545`. Do not add any new dependencies.

When you are done, `npm run build` must pass.
