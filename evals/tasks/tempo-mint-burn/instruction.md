Our Tempo issuance service creates a stablecoin, expands its supply, and
retires units it holds.

Implement and export a zero-input `example` function in `src/index.ts`. Create
a module-scoped Tempo localnet client for the account derived from private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`.
Create `Eval Supply Token` (`EVS`), grant that account issuance permission,
mint `12.5` tokens to itself and `3.25` tokens to
`0x4242424242424242424242424242424242424242`, then burn `4.25` tokens from
its own balance. Wait for every write and return the token address plus the
mint and burn results, including balances and total supply read after each.

The token is USD-denominated with 6 decimals. Use the installed `viem`,
`http://tempo:8545`, and a 100 ms polling interval. Do not add dependencies.

When you are done, `npm run build` must pass.
