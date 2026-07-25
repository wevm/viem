Implement and export a zero-argument function named `example` in
`src/index.ts`.

Construct an account-bound Ethereum mainnet client at module scope using
private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`.
Prepare every required field for a 1 ETH transfer to
`0x4242424242424242424242424242424242424242`, sign it locally, broadcast the
raw transaction, wait for confirmation, and return its hash and receipt.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add dependencies.
When you are done, `npm run build` must pass.
