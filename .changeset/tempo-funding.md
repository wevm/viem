---
"viem": patch
---

Added owner-authorized Tempo funding, native DEX source helpers, exact-spend inference, and funding policy management and discovery actions.

```ts
const policy = await client.fundingPolicy.getPolicy({ policyId: 1n })
```
