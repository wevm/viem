---
"viem": patch
---

`viem/tempo`: Added persistent multisig operation coordination and explicit owner approval actions.

```ts
import { Multisig, createClient, http } from 'viem/tempo'

const client = createClient({
  multisig: { store: Multisig.Store.memory() },
  transport: http(),
})

const operation = await client.multisig.approveTransaction({
  ...request,
  account: owner,
})
```
