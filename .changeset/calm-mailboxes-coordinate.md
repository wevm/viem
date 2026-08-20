---
"viem": patch
---

`viem/tempo`: Added persistent multisig operation coordination.

```ts
import { Multisig, createClient, http } from 'viem/tempo'

const client = createClient({
  multisig: { store: Multisig.Store.memory() },
  transport: http(),
})
```
