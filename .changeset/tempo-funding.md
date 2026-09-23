---
"viem": patch
---

Added owner-authorized Tempo funding requirements to transaction preparation, signing, formatting, and execution.

```ts
await client.sendTransaction({
  requireFunds: [{ token, amount: 50_000_000n, sources }],
  calls: [payment],
})
```
