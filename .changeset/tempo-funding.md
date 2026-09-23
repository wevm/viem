---
"viem": patch
---

Added owner-authorized Tempo funding requirements to transactions and token actions.

```ts
await client.sendTransaction({
  requireFunds: [{ token, amount: 50_000_000n, sources }],
  calls: [payment],
})
```
