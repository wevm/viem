Before broadcasting transactions, our infra team wants to preview which
accounts and storage slots a contract call will touch, as an EIP-2930 access
list.

Implement `buildAccessList` in `src/index.ts`. It receives a Viem client first
and an options object describing a contract call with an `abi`, contract
`address`, `functionName`, and optional `args`. Return the access list for that
call (each entry an account address with the storage keys it touches) together
with the gas the call consumed.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
