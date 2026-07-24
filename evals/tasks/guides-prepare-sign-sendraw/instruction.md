Our payment service keeps its signing key off the hot path: a transaction is
fully assembled first, signed locally with the key, and only the resulting
raw signed payload is submitted to the network.

Implement `sendRawPayment` in `src/index.ts`. It receives a Viem client bound
to the locally signing account first and an options object:

- `sendRawPayment(client, { to, amountEther })` sends `amountEther` (a decimal
  string of ether, e.g. `'1'`) from the client's account to `to`.
- Assemble the complete transaction request first (nonce, chain id, gas, and
  fees resolved), sign it locally with the private key to produce the
  serialized signed transaction, then broadcast that raw payload to the node.
  The node must never sign or send on the account's behalf (no
  `eth_sendTransaction`).
- Wait for the transaction to be mined, then return `{ hash, receipt }` where
  `hash` is the transaction hash and `receipt` is the mined receipt.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
