Our payment service holds a raw secp256k1 private key for its hot wallet.
Company audit policy requires that every signature is produced by one
hash-signing function we write ourselves: it takes a 32-byte hash and returns
the hex signature computed with the key. The sending identity must be built
around that single signing function (plus the key's public key or address).
Do not pass the raw key to a ready-made key-to-account helper.

Implement and export a zero-input `example()` function in `src/index.ts`.
Construct an Ethereum mainnet client at module scope. Build a signing identity
around one hash-signing function using private key
`0xf71f379f68c738d29b7a90474497eb9ce74c699bb9ada94bda359f8c2f101263`.
Send 1 ETH to `0x4242424242424242424242424242424242424242`, wait for the
transaction to be mined, and return its receipt.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
