Our payments service sends USDC on Ethereum mainnet from amounts users type
into a form, like `'1.5'`.

Implement `transferUsdc` in `src/index.ts`. It receives a Viem client bound to
the sender first and an options object containing a recipient address and a
human-readable decimal amount.

- The client's account is already funded with ETH and USDC.
- `amount` is a human-readable decimal amount of USDC, e.g. `'1.5'` means
  1.5 USDC (USDC lives at `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48` and has
  6 decimals).
- Send that amount of USDC from the sender to `to`, wait for the transaction
  to be confirmed, and return the transaction receipt.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
