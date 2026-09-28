---
"viem": minor
---

Added plugin-defined transport metadata to relay composition.

```ts
import { http } from 'viem'
import { Relay, withRelay } from 'viem/tempo'

const plugin = {
  transport: { service: 'payments' as const },
} satisfies Relay.Plugin

const transport = withRelay(http(), { plugins: [plugin] })
```
