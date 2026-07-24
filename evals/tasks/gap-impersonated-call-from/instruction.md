Before our payouts service queues a USDC transfer for signing, it dry-runs the
transfer to catch failures early.

Implement `wouldTransferSucceed` in `src/index.ts`. It receives a Viem client
first and an options object containing the prospective sender address and a
bigint amount in base units. Without submitting any transaction, execute a
USDC `transfer(address,uint256)` of that amount to
`0x70997970C51812dc3A010C7d01b50e0d17dc79C8` against current chain state, with
the prospective sender as the caller (`msg.sender`). Return `true`
if the transfer would succeed and `false` if it would revert. USDC is at
`0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`. `from` can be any address; the
service does not control it and has no private key for it.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
