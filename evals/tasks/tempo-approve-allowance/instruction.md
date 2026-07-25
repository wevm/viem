Our Tempo payments service lets a partner pull pathUSD from a customer.

Implement and export a zero-input `example` function in `src/index.ts`. Create
module-scoped Tempo localnet clients for the owner from private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
and the spender from private key
`0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`.
Approve the spender for `75.5` pathUSD, read the allowance, then have the
spender move `20.25` pathUSD from the owner to
`0x4545454545454545454545454545454545454545`. Read the remaining allowance
and return both writes and allowance values.

pathUSD is `0x20c0000000000000000000000000000000000000`
with 6 decimals. Use the installed `viem`, `http://tempo:8545`, and a 100 ms
polling interval. Do not add dependencies.

When you are done, `npm run build` must pass.
