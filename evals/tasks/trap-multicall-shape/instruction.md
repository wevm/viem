Our analytics service batches Ethereum contract reads into one request. It
needs the balance, total supply, and decimals for mainnet USDC at
`0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`; the balance belongs to
`0x28C6c06298d514Db089934071355E5743bf21d60`.

Implement and export a zero-input `example` function in `src/index.ts`. Create
an Ethereum mainnet client at module scope. Execute those three reads as one
batch that rejects if any call fails, preserving their decoded values in
order. Also issue a second batch containing one valid read and one nonexistent
view function to demonstrate that the whole batch rejects. Return the three
successful values and whether the mixed batch rejected. Only classify that
expected failed call as rejection; let unrelated errors propagate.

Use the `viem` library already installed in this project. The RPC endpoint is
available at `http://anvil:8545`. Do not add any new dependencies.

When you are done, `npm run build` must pass.
