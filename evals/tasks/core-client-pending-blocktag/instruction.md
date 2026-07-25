Our exchange front end shows a user's balance the moment a deposit lands in
the mempool, before it is mined.

Implement and export a zero-input `example()` function in `src/index.ts`.
Construct an Ethereum mainnet client at module scope whose reads default to
the pending block. Return the balance of
`0x1111000000000000000000000000000000001111` in wei, including the effects of
transactions waiting to be mined.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
