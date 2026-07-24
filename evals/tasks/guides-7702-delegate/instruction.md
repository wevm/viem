Our onboarding flow upgrades user accounts with EIP-7702: an externally owned
account designates a contract as its delegate, so calls to the account execute
that contract's code.

Implement `delegateAccount` in `src/index.ts`. It receives a Viem client bound
to the account being upgraded as its first argument and an options object
containing the `contractAddress` to delegate to.

The function must sign an EIP-7702 authorization designating `contractAddress`
as the account's delegate, broadcast the transaction that applies it (the
account submits this transaction itself), wait until it is confirmed on chain,
then look up and return the address the account now delegates to (or
`undefined` if it has no delegation).

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
