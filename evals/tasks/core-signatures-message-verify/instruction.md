Our API authenticates users by asking them to sign a human-readable text
message with their wallet, then checking that signature server-side. Checks
must also hold for smart contract wallets, so validate signatures against the
chain instead of only recovering an address locally.

Implement and export a zero-input `example()` function in `src/index.ts`.
Construct an Ethereum mainnet client at module scope. Sign
`viem evals: prove account ownership` with private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
using the standard Ethereum personal-message scheme.

Verify the signature against the chain for the matching address, the changed
message `viem evals: prove account 0wnership`, and the wrong address
`0x70997970C51812dc3A010C7d01b50e0d17dc79C8`. Return the signature and all
three verification results.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
