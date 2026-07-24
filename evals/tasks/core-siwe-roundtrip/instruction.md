Our web app authenticates users with Sign-In with Ethereum (EIP-4361): the
backend issues a nonce, the wallet signs a structured sign-in message, and the
backend checks the signature and nonce before opening a session.

Implement three functions in `src/index.ts`:

- `buildSignInMessage(options)`: given `address`, `domain`, `nonce`, and
  `uri`, return the EIP-4361 message string for Ethereum mainnet (chain id 1),
  spec version 1.
- `signSignInMessage(options)`: receive an options object containing a private
  key and message, sign it the way a wallet signs plain text (EIP-191 personal
  message), and return the hex signature.
- `verifySignIn(client, options)`: receive a Viem client and an options object
  containing `message`, `nonce`, and `signature`. Return `true` only if the
  signature was produced by the account named in the message and the message's
  nonce matches the expected `nonce`. Return `false` otherwise; do not throw.
  Check signatures through the node so contract wallets can be supported
  later.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
