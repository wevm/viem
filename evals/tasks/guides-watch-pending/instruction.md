Implement and export a zero-argument function named `example` in
`src/index.ts`.

Construct an account-bound Ethereum mainnet client at module scope using
private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`.
Disable automatic mining, start watching pending transactions, submit a
one-wei transfer to `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`, stop
watching after the first hash arrives through the watcher's async iterator,
and return both the submitted and observed hashes. Restore automatic mining
and mine the pending transaction before returning.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add dependencies.
When you are done, `npm run build` must pass.
