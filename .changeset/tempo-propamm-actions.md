---
"viem": patch
---

Added propAMM pool reads, route-aware quotes, and exact-input and exact-output swaps with batched input approvals to `viem/tempo`.

```ts
const { amountOut, price, updatedAt } = await client.propAmm.getSwapQuote({
  amountIn,
  baseToQuote: true,
  customerId,
  mode: 'exactInput',
  pool,
  recipient,
  taker: client.account.address,
})

await client.propAmm.swapSync({
  amountIn,
  baseToQuote: true,
  customerId,
  mode: 'exactInput',
  deadline,
  expectedOraclePrice: price,
  minAmountOut: amountOut,
  minimumOracleUpdatedAt: updatedAt,
  oraclePriceToleranceBps: 0n,
  pool,
  recipient,
  tradeId,
})
```
