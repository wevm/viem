---
"viem": minor
---

**Breaking (`viem/tempo`):** `chainId` is now required when signing access key authorizations with `signKeyAuthorization`. It is recommended to use `client.accessKey.signAuthorization` instead for inferred chain ID.

```diff
import { client } from './viem.config'
import { Account } from 'viem/tempo'

const account = Account.from({ privateKey: '0x...' })
const accessKey = Account.fromP256(generatePrivateKey(), {
  access: account,
})

- const keyAuthorization = await account.signKeyAuthorization(accessKey)
+ const keyAuthorization = await client.accessKey.signAuthorization({
+   account,
+   accessKey,
+ })
```