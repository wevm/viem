---
"viem": patch
---

Added configured policy rules to Tempo funding transports.

```ts
withFunding(http(), { policyId, policyRules, store: Store.memory() })
```
