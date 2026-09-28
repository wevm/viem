---
"viem": minor
---

Added a Fetch-based relay handler with composable plugins, replacing `Multisig.handleRequest`, `withMultisig`, and the `experimental_multisig` client option.

```ts
import { createClient, http } from 'viem'
import { tempo } from 'viem/chains'
import { Relay, Store } from 'viem/tempo'

const relay = Relay.create({
  client: createClient({ chain: tempo, transport: http() }),
  plugins: [
    Relay.multisig({ store: Store.memory() }),
    Relay.simulate(),
    Relay.feePayer(),
    Relay.autoSwap(),
    Relay.feeToken(),
  ],
})

export default { fetch: relay.fetch }
```
