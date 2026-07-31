---
'viem': minor
---

Added `Account.fromPrf` to derive local secp256k1 accounts from WebAuthn PRF output.

```ts
import { Account } from 'viem'
import { WebAuthn } from 'viem/utils'

const credential = await WebAuthn.createCredential({
  name: 'Example',
  prf: true,
})
const account = Account.fromPrf(credential.prf)
```
