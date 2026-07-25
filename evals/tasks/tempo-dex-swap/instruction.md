Our trading desk lists a USD stablecoin on Tempo's enshrined DEX and buys exact
amounts from its order book.

Implement and export a zero-input `example` function in `src/index.ts`. Create
module-scoped Tempo localnet clients for the maker derived from private key
`0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
and the taker derived from
`0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`.

Create a USD TIP-20 token named `Eval Market` with symbol `EVAL`, grant the
maker issuance permission, mint exactly 1,000,000 tokens, and list its pathUSD
pair. Rest a 500-token sell order at tick 100. Quote and buy exactly 25 tokens,
using that quote as the maximum input, then quote and buy another 10 tokens the
same way. Wait for every write to confirm and return the market, resting order,
both quotes, and both buy results.

Tokens have 6 decimals. pathUSD is
`0x20c0000000000000000000000000000000000000`. Use the installed `viem`,
`http://tempo:8545`, and a 100 ms polling interval. Do not add dependencies.

When you are done, `npm run build` must pass.
