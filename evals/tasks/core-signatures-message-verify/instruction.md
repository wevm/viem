Our API authenticates users by asking them to sign a human-readable text
message with their wallet, then checking that signature server-side. Checks
must also hold for smart contract wallets, so validate signatures against the
chain instead of only recovering an address locally.

Implement both functions in `src/index.ts`:

- `signPersonalMessage(options)`: receives an options object containing a
  private key and message, signs it with the standard Ethereum personal
  message scheme (EIP-191), and returns the hex signature.
- `verifySignature(client, options)`: receives a Viem client and an options
  object containing an address, message, and signature. It returns `true` when
  the signature is valid for that message and address, and `false` otherwise.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
