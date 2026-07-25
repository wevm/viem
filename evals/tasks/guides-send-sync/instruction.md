Implement and export a zero-argument function named `example` in
`src/index.ts`.

Construct an account-bound Ethereum mainnet client at module scope using
private key
`0xf71f379f68c738d29b7a90474497eb9ce74c699bb9ada94bda359f8c2f101263`.
Send 0.5 ETH to `0x4242424242424242424242424242424242424242` and return the
confirmed receipt directly, without a separate receipt-waiting step.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add dependencies.
When you are done, `npm run build` must pass.
