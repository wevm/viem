Our Tempo checkout grants an allowance and pays a merchant atomically.

Implement and export a zero-input `example` function in `src/index.ts`. Create
a module-scoped Tempo localnet client for the account derived from private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`.
In one transaction, approve
`0x5151515151515151515151515151515151515151` for `25.5` pathUSD and transfer
`10.5` pathUSD to `0x5252525252525252525252525252525252525252`.
Wait for confirmation and return the receipt. Both operations must share one
signature and transaction hash.

pathUSD is `0x20c0000000000000000000000000000000000000`
with 6 decimals. Use the installed `viem`, `http://tempo:8545`, and a 100 ms
polling interval. Do not add dependencies.

When you are done, `npm run build` must pass.
