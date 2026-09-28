---
"viem": minor
---

Added a Fetch-based relay handler with composable plugins, replacing `Multisig.handleRequest`, `withMultisig`, and the `experimental_multisig` client option.

Fixed relay metadata lookup limits, retry amplification, and execution-error handling.

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
