Our portfolio dashboard shows a wallet's balance across a user-provided token
list. Token lists are messy: an entry sometimes points at an address that is
not a token contract at all, and one bad entry must not break the whole view.

Export a zero-input `example()` function from `src/index.ts`. It should read the
following token balances for holder
`0x28C6c06298d514Db089934071355E5743bf21d60`, in this order:

- USDC: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- Multicall3, which is not a token:
  `0xcA11bde05977b3631167028862bE2a173976CA11`
- WETH: `0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2`

Fetch all three balances concurrently through one automatic multicall batch.
Return one settled result per address in the same order, including each
successful token balance or failure.

The function must not reject because the middle entry is not a token. Create
the Ethereum mainnet client at module scope with the available RPC endpoint.

Use the `viem` library already installed in this project. An Ethereum mainnet
RPC endpoint is available at `http://anvil:8545`. Do not add any new
dependencies.

When you are done, `npm run build` must pass.
