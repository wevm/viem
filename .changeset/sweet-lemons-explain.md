---
"viem": minor
---

Added `fees` to `chain` config that includes a `getDefaultPriorityFee` for setting a default priority fee for a chain.

```ts
import type { Chain } from 'viem'

export const example = {
  // ...
  fees: {
    getDefaultPriorityFee: () => 1_000_000n, // 0.001 gwei
  },
  // ...
} as const satifies Chain
```
