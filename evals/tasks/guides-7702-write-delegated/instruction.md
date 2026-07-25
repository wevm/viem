Implement and export a zero-argument function named `example` in
`src/index.ts`.

Construct an account-bound Ethereum mainnet client at module scope using
private key
`0xd52ca50b7cca7d19e9a2301bd3a1bb5a471db800093e8823db7f9f49f6bed834`.
The account is already delegated to an implementation exposing
`store(uint256)` and `retrieve()`. Write `741852963` through the account,
read it back through the same account address, and return the stored bigint.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add dependencies.
When you are done, `npm run build` must pass.
