---
"viem": minor
---

Added `fees` to `chain` config that includes a `getDefaultPriorityFee` for setting a default priority fee for a chain.

```ts
import { defineChain } from 'viem'
import { zora } from 'viem/chains'

export const example = defineChain(zora, {
  fees: {
    getDefaultPriorityFee: () => 1_000_000n, // 0.001 gwei
  },
})
```
