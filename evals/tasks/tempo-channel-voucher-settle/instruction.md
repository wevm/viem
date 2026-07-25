Our machine-payments service uses Tempo payment channels and off-chain
vouchers.

Implement and export a zero-input `example` function in `src/index.ts`. Create
module-scoped Tempo localnet clients for the payer derived from private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
and the payee derived from
`0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`.
Use pathUSD for transaction fees.

Open a 100 AlphaUSD channel to the payee, sign a voucher for a cumulative 32.5
AlphaUSD with the payer, and settle it with the payee. Repeat the workflow in a
fresh 10 AlphaUSD channel with a 0.75 AlphaUSD voucher. Wait for every write to
confirm and return both opened channels and settlements.

AlphaUSD is `0x20c0000000000000000000000000000000000001` and pathUSD is
`0x20c0000000000000000000000000000000000000`. Both have 6 decimals. Use the
installed `viem`, `http://tempo:8545`, and a 100 ms polling interval. Do not
add dependencies.

When you are done, `npm run build` must pass.
