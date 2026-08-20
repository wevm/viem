---
"viem": patch
---

`viem/tempo`: Added persistent multisig coordination and renamed Zone storage options to `store`.

```ts
import { createClient, http } from 'viem/tempo'

const client = createClient({
  experimental_multisig: true,
  transport: http(),
})

const pending = await client.multisig.approveTransaction({
  account: owner_1,
  calls,
  multisig: account,
})

const success = await client.multisig.approveTransaction({
  ...pending.request,
  account: owner_2,
})
```
