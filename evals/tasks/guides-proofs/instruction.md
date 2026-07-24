Our audit tooling needs to verify a contract's storage against a block's
state root without trusting the RPC provider.

Implement `getStorageProof` in `src/index.ts`. It receives a Viem client first
and an options object containing a contract address and a single 32-byte
storage key. Return the account's Merkle proof data
for the latest block: the account proof nodes, the account's storage root, and
a proof entry for the requested key.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
