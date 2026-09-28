---
"viem": minor
---

Added a Relay RPC handler with a composable plugin mechanism.

```ts
import { createClient, Relay, Store } from 'viem/tempo'

const relay = Relay.create({
  client: createClient(),
  plugins: [
    Relay.multisig({ store: Store.memory() }),
    Relay.simulate(),
    Relay.feePayer(),
    Relay.feeToken(),
  ],
})

export default { fetch: relay.fetch }
```
