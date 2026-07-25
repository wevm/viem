Our Tempo payments service fans out three pathUSD payouts concurrently using
independent two-dimensional nonce keys.

Implement and export a zero-input `example` function in `src/index.ts`. Create
a module-scoped Tempo localnet client for the account derived from private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`.
Submit these transfers concurrently and wait for all three:

- `1.5` pathUSD to `0x5151515151515151515151515151515151515151` on key `77001`
- `2.25` pathUSD to `0x5252525252525252525252525252525252525252` on key `77002`
- `3.75` pathUSD to `0x5353535353535353535353535353535353535353` on key `77003`

Read each resulting on-chain nonce and also read unused key `606060606`.
Return the receipts and nonce values. pathUSD is
`0x20c0000000000000000000000000000000000000` with 6 decimals. Use the
installed `viem`, `http://tempo:8545`, and a 100 ms polling interval.
Do not add dependencies.

When you are done, `npm run build` must pass.
