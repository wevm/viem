---
"viem": patch
---

Added coordinated native Tempo multisig transactions and explicit initial or current configuration witnesses for multisig accounts.

```ts
import { Account } from 'viem/tempo'

const initial = Account.fromMultisig({
  address: 'initial',
  owners: ['0x0000000000000000000000000000000000000001'],
})
const current = Account.fromMultisig({
  address: initial.address,
  ...initial.config,
  version: 1,
})
const addressOnly = Account.fromMultisig(initial.address)
```
