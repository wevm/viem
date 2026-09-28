---
"viem": minor
---

Added a Fetch-based relay handler with context-based middleware and concurrent post-fill plugin hooks, replacing `Multisig.handleRequest`, `withMultisig`, and the `experimental_multisig` client option.

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
