Our payments service needs a helper that pays users in ETH.

Implement `sendEth` in `src/index.ts`. It receives a Viem client bound to the
sending account first and an options object containing:

- `to`, the recipient address.
- `amountEther`, a decimal string denominated in ether (e.g. `'1.5'`).

The function must sign and broadcast the transfer, wait until the transaction
is confirmed on chain, and return the transaction receipt.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
