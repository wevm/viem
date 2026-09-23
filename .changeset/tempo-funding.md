---
"viem": patch
---

Added owner-authorized Tempo funding requirements, native DEX source helpers, and inferred targets for exact-spend actions.

```ts
await client.sendTransaction({
  requireFunds: [{ token, amount: 50_000_000n, sources }],
  calls: [payment],
})
```
