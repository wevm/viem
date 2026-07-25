Our treasury dashboard tracks Vault USD (`VUSD`), a USD-denominated token with
6 decimals. In this environment its mainnet contract is
`0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`.

Implement and export a zero-input `example` function in `src/index.ts`. Define
Vault USD at module scope, attach that definition to a module-scoped Ethereum
mainnet client, and use its `VUSD` symbol to read the balance of
`0x28C6c06298d514Db089934071355E5743bf21d60`. Return the amount in base units,
the token decimals, and the formatted balance.

Use the `viem` library already installed in this project. The RPC endpoint is
available at `http://anvil:8545`. Do not add any new dependencies.

When you are done, `npm run build` must pass.
