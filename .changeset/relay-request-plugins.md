---
"viem": minor
---

`viem/tempo`: Added a composable Relay RPC handler with batched preflight reads, simulation metadata reuse, and configurable request and time limits.

```ts
import { createClient, Relay, Store } from 'viem/tempo'

const relay = Relay.create({
  client: createClient(),
  maxRequests: 4,
  timeout: 10_000,
  plugins: [
    Relay.multisig({ store: Store.memory() }),
    Relay.simulate(),
    Relay.feePayer(),
    Relay.feeToken(),
  ],
})

export default { fetch: relay.fetch }
```
