Our payout worker broadcasts several payments from one hot wallet at once,
and sequential sends are too slow.

Implement and export a zero-input `example()` function in `src/index.ts`.
Construct an Ethereum mainnet client at module scope, bound to the funded
development account whose private key is
`0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6`,
and configure that account to allocate nonces safely across concurrent sends.

Concurrently send `0.001`, `0.002`, `0.003`, `0.004`, and `0.005` ETH to
`0x4242424242424242424242424242424242424242`. Do not wait for one transfer
before broadcasting the next. Return the transaction hashes in amount order.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
