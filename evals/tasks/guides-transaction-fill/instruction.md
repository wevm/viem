Our transaction service builds unsigned transfers for a downstream account that
cannot compute gas, fees, or nonces itself. The connected node is able to
complete a partially-specified transaction with every field required for
signing.

Implement `completeTransferRequest` in `src/index.ts`. It receives a Viem
client first and an options object containing:

- `from`, the address the transfer will be sent from.
- `to`, the recipient address.
- `amountEther`, a decimal string denominated in ether (e.g. `'0.25'`).

Build a request containing only the sender, recipient, and value, ask the node
to resolve every remaining field it needs (nonce, gas, fees, chain id, ...),
and return the completed transaction object.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
