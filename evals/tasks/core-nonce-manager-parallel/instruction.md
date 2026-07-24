Our payout worker broadcasts several payments from one hot wallet at once,
and sequential sends are too slow.

In `src/index.ts`, define and export a module-scoped `client` connected to the
available RPC endpoint on Ethereum mainnet. Bind it to the funded development
account whose private key is
`0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6`,
and configure that account to allocate nonces safely across concurrent sends.

Implement `sendParallelTransfers` in the same file. It receives the client
first, followed by an options object containing a recipient address and list
of amounts in wei. For each amount, sign and broadcast an ETH transfer from
the client's account to the recipient. Submit all transfers concurrently; do
not wait for one to confirm before sending the next. Every transfer must still
get mined successfully, so concurrent sends must not collide on or reuse a
nonce. Return the transaction hashes in the same order as the amounts.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
