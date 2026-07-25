Our payout service signs everything with a single operator key, and we do not
want to thread the sender through every call.

Implement and export a zero-input `example()` function in `src/index.ts`.
Construct an Ethereum mainnet client at module scope and bind it to the
development account with private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`.
Send 1.25 ETH to `0x4242424242424242424242424242424242424242`
without naming a sender in the transfer itself, wait for confirmation, and
return the receipt.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
