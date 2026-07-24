Our payment service holds a raw secp256k1 private key for its hot wallet.
Company audit policy requires that every signature is produced by one
hash-signing function we write ourselves: it takes a 32-byte hash and returns
the hex signature computed with the key. The sending identity must be built
around that single signing function (plus the key's public key or address).
Do not pass the raw key to a ready-made key-to-account helper.

Implement `sendEth` in `src/index.ts`. It receives a Viem client as its first
argument and an options object containing the raw private key, recipient
address, and amount in wei. It must send that amount of ETH from the key's
address to the recipient, wait for the transaction to be mined, and return an
object with at least the receipt's `from`, `status`, and `transactionHash`.
Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
