Our web app authenticates users with Sign-In with Ethereum (EIP-4361): the
backend issues a nonce, the wallet signs a structured sign-in message, and the
backend checks the signature and nonce before opening a session.

Implement and export a zero-input `example()` function in `src/index.ts`.
Construct an Ethereum mainnet client at module scope. Build a version 1
EIP-4361 message for:

- address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- domain: `example.com`
- nonce: `foobarbaz12`
- URI: `https://example.com/login`
- chain id: `1`

Sign it as a personal message with private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`.
Check the signature through the node with the correct nonce and with
`deadbeef00`. Also sign the message with
`0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
and verify that signature against the address in the message. Return the
message, original signature, and all three verification results.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
