---
"viem": minor
---

Added wallet-managed access key authorization for JSON-RPC accounts with an account-dependent return type.

```ts
import { Expiry } from 'viem/tempo'

const { keyAuthorization, rootAddress } = await client.accessKey.authorize({
  expiry: Expiry.hours(1),
  fundingPolicy: true,
})
```
