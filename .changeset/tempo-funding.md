---
"viem": patch
---

Added owner-authorized Tempo funding, native DEX helpers, exact-spend inference, funding policy management, and discovery with optional policy verification.

```ts
const policy = await client.fundingPolicy.getPolicy({ policyId: 1n })
```
