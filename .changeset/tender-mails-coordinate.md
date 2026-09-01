---
"viem": patch
---

Added coordinated Tempo multisig transactions, key authorizations, config resolution, and canonical CREATE2 account derivation for the updated TIP-1061 protocol.

```ts
import { Account } from 'viem/tempo'

const initial = Account.fromMultisig({
  address: 'infer',
  owners: ['0x0000000000000000000000000000000000000001'],
})
const current = Account.fromMultisig({
  address: initial.address,
  ...initial.config,
  version: 1,
})
const addressOnly = Account.fromMultisig(initial.address)
```
