---
"viem": patch
---

Added Tempo transaction funding requirements, funding policies with optional source ordering, source discovery, and the `Relay.funding` plugin.

```ts
import { http } from 'viem'
import { Relay, withRelay } from 'viem/tempo'

const transport = withRelay(http(), {
  plugins: [Relay.funding()],
})
```
