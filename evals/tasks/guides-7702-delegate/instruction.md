Implement and export a zero-argument function named `example` in
`src/index.ts`.

The example should construct an account-bound Ethereum mainnet client at
module scope using private key
`0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`.
Deploy creation bytecode `0x69602a60005260206000f3600052600a6016f3`,
authorize the account to delegate to the deployed contract, submit the
self-executing EIP-7702 transaction, and return both the deployed address and
the account's active delegation.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add dependencies.
When you are done, `npm run build` must pass.
