---
"viem": patch
---

Added coordinated native Tempo multisig transactions and explicit initial or current configuration witnesses for multisig accounts.

```ts
import { Account } from 'viem/tempo'

const initial = Account.fromMultisig({
  initialConfig: {
    owners: ['0x0000000000000000000000000000000000000001'],
  },
})
const current = Account.fromMultisig({
  address: initial.address,
  config: { ...initial.config, version: 1 },
})
const addressOnly = Account.fromMultisig(initial.address)
```
