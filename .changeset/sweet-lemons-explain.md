---
"viem": minor
---

Added `fees` to `chain` config that includes a `defaultPriorityFee` for setting a default priority fee (`maxFeePerGas`) for a chain.

```ts
import type { Chain } from 'viem'

export const example = {
  // ...
  fees: {
    defaultPriorityFee: 1_000_000n, // 0.001 gwei
    // or
    async defaultPriorityFee() {
      // ... some async behavior to derive the fee.
    }
  },
  // ...
} as const satifies Chain
```
